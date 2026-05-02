'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Nav } from '@/components/Nav'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  // Supabase puts the recovery tokens in the URL hash.
  // The SSR client can't read hash fragments — we handle them client-side.
  useEffect(() => {
    const supabase = createClient()
    // onAuthStateChange fires with event=PASSWORD_RECOVERY when the hash is valid
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }
    if (password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      return
    }
    setLoading(true)
    setMessage(null)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Password updated! Redirecting…' })
      setTimeout(() => router.push('/feed'), 1500)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Nav minimal />

      <div className="flex min-h-screen items-center justify-center px-6 pt-16">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <Link href="/" className="text-[var(--accent)] text-sm font-semibold tracking-[0.2em] uppercase">
              Toward Perfection
            </Link>
            <h1 className="text-2xl font-bold mt-4 mb-2">Set new password</h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              Choose a strong password for your account
            </p>
          </div>

          {!ready ? (
            <div className="text-center py-8">
              <p className="text-sm text-[var(--muted-foreground)]">Verifying reset link…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-2 uppercase tracking-wide">
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full h-12 px-4 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-2 uppercase tracking-wide">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full h-12 px-4 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>

              {message && (
                <div className={`p-3 rounded-xl text-sm ${
                  message.type === 'error'
                    ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                    : 'bg-green-500/10 text-green-500 border border-green-500/20'
                }`}>
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-[var(--accent)] text-[#0a0a0a] font-semibold text-sm tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
