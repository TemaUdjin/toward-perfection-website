import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { COURSE_DATA } from '@/lib/data'

export default function DashboardPage() {
  const currentLevel = COURSE_DATA[0]
  const currentLesson = currentLevel.lessons[0]

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Nav minimal />

      <div className="max-w-4xl mx-auto px-6 pt-28 pb-24">
        {/* Header */}
        <div className="mb-16">
          <p className="text-[var(--accent)] text-xs font-semibold tracking-[0.3em] uppercase mb-4">
            Welcome back
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-[-0.03em] leading-[0.95]">
            Your Training
          </h1>
        </div>

        {/* Continue */}
        <div className="border-t border-[var(--border)] pt-10 pb-16">
          <p className="text-xs text-[var(--muted-foreground)] tracking-[0.2em] uppercase mb-6">
            Continue where you left off
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-[-0.02em] mb-2">
                {currentLesson.title}
              </h2>
              <p className="text-sm text-[var(--muted-foreground)]">
                {currentLevel.title} · Lesson 1 of {currentLevel.lessons.length} · {currentLesson.duration}
              </p>
            </div>
            <Link
              href={`/course/${currentLevel.id}`}
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

        {/* Stats */}
        <div className="grid grid-cols-3 gap-px bg-[var(--border)] mb-20">
          {[
            { label: 'Current Level', value: 'Foundation' },
            { label: 'Lessons Done', value: '0 / 12' },
            { label: 'This Week', value: '0' },
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

        {/* Levels */}
        <div className="border-t border-[var(--border)] pt-10 mb-16">
          <p className="text-xs text-[var(--muted-foreground)] tracking-[0.3em] uppercase mb-8">
            Course Levels
          </p>
          <div>
            {COURSE_DATA.map((level, i) => {
              const isUnlocked = i === 0
              const Wrapper = isUnlocked ? Link : 'div'
              const props = isUnlocked
                ? { href: `/course/${level.id}` }
                : {}
              return (
                <Wrapper
                  key={level.id}
                  {...(props as { href: string })}
                  className={`flex items-center justify-between py-6 border-b border-[var(--border)] transition-colors group ${
                    isUnlocked
                      ? 'hover:bg-[var(--muted)] cursor-pointer'
                      : 'opacity-40 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-6">
                    <span className="text-[10px] text-[var(--accent)] font-semibold tracking-[0.2em]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <p className="font-semibold tracking-[-0.01em]">{level.title}</p>
                      <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                        {level.lessons.length} lessons
                      </p>
                    </div>
                  </div>
                  {isUnlocked ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--muted-foreground)] group-hover:translate-x-1 group-hover:text-[var(--accent)] transition-all">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                      <polyline points="12 5 19 12 12 19"/>
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--muted-foreground)]">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  )}
                </Wrapper>
              )
            })}
          </div>
        </div>

        {/* AI analysis */}
        <div className="border-t border-[var(--border)] pt-10">
          <p className="text-xs text-[var(--accent)] tracking-[0.3em] uppercase mb-4">
            Beta
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold tracking-[-0.02em] mb-3">
            AI Form Analysis
          </h3>
          <p className="text-sm text-[var(--muted-foreground)] max-w-md mb-6 leading-relaxed">
            Upload a video of your handstand and get expert feedback on your alignment.
          </p>
          <button className="inline-flex items-center gap-3 group">
            <span className="text-sm font-semibold tracking-widest uppercase">Upload Video</span>
            <span className="w-10 h-10 rounded-full border border-[var(--foreground)] flex items-center justify-center group-hover:bg-[var(--foreground)] group-hover:text-[var(--background)] transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="19" x2="12" y2="5"/>
                <polyline points="5 12 12 5 19 12"/>
              </svg>
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
