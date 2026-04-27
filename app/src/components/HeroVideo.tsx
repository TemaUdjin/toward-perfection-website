'use client'

import { useEffect, useRef } from 'react'

export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    v.muted = true
    v.play().catch(() => {})
  }, [])

  return (
    <video
      ref={ref}
      src="/hero.mp4"
      autoPlay
      muted
      loop
      playsInline
      aria-hidden
      preload="auto"
      className="absolute inset-0 m-auto h-full w-auto max-w-none pointer-events-none"
    />
  )
}
