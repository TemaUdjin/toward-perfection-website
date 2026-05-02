'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ThemeToggle } from './ThemeToggle'
import { createClient } from '@/lib/supabase/client'

type NavProps = {
  minimal?: boolean
  loggedIn?: boolean
}

export function Nav({ minimal = false, loggedIn = false }: NavProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href={loggedIn ? '/feed' : '/'} className="text-xs tracking-widest uppercase text-[var(--foreground)]">
          Toward Perfection
        </Link>

        <div className="flex items-center gap-5">
          {loggedIn ? (
            <>
              <NavLink href="/feed" current={pathname === '/feed'}>Feed</NavLink>
              <NavLink href="/dashboard" current={pathname === '/dashboard'}>Courses</NavLink>
              <NavLink href="/members" current={pathname === '/members'}>Members</NavLink>
              <button
                onClick={handleSignOut}
                className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                Sign out
              </button>
            </>
          ) : !minimal ? (
            <>
              <Link href="/course/foundation" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                Course
              </Link>
              <Link href="/auth" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                Sign in
              </Link>
            </>
          ) : null}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}

function NavLink({ href, current, children }: { href: string; current: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`text-sm transition-colors ${
        current
          ? 'text-[var(--foreground)] font-semibold'
          : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
      }`}
    >
      {children}
    </Link>
  )
}
