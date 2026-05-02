'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Nav } from '@/components/Nav'

export default function AccountPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nameLoading, setNameLoading] = useState(false)
  const [passLoading, setPassLoading] = useState(false)
  const [nameMsg, setNameMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [passMsg, setPassMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/auth'); return }
      const { data } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', session.user.id)
        .single()
      if (data?.full_name) setFullName(data.full_name)
    })
  }, [router])

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault()
    setNameLoading(true)
    setNameMsg(null)
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/auth'); return }
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim() })
      .eq('id', session.user.id)
    setNameMsg(error
      ? { type: 'error', text: error.message }
      : { type: 'success', text: 'Name updated.' }
    )
    setNameLoading(false)
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setPassMsg({ type: 'error', text: 'Passwords do not match' })
      return
    }
    if (newPassword.length < 6) {
      setPassMsg({ type: 'error', text: 'Password must be at least 6 characters' })
      return
    }
    setPassLoading(true)
    setPassMsg(null)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setPassMsg({ type: 'error', text: error.message })
    } else {
      setPassMsg({ type: 'success', text: 'Password updated successfully.' })
      setNewPassword('')
      setConfirmPassword('')
    }
    setPassLoading(false)
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Nav />

      <div className="max-w-lg mx-auto px-6 pt-28 pb-24">
        <div className="mb-12">
          <p className="text-[var(--accent)] text-xs font-semibold tracking-[0.3em] uppercase mb-3">
            Settings
          </p>
          <h1 className="text-4xl font-bold tracking-[-0.03em]">Account</h1>
        </div>

        {/* Display name */}
        <section className="border-t border-[var(--border)] pt-10 mb-12">
          <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-[var(--muted-foreground)] mb-6">
            Display Name
          </h2>
          <form onSubmit={handleSaveName} className="space-y-4">
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              maxLength={60}
              className="w-full h-12 px-4 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
            {nameMsg && (
              <p className={`text-sm ${nameMsg.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                {nameMsg.text}
              </p>
            )}
            <button
              type="submit"
              disabled={nameLoading || !fullName.trim()}
              className="h-11 px-6 rounded-xl border border-[var(--foreground)] text-sm font-semibold tracking-wide hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {nameLoading ? 'Saving…' : 'Save Name'}
            </button>
          </form>
        </section>

        {/* Change password */}
        <section className="border-t border-[var(--border)] pt-10">
          <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-[var(--muted-foreground)] mb-6">
            Change Password
          </h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs text-[var(--muted-foreground)] uppercase tracking-wide mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full h-12 px-4 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--muted-foreground)] uppercase tracking-wide mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full h-12 px-4 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>
            {passMsg && (
              <p className={`text-sm ${passMsg.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                {passMsg.text}
              </p>
            )}
            <button
              type="submit"
              disabled={passLoading}
              className="h-11 px-6 rounded-xl bg-[var(--accent)] text-[#0a0a0a] text-sm font-semibold tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {passLoading ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
