import { createClient } from "@/lib/supabase/server";
import FeedClientWrapper from "@/components/FeedClientWrapper";
import WeeklySelection from "@/components/WeeklySelection";

export default async function FeedView({ currentUserId }: { currentUserId: string }) {
  const supabase = await createClient();
  
  // 1. Initial fetch of following IDs
  const { data: followsData } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', currentUserId);
  
  const initialFollowingIds = followsData?.map(f => f.following_id) || [];
  const allowedUserIds = [currentUserId, ...initialFollowingIds];

  // 2. Initial fetch of first 10 posts
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
    .range(0, 9);

  const initialPosts = tastings?.map(post => ({
    ...post,
    isLiked: post.likes?.some((l: any) => l.user_id === currentUserId) || false
  })) || [];

  return (
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 p-4 pt-10 pb-32 relative">
      
      {/* LEFT / CENTER COLUMN: FEED */}
      <div className="flex-1 max-w-2xl mx-auto w-full space-y-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-5xl text-[var(--color-primary)] font-serif font-black tracking-tighter italic">Coffinity</h1>
          <p className="text-[var(--color-muted-foreground)] text-sm italic font-medium uppercase tracking-[0.2em] opacity-60">Barista Social Club</p>
        </header>

        {/* Mobile-only Weekly Selection (Hidden on desktop because it's in the sidebar) */}
        <div className="md:hidden">
          <WeeklySelection />
        </div>

        <FeedClientWrapper 
          initialPosts={initialPosts} 
          currentUserId={currentUserId}
          initialFollowingIds={initialFollowingIds}
        />
      </div>

      {/* RIGHT COLUMN: STICKY WIDGETS (Desktop Only) */}
      <aside className="hidden md:block w-80 shrink-0 space-y-8 sticky top-10 self-start">
        <div className="bg-white/40 backdrop-blur-sm p-2 rounded-[2.5rem] border-2 border-[#1A0F0A]/5">
           <WeeklySelection />
        </div>
        
        {/* Potentiel pour un futur widget "Profil Aromatique" ou "Baristas à suivre" ici */}
        <div className="bg-[#1A0F0A] p-8 rounded-[2.5rem] border-4 border-[#1A0F0A] shadow-[8px_8px_0_#B44222] text-[#EBE2D4] space-y-4">
           <h3 className="font-serif italic font-black text-xl">L'Atelier IA</h3>
           <p className="text-xs font-bold opacity-60 uppercase tracking-widest leading-relaxed">
             Baristo analyse vos dégustations pour affiner votre profil.
           </p>
           <button className="w-full bg-[#EBE2D4] text-[#1A0F0A] py-3 rounded-full font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform">
             Voir mes stats
           </button>
        </div>
      </aside>
    </div>
  );
}
