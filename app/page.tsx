import { createClient } from "@/lib/supabase/server";
import FeedClientWrapper from "@/components/FeedClientWrapper";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const supabase = await createClient();
  
  // 1. Get current user
  const { data: { user } } = await supabase.auth.getUser();
  const currentUserId = user?.id || null;

  // 2. Initial fetch of following IDs
  let initialFollowingIds: string[] = [];
  if (currentUserId) {
    const { data: followsData } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', currentUserId);
    
    initialFollowingIds = followsData?.map(f => f.following_id) || [];
  }

  // 3. Initial fetch of first 10 posts (Global)
  // On récupère les 10 premiers posts côté serveur pour le SEO
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
    .order('created_at', { ascending: false })
    .range(0, 9);

  if (error) {
    console.error("SSR Fetch Error:", error);
  }

  const initialPosts = tastings?.map(post => ({
    ...post,
    isLiked: post.likes?.some((l: any) => l.user_id === currentUserId) || false
  })) || [];

  return (
    <div className="p-4 pt-10 pb-32 flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-5xl text-[var(--color-primary)] font-serif font-black tracking-tighter">Coffinity</h1>
        <p className="text-[var(--color-muted-foreground)] text-sm italic font-medium uppercase tracking-[0.2em] opacity-60">Barista Social Club</p>
      </header>

      {/* Le Wrapper Client gère l'interactivité (tabs, onboarding, infinite scroll) */}
      <FeedClientWrapper 
        initialPosts={initialPosts} 
        currentUserId={currentUserId}
        initialFollowingIds={initialFollowingIds}
      />
    </div>
  );
}
