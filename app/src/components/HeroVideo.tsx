'use client'

import { useEffect, useRef } from 'react'

interface Props {
  src?: string
  poster?: string
  className?: string
}

export function HeroVideo({ src = '/hero-hq.mp4', poster = '/hero-poster.jpg', className = '' }: Props) {
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
