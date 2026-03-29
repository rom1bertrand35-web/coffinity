import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const PAGE_SIZE = 10;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const supabase = await createClient();

  // 1. Authentification
  const { data: { user } } = await supabase.auth.getUser();
  const currentUserId = user?.id || null;

  if (!currentUserId) {
    return NextResponse.json({ posts: [] });
  }

  // 2. Get Following IDs
  const { data: followsData } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', currentUserId);
  
  const followingIds = followsData?.map(f => f.following_id) || [];
  
  // 3. Query: My posts OR following posts
  // Note: We include currentUserId in the list
  const allowedUserIds = [currentUserId, ...followingIds];

  const { data: tastings, error } = await supabase
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
    .in('user_id', allowedUserIds)
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

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
