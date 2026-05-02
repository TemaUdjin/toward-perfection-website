'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ThemeToggle } from './ThemeToggle'
import { createClient } from '@/lib/supabase/client'

export function Nav() {
  const pathname = usePathname()
  const router = useRouter()
  const [loggedIn, setLoggedIn] = useState(false)
  const [initial, setInitial] = useState('?')

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setLoggedIn(!!session)
      if (session) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', session.user.id)
          .single()
        const name = data?.full_name?.trim()
        setInitial(name ? name[0].toUpperCase() : session.user.email?.[0].toUpperCase() ?? '?')
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setLoggedIn(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href={loggedIn ? '/feed' : '/'}
          className="text-xs tracking-widest uppercase text-[var(--foreground)]"
        >
          Toward Perfection
        </Link>

        <div className="flex items-center gap-5">
          {loggedIn ? (
            <>
              <NavLink href="/feed" current={pathname === '/feed'}>Feed</NavLink>
              <NavLink href="/dashboard" current={pathname === '/dashboard'}>Courses</NavLink>
              <NavLink href="/members" current={pathname === '/members'}>Members</NavLink>
              <Link
                href="/account"
                className="w-7 h-7 rounded-full bg-[var(--muted)] border border-[var(--border)] flex items-center justify-center text-[10px] font-semibold text-[var(--muted-foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                title="Account settings"
              >
                {initial}
              </Link>
              <button
                onClick={handleSignOut}
                className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/course/foundation" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                Course
              </Link>
              <Link href="/auth" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                Sign in
              </Link>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}

function NavLink({ href, current, children }: {
  href: string
  current: boolean
  children: React.ReactNode
}) {
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
