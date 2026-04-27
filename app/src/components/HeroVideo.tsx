'use client'

import { useEffect, useRef } from 'react'

interface Props {
  src?: string
  poster?: string
  className?: string
}

export function HeroVideo({ src = '/hero-ai.mp4', poster = '/hero-poster.jpg', className = '' }: Props) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    v.muted = true
    v.volume = 0

    const play = () => { v.play().catch(() => {}) }

    // Attempt immediately — works if browser pre-buffered
    play()
    // Fallback: retry when enough data is available
    v.addEventListener('canplay', play, { once: true })
    return () => v.removeEventListener('canplay', play)
  }, [])

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      aria-hidden
      preload="auto"
      className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${className}`}
    />
  )
}
