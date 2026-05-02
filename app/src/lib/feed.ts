export type FeedEventType = 'lesson_done' | 'post_created' | 'thread_created' | 'joined'

export type FeedPayload = {
  lesson_id?: string
  lesson_title?: string
  course_title?: string
  post_id?: string
  thread_id?: string
  thread_title?: string
  excerpt?: string
  title?: string
}

export type FeedProfile = {
  full_name: string | null
  points: number
}

export type FeedEvent = {
  id: string
  user_id: string
  type: FeedEventType
  payload: FeedPayload
  created_at: string
  profile: FeedProfile
}

export function getLevel(points: number): 'Foundation' | 'Build' | 'Mastery' {
  if (points >= 150) return 'Mastery'
  if (points >= 50) return 'Build'
  return 'Foundation'
}

export function getLevelColor(level: ReturnType<typeof getLevel>): string {
  if (level === 'Mastery') return 'text-[var(--foreground)]'
  if (level === 'Build') return 'text-[var(--accent)]'
  return 'text-[var(--muted-foreground)]'
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function eventText(type: FeedEventType, payload: FeedPayload): string {
  switch (type) {
    case 'lesson_done':
      return `completed "${payload.lesson_title}" · ${payload.course_title}`
    case 'thread_created':
      return payload.excerpt || 'shared a post'
    case 'post_created':
      return `replied in "${payload.thread_title}"`
    case 'joined':
      return 'joined the school'
  }
}

export function displayName(profile: FeedProfile): string {
  return profile.full_name?.trim() || 'Anonymous'
}

export function nameInitial(profile: FeedProfile): string {
  const name = displayName(profile)
  return name[0].toUpperCase()
}
