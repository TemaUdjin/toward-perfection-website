'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ThemeToggle } from './ThemeToggle'
import { createClient } from '@/lib/supabase/client'

export function Nav() {
  const pathname = usePathname()
  const router = useRouter()
  const [loggedIn, setLoggedIn] = useState(false)
  const [initial, setInitial] = useState('?')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setLoggedIn(!!session)
      if (session) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', session.user.id)
          .single()
        const name = data?.full_name?.trim()
        setInitial(name ? name[0].toUpperCase() : session.user.email?.[0].toUpperCase() ?? '?')
        if (data?.avatar_url) setAvatarUrl(data.avatar_url)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setLoggedIn(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Close menu on navigation
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  async function handleSignOut() {
    setMenuOpen(false)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="text-xs tracking-widest uppercase text-[var(--foreground)]"
          >
            Toward Perfection
          </Link>

          {/* Desktop */}
          <div className="hidden sm:flex items-center gap-5">
            {loggedIn ? (
              <>
                <NavLink href="/feed" current={pathname === '/feed'}>Feed</NavLink>
                <NavLink href="/dashboard" current={pathname === '/dashboard'}>Courses</NavLink>
                <NavLink href="/members" current={pathname === '/members'}>Members</NavLink>
                <Link
                  href="/account"
                  className="w-7 h-7 rounded-full overflow-hidden bg-[var(--muted)] border border-[var(--border)] flex items-center justify-center text-[10px] font-semibold text-[var(--muted-foreground)] hover:border-[var(--accent)] transition-colors flex-shrink-0"
                  title="Account settings"
                >
                  {avatarUrl ? (
                    <Image src={avatarUrl} alt="avatar" width={28} height={28} className="object-cover w-full h-full" unoptimized />
                  ) : (
                    initial
                  )}
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

          {/* Mobile */}
          <div className="flex sm:hidden items-center gap-3">
            {loggedIn ? (
              <>
                <Link
                  href="/account"
                  className="w-8 h-8 rounded-full overflow-hidden bg-[var(--muted)] border border-[var(--border)] flex items-center justify-center text-[10px] font-semibold text-[var(--muted-foreground)] flex-shrink-0"
                >
                  {avatarUrl ? (
                    <Image src={avatarUrl} alt="avatar" width={32} height={32} className="object-cover w-full h-full" unoptimized />
                  ) : (
                    initial
                  )}
                </Link>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="w-8 h-8 flex items-center justify-center text-[var(--foreground)]"
                  aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                >
                  {menuOpen ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <line x1="3" y1="7" x2="21" y2="7" />
                      <line x1="3" y1="12" x2="21" y2="12" />
                      <line x1="3" y1="17" x2="21" y2="17" />
                    </svg>
                  )}
                </button>
              </>
            ) : (
              <>
                <Link href="/auth" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                  Sign in
                </Link>
                <ThemeToggle />
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-[var(--background)] flex flex-col sm:hidden pt-16">
          <div className="flex-1 flex flex-col justify-center px-10">
            {[
              { href: '/feed', label: 'Feed' },
              { href: '/dashboard', label: 'Courses' },
              { href: '/members', label: 'Members' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-[2.75rem] font-bold tracking-[-0.02em] leading-[1.1] py-4 border-b border-[var(--border)] transition-colors ${
                  pathname === href
                    ? 'text-[var(--accent)]'
                    : 'text-[var(--foreground)]'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
          <div className="px-10 pb-12 flex items-center justify-between">
            <button
              onClick={handleSignOut}
              className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              Sign out
            </button>
            <ThemeToggle />
          </div>
        </div>
      )}
    </>
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
