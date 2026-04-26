import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { COURSE_DATA } from '@/lib/data'
import { LessonPlayer } from './LessonPlayer'

export function generateStaticParams() {
  return COURSE_DATA.map((level) => ({ slug: level.id }))
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const level = COURSE_DATA.find((l) => l.id === slug)
  if (!level) notFound()

  const levelIndex = COURSE_DATA.findIndex((l) => l.id === slug)
  const prevLevel = COURSE_DATA[levelIndex - 1]
  const nextLevel = COURSE_DATA[levelIndex + 1]

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Nav minimal />

      <div className="max-w-4xl mx-auto px-6 pt-28 pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] mb-8">
          <Link href="/dashboard" className="hover:text-[var(--foreground)] transition-colors">Dashboard</Link>
          <span>/</span>
          <span className="text-[var(--foreground)]">{level.title}</span>
        </div>

        {/* Level header */}
        <div className="mb-10">
          <p className="text-[var(--accent)] text-xs font-semibold tracking-[0.2em] uppercase mb-2">
            Level {String(levelIndex + 1).padStart(2, '0')}
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-[-0.03em] leading-[0.95] mb-3">{level.title}</h1>
          <p className="text-[var(--muted-foreground)]">{level.subtitle}</p>
        </div>

        {/* Lesson list */}
        <div className="space-y-3 mb-16">
          {level.lessons.map((lesson, i) => (
            <LessonPlayer key={lesson.id} lesson={lesson} index={i} />
          ))}
        </div>

        {/* Level navigation */}
        <div className="flex items-center justify-between pt-8 border-t border-[var(--border)]">
          {prevLevel ? (
            <Link
              href={`/course/${prevLevel.id}`}
              className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              {prevLevel.title}
            </Link>
          ) : <div />}
          {nextLevel ? (
            <Link
              href={`/course/${nextLevel.id}`}
              className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              {nextLevel.title}
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
