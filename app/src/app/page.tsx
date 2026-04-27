import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { HeroVideo } from '@/components/HeroVideo'

type SearchParams = Promise<{ v?: string }>

const VARIANTS = [
  { k: 'none', label: 'Text' },
  { k: 'a', label: 'Split' },
  { k: 'b', label: 'Overlay' },
] as const

export default async function LandingPage({ searchParams }: { searchParams: SearchParams }) {
  const { v } = await searchParams
  const variant: 'none' | 'a' | 'b' =
    v === 'none' ? 'none' : v === 'a' ? 'a' : 'b'

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Nav />

{variant === 'a' && <HeroSplit />}
      {variant === 'b' && <HeroOverlay />}
      {variant === 'none' && <HeroText />}

      <div className="border-t border-[var(--border)]" />

      <section className="px-6 py-32">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-[var(--accent)] text-xs font-semibold tracking-[0.3em] uppercase mb-20">
            How it works
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[var(--border)] mb-24">
            {[
              { n: '01', label: 'Challenge', desc: 'You meet resistance. The body reveals what the mind avoids.' },
              { n: '02', label: 'Curiosity', desc: 'Resistance becomes inquiry. You begin to listen to what is happening.' },
              { n: '03', label: 'Enjoyment', desc: 'The practice becomes its own reward. Effort dissolves into form.' },
            ].map((s) => (
              <div key={s.n} className="bg-[var(--background)] p-8 sm:p-10 text-center">
                <span className="text-xs text-[var(--accent)] font-semibold tracking-widest">{s.n}</span>
                <h3 className="text-xl font-bold mt-4 mb-3">{s.label}</h3>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {['Length', 'Tension', 'Breath', 'Release'].map((el, i) => (
              <div key={el} className="flex flex-col items-center gap-3">
                <span className="text-[10px] text-[var(--accent)] font-semibold tracking-widest uppercase">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-2xl sm:text-3xl font-bold">{el}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="border-t border-[var(--border)]" />

      <section className="px-6 py-32">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[var(--accent)] text-xs font-semibold tracking-[0.3em] uppercase mb-10">
            Experience
          </p>
          <p className="text-xl sm:text-2xl font-bold leading-[1.3] tracking-[-0.01em] mb-10">
            It begins the way a morning stretch does —<br />
            not with effort, but with permission.
          </p>
          <div className="space-y-5 text-[var(--muted-foreground)] leading-relaxed text-sm sm:text-base">
            <p>
              The body already knows the shape. It has always known.
              What we practice is the art of listening — of arriving precisely
              where you are, without rushing past it.
            </p>
            <p>
              This is not fitness. It is a conversation between
              intention and gravity. Between the effort to hold
              and the wisdom to release.
            </p>
          </div>
        </div>
      </section>

      <div className="border-t border-[var(--border)]" />

      <section className="px-6 py-32 text-center">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-[clamp(2rem,5.5vw,4.5rem)] font-bold leading-[0.92] tracking-[-0.03em] mb-10">
            Begin<br />
            <span className="text-[var(--accent)]">when ready.</span>
          </h2>
          <CtaLink />
        </div>
      </section>

      <footer className="border-t border-[var(--border)] px-6 py-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-xs font-semibold tracking-widest uppercase text-[var(--accent)]">
            Toward Perfection
          </span>
          <span className="text-xs text-[var(--muted-foreground)]">© 2026</span>
        </div>
      </footer>
    </div>
  )
}

function CtaLink({ white = false }: { white?: boolean }) {
  return (
    <Link href="/auth" className={`inline-flex items-center gap-3 group ${white ? 'text-white' : ''}`}>
      <span className="text-sm font-semibold tracking-widest uppercase">Start Practice</span>
      <span className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
        white
          ? 'border-white group-hover:bg-white group-hover:text-black'
          : 'border-[var(--foreground)] group-hover:bg-[var(--foreground)] group-hover:text-[var(--background)]'
      }`}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </span>
    </Link>
  )
}

function HeroText() {
  return (
    <section className="min-h-screen flex flex-col justify-center px-6 pt-24 pb-16">
      <div className="max-w-5xl mx-auto w-full text-center">
        <p className="text-[var(--accent)] text-xs font-semibold tracking-[0.3em] uppercase mb-12">
          A practice system
        </p>
        <h1 className="text-[clamp(2.75rem,8.5vw,6.75rem)] font-bold leading-[0.92] tracking-[-0.03em] mb-10">
          Toward<br />
          <span className="text-[var(--accent)]">Perfection</span>
        </h1>
        <p className="text-base sm:text-lg text-[var(--muted-foreground)] max-w-lg mx-auto leading-relaxed mb-12">
          A system of conscious body control.<br />
          Strength. Mobility. Awareness.
        </p>
        <CtaLink />
      </div>
    </section>
  )
}

function HeroSplit() {
  return (
    <section className="grid grid-cols-2 min-h-screen">
      {/* Left: text on dark bg */}
      <div className="flex flex-col justify-center px-12 xl:px-20 bg-[var(--background)]">
        <p className="text-[var(--accent)] text-xs font-semibold tracking-[0.3em] uppercase mb-10">
          A practice system
        </p>
        <h1 className="text-[clamp(2.75rem,4.5vw,5.5rem)] font-bold leading-[0.92] tracking-[-0.03em] mb-8">
          Toward<br />
          <span className="text-[var(--accent)]">Perfection</span>
        </h1>
        <p className="text-base xl:text-lg text-[var(--muted-foreground)] leading-relaxed mb-12 max-w-sm">
          A system of conscious body control.<br />
          Strength. Mobility. Awareness.
        </p>
        <CtaLink />
      </div>

      {/* Right: horizontal video */}
      <div className="relative overflow-hidden bg-black">
        <HeroVideo src="/hero2.mp4" />
      </div>
    </section>
  )
}

function HeroOverlay() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center px-6 pt-24 pb-16 overflow-hidden">
      <HeroVideo />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/85 pointer-events-none" />

      <div className="relative max-w-5xl mx-auto w-full text-center">
        <p className="text-[var(--accent)] text-[13px] sm:text-xs font-semibold tracking-[0.3em] uppercase mb-10 sm:mb-12">
          A practice system
        </p>
        <h1 className="text-[clamp(3.25rem,12vw,8rem)] font-bold leading-[0.92] tracking-[-0.03em] mb-8 sm:mb-10 text-white drop-shadow-[0_2px_32px_rgba(0,0,0,0.7)]">
          Toward<br />
          <span className="text-[var(--accent)]">Perfection</span>
        </h1>
        <p className="text-base sm:text-lg text-white/90 max-w-lg mx-auto leading-relaxed mb-12">
          A system of conscious body control.<br />
          Strength. Mobility. Awareness.
        </p>
        <CtaLink white />
      </div>
    </section>
  )
}
