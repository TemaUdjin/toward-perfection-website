import { redirect, notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Nav } from '@/components/Nav'
import { getLevel, getLevelColor, eventText, timeAgo } from '@/lib/feed'

export const dynamic = 'force-dynamic'

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, points, bio, instagram_handle')
    .eq('id', id)
    .single()

  if (!profile) notFound()

  // Lesson count
  const { count: lessonCount } = await supabase
    .from('lesson_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', id)

  // Last 10 feed events for this user
  const { data: events } = await supabase
    .from('activity_feed')
    .select('id, type, payload, created_at')
    .eq('user_id', id)
    .order('created_at', { ascending: false })
    .limit(10)

  const name = profile.full_name?.trim() || 'Anonymous'
  const initial = name[0].toUpperCase()
  const level = getLevel(profile.points ?? 0)
  const levelColor = getLevelColor(level)
  const isMe = profile.id === user.id

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Nav />

      <div className="max-w-xl mx-auto px-6 pt-28 pb-24">

        {/* Header */}
        <div className="flex items-start gap-5 mb-10">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-[var(--muted)] border border-[var(--border)] flex items-center justify-center text-2xl font-semibold text-[var(--muted-foreground)] flex-shrink-0">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={name}
                width={80}
                height={80}
                className="object-cover w-full h-full"
                unoptimized
              />
            ) : (
              initial
            )}
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-2xl font-bold tracking-[-0.02em]">{name}</h1>
              {isMe && (
                <Link
                  href="/account"
                  className="text-[9px] font-semibold tracking-widest uppercase text-[var(--muted-foreground)] border border-[var(--border)] px-1.5 py-0.5 rounded hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                >
                  Edit
                </Link>
              )}
            </div>
            <span className={`text-xs font-semibold tracking-[0.15em] uppercase ${levelColor}`}>
              {level}
            </span>
            {profile.bio && (
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mt-3">
                {profile.bio}
              </p>
            )}
            {profile.instagram_handle && (
              <a
                href={`https://instagram.com/${profile.instagram_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 text-xs text-[var(--muted-foreground)] hover:text-[var(--accent)] transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
                </svg>
                @{profile.instagram_handle}
              </a>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-px bg-[var(--border)] mb-12">
          {[
            { label: 'Points', value: profile.points ?? 0, accent: true },
            { label: 'Lessons done', value: lessonCount ?? 0, accent: false },
          ].map((s) => (
            <div key={s.label} className="bg-[var(--background)] py-6 px-5 text-center">
              <p className={`text-3xl font-bold tracking-[-0.02em] mb-1 ${s.accent ? 'text-[var(--accent)]' : ''}`}>
                {s.value}
              </p>
              <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-[0.2em]">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Activity */}
        {(events ?? []).length > 0 && (
          <div>
            <p className="text-xs text-[var(--muted-foreground)] tracking-[0.2em] uppercase mb-6">
              Recent activity
            </p>
            <div>
              {(events ?? []).map((e) => (
                <div key={e.id} className="flex items-start gap-3 py-3 border-b border-[var(--border)]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--border)] mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-[var(--muted-foreground)] flex-1 leading-snug">
                    {eventText(e.type, e.payload ?? {})}
                  </p>
                  <span className="text-xs text-[var(--muted-foreground)] flex-shrink-0">
                    {timeAgo(e.created_at)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
