import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Nav } from '@/components/Nav'
import { FeedClient } from './FeedClient'
import type { FeedEvent, FeedProfile } from '@/lib/feed'

export const dynamic = 'force-dynamic'

export default async function FeedPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: events } = await supabase
    .from('activity_feed')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(30)

  const userIds = [...new Set((events ?? []).map((e) => e.user_id as string))]

  const { data: profiles } = userIds.length
    ? await supabase.from('profiles').select('id, full_name, points').in('id', userIds)
    : { data: [] }

  const profileMap = Object.fromEntries(
    (profiles ?? []).map((p) => [p.id, p as FeedProfile & { id: string }])
  )

  const feed: FeedEvent[] = (events ?? []).map((e) => ({
    id: e.id,
    user_id: e.user_id,
    type: e.type,
    payload: e.payload ?? {},
    created_at: e.created_at,
    profile: profileMap[e.user_id] ?? { full_name: null, points: 0 },
  }))

  const { data: myProfile } = await supabase
    .from('profiles')
    .select('full_name, points')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Nav />

      <div className="max-w-2xl mx-auto px-6 pt-28 pb-24">
        <div className="mb-12">
          <p className="text-[var(--accent)] text-xs font-semibold tracking-[0.3em] uppercase mb-3">
            Community
          </p>
          <h1 className="text-4xl font-bold tracking-[-0.03em]">Feed</h1>
        </div>

        <FeedClient
          initialEvents={feed}
          currentUserId={user.id}
          myProfile={myProfile ?? { full_name: null, points: 0 }}
        />
      </div>
    </div>
  )
}
