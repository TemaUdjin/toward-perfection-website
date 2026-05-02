'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  type FeedEvent,
  type FeedProfile,
  getLevel,
  getLevelColor,
  timeAgo,
  eventText,
  displayName,
  nameInitial,
} from '@/lib/feed'
import { createPost } from './actions'

type Props = {
  initialEvents: FeedEvent[]
  currentUserId: string
  myProfile: FeedProfile
}

function FeedItem({ event }: { event: FeedEvent }) {
  const level = getLevel(event.profile.points)
  const levelColor = getLevelColor(level)
  const name = displayName(event.profile)
  const initial = nameInitial(event.profile)
  const text = eventText(event.type, event.payload)
  const isAnnouncement = event.type === 'joined'

  return (
    <div className="flex gap-4 py-5 border-b border-[var(--border)] group">
      {/* Avatar */}
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[var(--muted)] flex items-center justify-center text-xs font-semibold text-[var(--muted-foreground)]">
        {initial}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-sm font-semibold">{name}</span>
          <span className={`text-[10px] font-semibold tracking-[0.15em] uppercase ${levelColor}`}>
            {level}
          </span>
          <span className="text-[var(--muted-foreground)] text-xs ml-auto flex-shrink-0">
            {timeAgo(event.created_at)}
          </span>
        </div>

        <p className={`text-sm leading-relaxed ${
          isAnnouncement
            ? 'text-[var(--muted-foreground)] italic'
            : event.type === 'thread_created'
            ? 'text-[var(--foreground)]'
            : 'text-[var(--muted-foreground)]'
        }`}>
          {isAnnouncement ? `${name} ${text}` : text}
        </p>
      </div>
    </div>
  )
}

export function FeedClient({ initialEvents, currentUserId, myProfile }: Props) {
  const [events, setEvents] = useState<FeedEvent[]>(initialEvents)
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const profileCacheRef = useRef<Record<string, FeedProfile>>({})

  // seed cache from initial events
  useEffect(() => {
    initialEvents.forEach((e) => {
      profileCacheRef.current[e.user_id] = e.profile
    })
  }, [initialEvents])

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('activity_feed_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activity_feed' },
        async (payload) => {
          const row = payload.new as {
            id: string
            user_id: string
            type: FeedEvent['type']
            payload: FeedEvent['payload']
            created_at: string
          }

          let profile = profileCacheRef.current[row.user_id]
          if (!profile) {
            const { data } = await supabase
              .from('profiles')
              .select('full_name, points')
              .eq('id', row.user_id)
              .single()
            profile = data ?? { full_name: null, points: 0 }
            profileCacheRef.current[row.user_id] = profile
          }

          const newEvent: FeedEvent = {
            id: row.id,
            user_id: row.user_id,
            type: row.type,
            payload: row.payload,
            created_at: row.created_at,
            profile,
          }

          setEvents((prev) => [newEvent, ...prev].slice(0, 50))
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const result = await createPost(body)
    if (result.error) {
      setError(result.error)
    } else {
      setBody('')
    }
    setSubmitting(false)
  }

  const myLevel = getLevel(myProfile.points)
  const myLevelColor = getLevelColor(myLevel)

  return (
    <div>
      {/* Post form */}
      <form onSubmit={handleSubmit} className="mb-10">
        <div className="border border-[var(--border)] rounded-lg overflow-hidden focus-within:border-[var(--accent)] transition-colors">
          <div className="flex items-center gap-3 px-4 pt-4 pb-2">
            <div className="w-7 h-7 rounded-full bg-[var(--muted)] flex items-center justify-center text-xs font-semibold text-[var(--muted-foreground)] flex-shrink-0">
              {nameInitial(myProfile)}
            </div>
            <span className={`text-[10px] font-semibold tracking-[0.15em] uppercase ${myLevelColor}`}>
              {myLevel}
            </span>
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share your practice, ask a question, post an insight..."
            rows={3}
            className="w-full px-4 pb-3 bg-transparent text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] resize-none outline-none leading-relaxed"
          />
          <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)]">
            {error ? (
              <p className="text-xs text-red-400">{error}</p>
            ) : (
              <span className="text-xs text-[var(--muted-foreground)]">
                {body.length > 0 ? `${body.length} / 2000` : ''}
              </span>
            )}
            <button
              type="submit"
              disabled={submitting || !body.trim()}
              className="text-xs font-semibold tracking-widest uppercase px-4 py-2 border border-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {submitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </form>

      {/* Feed */}
      {events.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-[var(--muted-foreground)] text-sm">
            No activity yet. Complete a lesson or share a post to get started.
          </p>
        </div>
      ) : (
        <div>
          {events.map((event) => (
            <FeedItem key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}
