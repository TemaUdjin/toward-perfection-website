'use client'

import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'

export function Nav({ minimal = false }: { minimal?: boolean }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xs tracking-widest uppercase text-[var(--foreground)]">
          Toward Perfection
        </Link>
        {!minimal && (
          <div className="flex items-center gap-4">
            <Link href="/course/foundation" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
              Course
            </Link>
            <Link href="/auth" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
              Sign in
            </Link>
            <ThemeToggle />
          </div>
        )}
        {minimal && <ThemeToggle />}
      </div>
    </nav>
  )
}
