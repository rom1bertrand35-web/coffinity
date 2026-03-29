"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  const [posts, setPosts] = useState<any[]>(initialPosts);
  const [followingIds, setFollowingIds] = useState<string[]>(initialFollowingIds);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isOnboardingSaving, setIsOnboardingSaving] = useState(false);
  
  // Infinite Scroll States
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialPosts.length >= 10);
  const [page, setPage] = useState(1);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  // Update internal state when server props change
  useEffect(() => {
    setPosts(initialPosts);
    setPage(1);
    setHasMore(initialPosts.length >= 10);
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

  const handleOnboardingComplete = async (data: { 
    avatarConfig: AvatarConfig, 
    baristaType: string, 
    preferences: any 
  }) => {
    if (!currentUserId) return;
    setIsOnboardingSaving(true);
    const initialInventory = ['short', 'none', 'tshirt', 'smile'];
    try {
      await supabase.from('profiles').update({
        avatar_config: data.avatarConfig,
        barista_type: data.baristaType,
        preferences: data.preferences,
        inventory: initialInventory,
        points: 100 // Unifié sur points (Beans)
      }).eq('id', currentUserId);
      setShowOnboarding(false);
      router.refresh();
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
      const res = await fetch(`/api/feed?page=${page + 1}`);
      if (res.ok) {
        const data = await res.json();
        if (data.posts && data.posts.length > 0) {
          setPosts(prev => [...prev, ...data.posts]);
          setPage(prev => prev + 1);
          setHasMore(data.posts.length >= 10);
        } else {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error("Erreur de pagination", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [page, isLoadingMore, hasMore]);

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

  const handleDelete = (id: number) => {
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const handleFollowToggle = (postUserId: string, isNowFollowing: boolean) => {
    if (isNowFollowing) {
      setFollowingIds(prev => [...prev, postUserId]);
    } else {
      setFollowingIds(prev => prev.filter(id => id !== postUserId));
      // Remove posts from this user from feed immediately
      setPosts(prev => prev.filter(p => p.user_id !== postUserId || p.user_id === currentUserId));
    }
  };

  return (
    <>
      {showOnboarding && <WelcomeOnboarding onComplete={handleOnboardingComplete} />}
      
      {posts.length === 0 ? (
        <div className="text-center py-24 bg-[#EBE2D4] rounded-[2rem] border-[3px] border-[#1A0F0A] shadow-[0_8px_0_rgba(26,15,10,1)] px-8 -rotate-1 relative overflow-hidden group">
           <div className="absolute inset-0 opacity-10 bg-[url('/vintage_branch.png')] mix-blend-multiply bg-center bg-cover transition-transform duration-[10s] group-hover:scale-110"></div>
           <p className="text-[#1A0F0A] mb-6 font-serif text-2xl font-bold relative z-10 leading-tight whitespace-pre-line">
             Le silence absolu.{"\n"}Personne n'a encore brassé ici.
           </p>
           <button 
            onClick={() => router.push('/discover?mode=people')}
            className="bg-[#1A0F0A] text-[#EBE2D4] px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:-translate-y-1 shadow-lg active:translate-y-0 relative z-10 transition-transform"
           >
             Trouver des Artisans
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
