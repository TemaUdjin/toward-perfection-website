import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Nav } from '@/components/Nav'
import { LessonPlayer } from './LessonPlayer'

export const dynamic = 'force-dynamic'

const COURSE_ORDER = ['foundation', 'build', 'mastery']

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  // Course + lessons
  const { data: course } = await supabase
    .from('courses')
    .select('id, slug, title, description')
    .eq('slug', slug)
    .single()

  if (!course) notFound()

  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, title, description, duration_seconds, vimeo_video_id')
    .eq('course_id', course.id)
    .eq('is_published', true)
    .order('order_index')

  // User's completed lessons for this course
  const lessonIds = (lessons ?? []).map((l) => l.id)
  const { data: progressRows } = lessonIds.length
    ? await supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('user_id', user.id)
        .in('lesson_id', lessonIds)
    : { data: [] }

  const completedSet = new Set((progressRows ?? []).map((r) => r.lesson_id))

  const levelIndex = COURSE_ORDER.indexOf(slug)
  const prevSlug = COURSE_ORDER[levelIndex - 1]
  const nextSlug = COURSE_ORDER[levelIndex + 1]

  const doneCount = completedSet.size
  const totalCount = (lessons ?? []).length

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Nav />

      <div className="max-w-4xl mx-auto px-6 pt-28 pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] mb-8">
          <Link href="/dashboard" className="hover:text-[var(--foreground)] transition-colors">
            Courses
          </Link>
          <span>/</span>
          <span className="text-[var(--foreground)]">{course.title}</span>
        </div>

        {/* Header */}
        <div className="mb-10">
          <p className="text-[var(--accent)] text-xs font-semibold tracking-[0.2em] uppercase mb-2">
            Level {String(levelIndex + 1).padStart(2, '0')}
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-[-0.03em] leading-[0.95] mb-3">
            {course.title}
          </h1>
          <div className="flex items-center gap-4">
            <p className="text-[var(--muted-foreground)] text-sm">{course.description}</p>
            {totalCount > 0 && (
              <span className="flex-shrink-0 text-xs text-[var(--muted-foreground)]">
                {doneCount} / {totalCount} done
              </span>
            )}
          </div>
          {/* Progress bar */}
          {totalCount > 0 && (
            <div className="mt-4 h-1 bg-[var(--muted)] rounded-full overflow-hidden w-48">
              <div
                className="h-full bg-[var(--accent)] rounded-full transition-all"
                style={{ width: `${(doneCount / totalCount) * 100}%` }}
              />
            </div>
          )}
        </div>

        {/* Lessons */}
        <div className="space-y-3 mb-16">
          {(lessons ?? []).map((lesson, i) => (
            <LessonPlayer
              key={lesson.id}
              lesson={lesson}
              index={i}
              initialCompleted={completedSet.has(lesson.id)}
              currentUserId={user.id}
            />
          ))}
        </div>

        {/* Level navigation */}
        <div className="flex items-center justify-between pt-8 border-t border-[var(--border)]">
          {prevSlug ? (
            <Link
              href={`/course/${prevSlug}`}
              className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors capitalize"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              {prevSlug}
            </Link>
          ) : <div />}
          {nextSlug ? (
            <Link
              href={`/course/${nextSlug}`}
              className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors capitalize"
            >
              {nextSlug}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </Link>
          ) : <div />}
        </div>
      </div>
    </div>
  )
}
