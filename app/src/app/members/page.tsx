import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Nav } from '@/components/Nav'
import { getLevel, getLevelColor } from '@/lib/feed'

export const dynamic = 'force-dynamic'

export default async function MembersPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  // All profiles sorted by points
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, points, subscription_status')
    .order('points', { ascending: false })

  // Lesson counts per user
  const { data: progressRows } = await supabase
    .from('lesson_progress')
    .select('user_id')

  const lessonCounts: Record<string, number> = {}
  for (const row of progressRows ?? []) {
    lessonCounts[row.user_id] = (lessonCounts[row.user_id] ?? 0) + 1
  }

  const members = (profiles ?? []).map((p, i) => ({
    ...p,
    rank: i + 1,
    lessons: lessonCounts[p.id] ?? 0,
    isMe: p.id === user.id,
    name: p.full_name?.trim() || 'Anonymous',
    initial: (p.full_name?.trim() || 'A')[0].toUpperCase(),
    level: getLevel(p.points ?? 0),
  }))

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Nav />

      <div className="max-w-2xl mx-auto px-6 pt-28 pb-24">
        <div className="mb-12">
          <p className="text-[var(--accent)] text-xs font-semibold tracking-[0.3em] uppercase mb-3">
            Community
          </p>
          <div className="flex items-end justify-between">
            <h1 className="text-4xl font-bold tracking-[-0.03em]">Members</h1>
            <p className="text-sm text-[var(--muted-foreground)] pb-1">
              {members.length} {members.length === 1 ? 'member' : 'members'}
            </p>
          </div>
        </div>

        {members.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-[var(--muted-foreground)] text-sm">No members yet.</p>
          </div>
        ) : (
          <div>
            {members.map((member) => {
              const levelColor = getLevelColor(member.level)
              return (
                <Link
                  key={member.id}
                  href={`/profile/${member.id}`}
                  className={`flex items-center gap-4 py-4 border-b border-[var(--border)] hover:bg-[var(--muted)] -mx-3 px-3 rounded-lg transition-colors group ${
                    member.isMe ? 'bg-[var(--muted)]/50' : ''
                  }`}
                >
                  {/* Rank */}
                  <span className="w-6 text-right text-xs text-[var(--muted-foreground)] flex-shrink-0 font-mono">
                    {member.rank}
                  </span>

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--muted)] border border-[var(--border)] flex items-center justify-center text-sm font-semibold text-[var(--muted-foreground)] flex-shrink-0">
                    {member.avatar_url ? (
                      <Image
                        src={member.avatar_url}
                        alt={member.name}
                        width={40}
                        height={40}
                        className="object-cover w-full h-full"
                        unoptimized
                      />
                    ) : (
                      member.initial
                    )}
                  </div>

                  {/* Name + level */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold truncate">
                        {member.name}
                      </span>
                      {member.isMe && (
                        <span className="text-[9px] font-semibold tracking-widest uppercase text-[var(--muted-foreground)] border border-[var(--border)] px-1.5 py-0.5 rounded">
                          You
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] font-semibold tracking-[0.15em] uppercase ${levelColor}`}>
                      {member.level}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-5 flex-shrink-0 text-right">
                    <div>
                      <p className="text-sm font-semibold text-[var(--accent)]">{member.points ?? 0}</p>
                      <p className="text-[9px] text-[var(--muted-foreground)] uppercase tracking-wide">pts</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{member.lessons}</p>
                      <p className="text-[9px] text-[var(--muted-foreground)] uppercase tracking-wide">lessons</p>
                    </div>
                    <svg
                      width="12" height="12" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2"
                      className="text-[var(--muted-foreground)] group-hover:translate-x-0.5 group-hover:text-[var(--accent)] transition-all"
                    >
                      <line x1="5" y1="12" x2="19" y2="12"/>
                      <polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
