import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const PAGE_SIZE = 10;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tab = searchParams.get('tab') || 'global';
  const page = parseInt(searchParams.get('page') || '1');
  const supabase = await createClient();

  // 1. Authentification
  const { data: { user } } = await supabase.auth.getUser();
  const currentUserId = user?.id || null;

  // 2. Construction de la requête
  let query = supabase
    .from('tastings')
    .select(`
      *,
      profiles:user_id (
        id,
        username,
        avatar_url,
        level,
        avatar_config
      ),
      likes (
        user_id
      )
    `)
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  // 3. Filtrage "Following"
  if (tab === 'following' && currentUserId) {
    const { data: followsData } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', currentUserId);
    
    const followingIds = followsData?.map(f => f.following_id) || [];
    if (followingIds.length > 0) {
      query = query.in('user_id', followingIds);
    } else {
      return NextResponse.json({ posts: [] });
    }
  }

  const { data: tastings, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 4. Formatage (isLiked)
  const posts = tastings?.map(post => ({
    ...post,
    isLiked: post.likes?.some((l: any) => l.user_id === currentUserId) || false
  })) || [];

  return NextResponse.json({ posts });
}
