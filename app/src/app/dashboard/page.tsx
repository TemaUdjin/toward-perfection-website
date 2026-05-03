import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Nav } from '@/components/Nav'
import { getLevel } from '@/lib/feed'

export const dynamic = 'force-dynamic'

const COURSES = [
  { slug: 'foundation', title: 'Foundation', subtitle: 'Build the base' },
  { slug: 'build',      title: 'Build',      subtitle: 'Develop balance and lines' },
  { slug: 'mastery',    title: 'Mastery',    subtitle: 'Press and advanced skills' },
]

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('points, full_name')
    .eq('id', user.id)
    .single()

  const { data: allLessons } = await supabase
    .from('lessons')
    .select('id, title, duration_seconds, order_index, course_id, courses(slug, title)')
    .eq('is_published', true)
    .order('order_index')

  const { data: progressRows } = await supabase
    .from('lesson_progress')
    .select('lesson_id, completed_at')
    .eq('user_id', user.id)

  const completedIds = new Set((progressRows ?? []).map((r) => r.lesson_id))
  const totalLessons = (allLessons ?? []).length
  const doneLessons = completedIds.size

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const thisWeek = (progressRows ?? []).filter((r) => r.completed_at >= weekAgo).length

  type CourseRef = { slug: string; title: string }
  const nextLesson = (allLessons ?? []).find((l) => !completedIds.has(l.id))
  const nextCourse = nextLesson
    ? (nextLesson.courses as unknown as CourseRef | null)
    : null

  const courseProgress = COURSES.map((c) => {
    const courseLessons = (allLessons ?? []).filter(
      (l) => (l.courses as unknown as CourseRef | null)?.slug === c.slug
    )
    const done = courseLessons.filter((l) => completedIds.has(l.id)).length
    return { ...c, done, total: courseLessons.length }
  })

  const level = getLevel(profile?.points ?? 0)

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Nav />

      <div className="max-w-4xl mx-auto px-6 pt-28 pb-24">
        <div className="mb-16">
          <p className="text-[var(--accent)] text-xs font-semibold tracking-[0.3em] uppercase mb-4">
            Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-[-0.03em] leading-[0.95]">
            Your Training
          </h1>
        </div>

        {/* Continue */}
        {nextLesson && nextCourse && (
          <div className="border-t border-[var(--border)] pt-10 pb-16">
            <p className="text-xs text-[var(--muted-foreground)] tracking-[0.2em] uppercase mb-6">
              Continue where you left off
            </p>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-[-0.02em] mb-2">
                  {nextLesson.title}
                </h2>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {nextCourse.title} · {Math.round((nextLesson.duration_seconds ?? 0) / 60)} min
                </p>
              </div>
              <Link
                href={`/course/${nextCourse.slug}`}
                className="inline-flex items-center gap-3 group flex-shrink-0"
              >
                <span className="text-sm font-semibold tracking-widest uppercase">Continue</span>
                <span className="w-10 h-10 rounded-full border border-[var(--foreground)] flex items-center justify-center group-hover:bg-[var(--foreground)] group-hover:text-[var(--background)] transition-all">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        )}

        {doneLessons === totalLessons && totalLessons > 0 && (
          <div className="border-t border-[var(--border)] pt-10 pb-16">
            <p className="text-[var(--accent)] text-sm font-semibold">
              All lessons completed — you&apos;ve reached Mastery.
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-px bg-[var(--border)] mb-20">
          {[
            { label: 'Current Level', value: level },
            { label: 'Lessons Done',  value: `${doneLessons} / ${totalLessons}` },
            { label: 'This Week',     value: String(thisWeek) },
          ].map((stat) => (
            <div key={stat.label} className="bg-[var(--background)] py-10 px-6 text-center">
              <p className="text-3xl sm:text-4xl font-bold text-[var(--accent)] tracking-[-0.02em] mb-2">
                {stat.value}
              </p>
              <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-[0.2em]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Courses */}
        <div className="border-t border-[var(--border)] pt-10">
          <p className="text-xs text-[var(--muted-foreground)] tracking-[0.3em] uppercase mb-8">
            Course Levels
          </p>
          <div>
            {courseProgress.map((course, i) => (
              <Link
                key={course.slug}
                href={`/course/${course.slug}`}
                className="flex items-center justify-between py-6 border-b border-[var(--border)] hover:bg-[var(--muted)] -mx-3 px-3 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-6">
                  <span className="text-[10px] text-[var(--accent)] font-semibold tracking-[0.2em]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <p className="font-semibold tracking-[-0.01em]">{course.title}</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                      {course.subtitle} · {course.done}/{course.total} lessons
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {course.total > 0 && (
                    <div className="w-16 h-1 bg-[var(--muted)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--accent)] rounded-full"
                        style={{ width: `${(course.done / course.total) * 100}%` }}
                      />
                    </div>
                  )}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className="text-[var(--muted-foreground)] group-hover:translate-x-1 group-hover:text-[var(--accent)] transition-all">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
