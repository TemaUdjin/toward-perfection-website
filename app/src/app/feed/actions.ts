'use server'

import { createClient } from '@/lib/supabase/server'

export async function createPost(body: string): Promise<{ error?: string }> {
  const trimmed = body.trim()
  if (!trimmed) return { error: 'Post cannot be empty' }
  if (trimmed.length > 2000) return { error: 'Post too long (max 2000 chars)' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const title = trimmed.length > 60 ? trimmed.slice(0, 57) + '...' : trimmed

  const { error } = await supabase
    .from('forum_threads')
    .insert({ user_id: user.id, title, body: trimmed })

  if (error) {
    if (error.code === '42501') return { error: 'Active subscription required to post' }
    return { error: error.message }
  }

  return {}
}
