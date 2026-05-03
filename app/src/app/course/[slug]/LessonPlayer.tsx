'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'

export type LessonRow = {
  id: string
  title: string
  description: string | null
  duration_seconds: number | null
  vimeo_video_id: string | null
}

function formatDuration(s: number | null): string {
  if (!s) return ''
  const m = Math.round(s / 60)
  return m < 1 ? `${s}s` : `${m} min`
}

type Props = {
  lesson: LessonRow
  index: number
  initialCompleted: boolean
  currentUserId: string
}

export function LessonPlayer({ lesson, index, initialCompleted, currentUserId }: Props) {
  const [open, setOpen] = useState(false)
  const [completed, setCompleted] = useState(initialCompleted)
  const [pending, startTransition] = useTransition()

  function toggleCompleted() {
    const next = !completed
    setCompleted(next)

    startTransition(async () => {
      const supabase = createClient()
      if (next) {
        await supabase.from('lesson_progress').insert({
          user_id: currentUserId,
          lesson_id: lesson.id,
        })
      } else {
        await supabase.from('lesson_progress').delete()
          .eq('user_id', currentUserId)
          .eq('lesson_id', lesson.id)
      }
    })
  }

  return (
    <div className={`rounded-2xl border transition-colors overflow-hidden ${
      open ? 'border-[var(--accent)]' : 'border-[var(--border)] hover:border-[var(--muted-foreground)]'
    } bg-[var(--card)]`}>
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-5 text-left"
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-colors ${
          completed
            ? 'bg-[var(--accent)] text-[#0a0a0a]'
            : open
            ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
            : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
        }`}>
          {completed ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          ) : String(index + 1).padStart(2, '0')}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{lesson.title}</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            {formatDuration(lesson.duration_seconds)}
          </p>
        </div>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`flex-shrink-0 text-[var(--muted-foreground)] transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {/* Expanded */}
      {open && (
        <div className="border-t border-[var(--border)]">
          {/* Video */}
          <div className="flex justify-center p-6 pb-4">
            {lesson.vimeo_video_id ? (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
                <iframe
                  src={`https://player.vimeo.com/video/${lesson.vimeo_video_id}?dnt=1&title=0&byline=0&portrait=0`}
                  className="absolute inset-0 w-full h-full"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="relative w-48 aspect-[9/16] rounded-xl bg-[var(--muted)] border border-[var(--border)] flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[var(--accent)] flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#0a0a0a">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                </div>
                <p className="text-xs text-[var(--muted-foreground)]">Video coming soon</p>
              </div>
            )}
          </div>

          {/* Description */}
          {lesson.description && (
            <div className="px-6 pb-4">
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                {lesson.description}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between px-6 pb-5">
            <button
              onClick={toggleCompleted}
              disabled={pending}
              className={`h-9 px-4 rounded-full text-xs font-semibold transition-colors disabled:opacity-50 ${
                completed
                  ? 'bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20'
                  : 'bg-[var(--accent)] text-[#0a0a0a] hover:opacity-90'
              }`}
            >
              {completed ? '✓ Completed' : 'Mark as Done'}
            </button>
            <button className="h-9 px-4 rounded-full border border-[var(--border)] text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--muted-foreground)] transition-colors">
              Upload My Form
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
