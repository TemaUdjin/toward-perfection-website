'use client'

export const dynamic = 'force-dynamic'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'
import { createClient } from '@/lib/supabase/client'
import { getCroppedBlob } from '@/lib/cropImage'
import { Nav } from '@/components/Nav'

type Profile = {
  full_name: string
  bio: string
  instagram_handle: string
  avatar_url: string | null
}

export default function AccountPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [userId, setUserId] = useState('')
  const [profile, setProfile] = useState<Profile>({
    full_name: '', bio: '', instagram_handle: '', avatar_url: null,
  })
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // Cropper state
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)

  const [profileLoading, setProfileLoading] = useState(false)
  const [profileMsg, setProfileMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passLoading, setPassLoading] = useState(false)
  const [passMsg, setPassMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/auth'); return }
      setUserId(session.user.id)
      const { data } = await supabase
        .from('profiles')
        .select('full_name, bio, instagram_handle, avatar_url')
        .eq('id', session.user.id)
        .single()
      if (data) {
        setProfile({
          full_name: data.full_name ?? '',
          bio: data.bio ?? '',
          instagram_handle: data.instagram_handle ?? '',
          avatar_url: data.avatar_url ?? null,
        })
        if (data.avatar_url) setAvatarPreview(data.avatar_url)
      }
    })
  }, [router])

  // Open file picker → show cropper
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setCropSrc(url)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    // reset input so same file can be re-selected
    e.target.value = ''
  }

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels)
  }, [])

  async function handleApplyCrop() {
    if (!cropSrc || !croppedAreaPixels || !userId) return
    setAvatarUploading(true)
    setCropSrc(null)

    try {
      const blob = await getCroppedBlob(cropSrc, croppedAreaPixels)
      const supabase = createClient()
      const { error } = await supabase.storage
        .from('avatars')
        .upload(userId, blob, { upsert: true, contentType: 'image/jpeg' })
      if (error) throw error

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(userId)
      const url = `${publicUrl}?t=${Date.now()}`
      await supabase.from('profiles').update({ avatar_url: url }).eq('id', userId)
      setAvatarPreview(url)
      setProfile((p) => ({ ...p, avatar_url: url }))
    } catch (err) {
      setProfileMsg({ type: 'error', text: 'Upload failed. Try again.' })
    } finally {
      setAvatarUploading(false)
      URL.revokeObjectURL(cropSrc ?? '')
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setProfileLoading(true)
    setProfileMsg(null)
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({
      full_name: profile.full_name.trim() || null,
      bio: profile.bio.trim() || null,
      instagram_handle: profile.instagram_handle.replace(/^@/, '').trim() || null,
    }).eq('id', userId)
    setProfileMsg(error
      ? { type: 'error', text: error.message }
      : { type: 'success', text: 'Profile saved.' }
    )
    setProfileLoading(false)
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setPassMsg({ type: 'error', text: 'Passwords do not match' })
      return
    }
    if (newPassword.length < 6) {
      setPassMsg({ type: 'error', text: 'Minimum 6 characters' })
      return
    }
    setPassLoading(true)
    setPassMsg(null)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setPassMsg({ type: 'error', text: error.message })
    } else {
      setPassMsg({ type: 'success', text: 'Password updated.' })
      setNewPassword('')
      setConfirmPassword('')
    }
    setPassLoading(false)
  }

  const displayInitial = profile.full_name?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Nav />

      {/* ── Crop modal ── */}
      {cropSrc && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black/90">
          {/* Cropper area */}
          <div className="relative flex-1">
            <Cropper
              image={cropSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          {/* Controls */}
          <div className="flex-shrink-0 bg-black px-6 py-5 flex flex-col items-center gap-5">
            {/* Zoom slider */}
            <div className="flex items-center gap-4 w-full max-w-xs">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="opacity-50">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 accent-[#c8a96e]"
              />
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
              </svg>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 w-full max-w-xs">
              <button
                onClick={() => { setCropSrc(null); URL.revokeObjectURL(cropSrc) }}
                className="flex-1 h-11 rounded-xl border border-white/20 text-sm text-white/70 hover:text-white hover:border-white/40 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyCrop}
                disabled={avatarUploading}
                className="flex-1 h-11 rounded-xl bg-[#c8a96e] text-[#0a0a0a] text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {avatarUploading ? 'Uploading…' : 'Apply'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-lg mx-auto px-6 pt-28 pb-24">
        <div className="mb-12">
          <p className="text-[var(--accent)] text-xs font-semibold tracking-[0.3em] uppercase mb-3">
            Settings
          </p>
          <h1 className="text-4xl font-bold tracking-[-0.03em]">Account</h1>
        </div>

        {/* Avatar */}
        <section className="border-t border-[var(--border)] pt-10 mb-10">
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={avatarUploading}
              className="relative flex-shrink-0 w-20 h-20 rounded-full overflow-hidden bg-[var(--muted)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors group"
            >
              {avatarPreview ? (
                <Image src={avatarPreview} alt="Avatar" fill className="object-cover" unoptimized />
              ) : (
                <span className="text-2xl font-semibold text-[var(--muted-foreground)] flex items-center justify-center w-full h-full">
                  {displayInitial}
                </span>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </div>
              {avatarUploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </button>
            <div>
              <p className="text-sm font-medium mb-1">Profile photo</p>
              <p className="text-xs text-[var(--muted-foreground)]">JPG, PNG or WebP · max 2 MB</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Drag to reposition, scroll to zoom</p>
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileSelect}
          />
        </section>

        {/* Profile info */}
        <section className="border-t border-[var(--border)] pt-10 mb-12">
          <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--muted-foreground)] mb-6">
            Profile
          </h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs text-[var(--muted-foreground)] uppercase tracking-wide mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
                placeholder="Your name"
                maxLength={60}
                className="w-full h-12 px-4 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--muted-foreground)] uppercase tracking-wide mb-2">
                Bio
              </label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                placeholder="A few words about yourself and your practice…"
                maxLength={300}
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors resize-none leading-relaxed"
              />
              <p className="text-right text-[10px] text-[var(--muted-foreground)] mt-1">
                {profile.bio.length} / 300
              </p>
            </div>
            <div>
              <label className="block text-xs text-[var(--muted-foreground)] uppercase tracking-wide mb-2">
                Instagram
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[var(--muted-foreground)]">@</span>
                <input
                  type="text"
                  value={profile.instagram_handle}
                  onChange={(e) => setProfile((p) => ({ ...p, instagram_handle: e.target.value.replace(/^@/, '') }))}
                  placeholder="username"
                  maxLength={40}
                  className="w-full h-12 pl-8 pr-4 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>
            </div>
            {profileMsg && (
              <p className={`text-sm ${profileMsg.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                {profileMsg.text}
              </p>
            )}
            <button
              type="submit"
              disabled={profileLoading}
              className="h-11 px-6 rounded-xl bg-[var(--accent)] text-[#0a0a0a] text-sm font-semibold tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {profileLoading ? 'Saving…' : 'Save Profile'}
            </button>
          </form>
        </section>

        {/* Change password */}
        <section className="border-t border-[var(--border)] pt-10">
          <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--muted-foreground)] mb-6">
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
              className="h-11 px-6 rounded-xl border border-[var(--foreground)] text-sm font-semibold tracking-wide hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-all disabled:opacity-50"
            >
              {passLoading ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
