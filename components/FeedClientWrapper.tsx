"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import FeedPostCard from "@/components/FeedPostCard";
import WelcomeOnboarding from "@/components/WelcomeOnboarding";
import { supabase } from "@/lib/supabase";
import { AvatarConfig } from "@/components/CoffeeAvatar";

interface FeedClientWrapperProps {
  initialPosts: any[];
  currentUserId: string | null;
  initialFollowingIds: string[];
}

export default function FeedClientWrapper({ 
  initialPosts, 
  currentUserId, 
  initialFollowingIds 
}: FeedClientWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'global';
  
  const [posts, setPosts] = useState<any[]>(initialPosts);
  const [followingIds, setFollowingIds] = useState<string[]>(initialFollowingIds);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isOnboardingSaving, setIsOnboardingSaving] = useState(false);
  
  // Infinite Scroll States
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  // Update internal state when server props change
  useEffect(() => {
    setPosts(initialPosts);
    setPage(1);
    setHasMore(initialPosts.length >= 10); // Suppose 10 is the limit
  }, [initialPosts]);

  // Check Onboarding status
  useEffect(() => {
    async function checkOnboarding() {
      if (!currentUserId) return;
      const { data } = await supabase.from('profiles').select('avatar_config, inventory').eq('id', currentUserId).maybeSingle();
      if (data && (!data.inventory || data.inventory.length === 0)) {
        setShowOnboarding(true);
      }
    }
    checkOnboarding();
  }, [currentUserId]);

  const handleOnboardingComplete = async (selectedConfig: AvatarConfig) => {
    if (!currentUserId) return;
    setIsOnboardingSaving(true);
    // On offre 100 Beans virtuels sur la partie UI, Agent CLI fera le vrai job.
    const initialInventory = ['short', 'none', 'tshirt', 'smile'];
    try {
      await supabase.from('profiles').update({
        avatar_config: selectedConfig,
        inventory: initialInventory,
        coins: 100
      }).eq('id', currentUserId);
      setShowOnboarding(false);
      router.refresh(); // Refresh pour mettre à jour la Nav Bar ou les Posts "isOwnPost"
    } catch (e) {
      console.error(e);
    } finally {
      setIsOnboardingSaving(false);
    }
  };

  const fetchMorePosts = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    
    try {
      // NOTE POUR AGENT CLI : Cette route devra être créée. 
      // Elle doit retourner les composants suivant la page Limit/Offset.
      const res = await fetch(`/api/feed?tab=${activeTab}&page=${page + 1}`);
      if (res.ok) {
        const data = await res.json();
        if (data.posts && data.posts.length > 0) {
          setPosts(prev => [...prev, ...data.posts]);
          setPage(prev => prev + 1);
        } else {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error("Erreur de pagination", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [page, activeTab, isLoadingMore, hasMore]);

  // Infinite Scroll Observer Hook
  const lastPostElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchMorePosts();
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [isLoadingMore, hasMore, fetchMorePosts]);

  const handleTabChange = (tab: 'global' | 'following') => {
    // Navigue via Next.js router pour déclencher la Server Component.
    router.push(`/?tab=${tab}`);
  };

  const handleDelete = (id: number) => {
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const handleFollowToggle = (postUserId: string, isNowFollowing: boolean) => {
    if (isNowFollowing) {
      setFollowingIds(prev => [...prev, postUserId]);
    } else {
      setFollowingIds(prev => prev.filter(id => id !== postUserId));
      if (activeTab === 'following') {
        setPosts(prev => prev.filter(p => p.user_id !== postUserId));
      }
    }
  };

  return (
    <>
      {showOnboarding && <WelcomeOnboarding onComplete={handleOnboardingComplete} />}
      
      <header className="flex flex-col gap-4 mb-6 relative z-10">
        <div>
          <h1 className="text-4xl text-[#1A0F0A] mb-2 font-serif font-black tracking-tighter">Coffinity</h1>
          <p className="text-[#1A0F0A] font-bold text-sm tracking-wide opacity-80 uppercase">The Botanical Brewery</p>
        </div>

        {/* BRUTALIST TABS */}
        {currentUserId && (
          <div className="flex p-1.5 rounded-2xl w-fit self-center sm:self-start bg-[#1A0F0A] shadow-[0_4px_0_rgba(26,15,10,0.5)] border-2 border-[#1A0F0A]">
            <button 
              onClick={() => handleTabChange('global')}
              className={`px-8 py-2.5 rounded-xl text-sm font-black transition-all uppercase tracking-widest ${activeTab === 'global' ? 'bg-[#EBE2D4] text-[#1A0F0A] border-2 border-[#1A0F0A] shadow-sm translate-y-0.5' : 'text-[#EBE2D4] hover:bg-[#EBE2D4]/10 border-2 border-transparent'}`}
            >
              Feed
            </button>
            <button 
              onClick={() => handleTabChange('following')}
              className={`px-8 py-2.5 rounded-xl text-sm font-black transition-all uppercase tracking-widest ${activeTab === 'following' ? 'bg-[#EBE2D4] text-[#1A0F0A] border-2 border-[#1A0F0A] shadow-sm translate-y-0.5' : 'text-[#EBE2D4] hover:bg-[#EBE2D4]/10 border-2 border-transparent'}`}
            >
              Tribu
            </button>
          </div>
        )}
      </header>

      {posts.length === 0 ? (
        <div className="text-center py-24 bg-[#EBE2D4] rounded-[2rem] border-[3px] border-[#1A0F0A] shadow-[0_8px_0_rgba(26,15,10,1)] px-8 -rotate-1 relative overflow-hidden group">
           <div className="absolute inset-0 opacity-10 bg-[url('/vintage_branch.png')] mix-blend-multiply bg-center bg-cover transition-transform duration-[10s] group-hover:scale-110"></div>
           <p className="text-[#1A0F0A] mb-6 font-serif text-2xl font-bold relative z-10 leading-tight">
             {activeTab === 'following' 
               ? "Le silence absolu.\nTa tribu dort profondément." 
               : "Rien à se mettre sous la dent aujourd'hui."}
           </p>
           <button 
            onClick={() => router.push('/discover?mode=people')}
            className="bg-[#1A0F0A] text-[#EBE2D4] px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:-translate-y-1 shadow-lg active:translate-y-0 relative z-10 transition-transform"
           >
             {activeTab === 'following' ? "Trouver des Artisans" : "Briser la Glace"}
           </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {posts.map((post, index) => {
            const isLastElement = index === posts.length - 1;
            return (
              <div ref={isLastElement ? lastPostElementRef : null} key={post.id}>
                <FeedPostCard 
                  post={post} 
                  currentUserId={currentUserId}
                  router={router}
                  isFollowing={followingIds.includes(post.user_id)}
                  onFollowToggle={(isFollow: boolean) => handleFollowToggle(post.user_id, isFollow)}
                  onUpdate={() => router.refresh()}
                  onDelete={handleDelete}
                />
              </div>
            );
          })}
          
          {/* LOADER INFINITE SCROLL */}
          {isLoadingMore && (
            <div className="w-full flex justify-center py-8">
              <div className="bg-[#1A0F0A] text-[#EBE2D4] p-4 rounded-full animate-bounce shadow-xl">
                 <Loader2 size={24} className="animate-spin" />
              </div>
            </div>
          )}
          
          {!hasMore && posts.length > 5 && (
            <div className="w-full flex flex-col items-center py-12 opacity-50">
               <div className="w-1 h-8 bg-[#1A0F0A] mb-4"></div>
               <p className="text-[10px] font-black uppercase tracking-[0.3em] font-sans text-[#1A0F0A]">Fin des Archives</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
