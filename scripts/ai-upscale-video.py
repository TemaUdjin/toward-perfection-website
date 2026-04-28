#!/usr/bin/env python3
"""
AI Video Upscaler — Real-ESRGAN x4plus через PyTorch MPS (Apple Silicon)

Использование:
  python3 scripts/ai-upscale-video.py <input.mp4> <output.mp4> [outscale]

Примеры:
  python3 scripts/ai-upscale-video.py app/public/hero.mp4 app/public/hero-ai.mp4
  python3 scripts/ai-upscale-video.py app/public/hero.mp4 app/public/hero-ai.mp4 2

Зависимости (установить один раз):
  pip3 install torch torchvision basicsr facexlib gfpgan realesrgan

Детали:
  - Модель: RealESRGAN_x4plus (скачивается автоматически ~64MB при первом запуске)
  - outscale=2 означает: 4x апскейл нейросетью, потом даунскейл до 2x от оригинала
  - Устройство: MPS (Apple Silicon GPU) → CPU как fallback
  - Поддержка resume: пропускает уже обработанные кадры
  - Финальное видео: H.264, CRF 18, faststart, bt709
"""

import sys, types, os, subprocess
from pathlib import Path

# ── Monkey-patch: torchvision.transforms.functional_tensor удалён в 0.16+ ──
import torchvision.transforms.functional as _F
_m = types.ModuleType('torchvision.transforms.functional_tensor')
_m.rgb_to_grayscale = _F.rgb_to_grayscale
sys.modules['torchvision.transforms.functional_tensor'] = _m
# ─────────────────────────────────────────────────────────────────────────────

import torch
import numpy as np
from PIL import Image
from basicsr.archs.rrdbnet_arch import RRDBNet
from realesrgan import RealESRGANer

FFMPEG = Path(os.path.expanduser('~/bin/ffmpeg'))

def upscale(src: Path, dst: Path, outscale: int = 2):
    frames_dir = Path('/tmp/ai_upscale_frames')
    upscaled_dir = Path('/tmp/ai_upscale_output')
    frames_dir.mkdir(exist_ok=True)
    upscaled_dir.mkdir(exist_ok=True)

    # 1. Извлечь кадры
    print(f'▶ Extracting frames from {src.name}...')
    subprocess.run([str(FFMPEG), '-i', str(src), '-q:v', '2',
                    str(frames_dir / '%05d.png'), '-y'], check=True,
                   capture_output=True)
    frames = sorted(frames_dir.glob('*.png'))
    print(f'  {len(frames)} frames')

    # 2. Загрузить модель
    device = torch.device('mps' if torch.backends.mps.is_available() else 'cpu')
    print(f'▶ Loading RealESRGAN_x4plus on {device}...')
    model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64,
                    num_block=23, num_grow_ch=32, scale=4)
    upsampler = RealESRGANer(
        scale=4,
        model_path='https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth',
        model=model, tile=512, tile_pad=10, pre_pad=0, half=False, device=device,
    )

    # 3. Обработать кадры
    print(f'▶ Upscaling {len(frames)} frames (outscale={outscale}x)...')
    for i, fp in enumerate(frames):
        out = upscaled_dir / fp.name
        if out.exists():
            continue
        img = np.array(Image.open(fp).convert('RGB'))
        result, _ = upsampler.enhance(img, outscale=outscale)
        Image.fromarray(result).save(str(out))
        if i % 60 == 0:
            print(f'  [{i}/{len(frames)}]')
    print('  Done.')

    # 4. Определить FPS
    probe = subprocess.run([str(FFMPEG), '-i', str(src)],
                           capture_output=True, text=True)
    fps = next((p.strip().split()[0] for line in probe.stderr.split('\n')
                if 'Video:' in line for p in line.split(',') if 'fps' in p), '30')

    # 5. Собрать видео
    print(f'▶ Assembling {dst.name} at {fps}fps...')
    w, h = Image.open(next(upscaled_dir.glob('*.png'))).size
    subprocess.run([
        str(FFMPEG), '-framerate', fps,
        '-i', str(upscaled_dir / '%05d.png'),
        '-c:v', 'libx264', '-crf', '18', '-preset', 'slow',
        '-movflags', '+faststart',
        '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
        '-an', str(dst), '-y'
    ], check=True, capture_output=True)

    size = dst.stat().st_size / 1024 / 1024
    print(f'✓ Saved {dst} ({size:.1f} MB, {w}×{h})')

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    upscale(Path(sys.argv[1]), Path(sys.argv[2]),
            int(sys.argv[3]) if len(sys.argv) > 3 else 2)
