"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { DiscoverSkeleton } from "@/components/Skeletons";
import SearchHeader from "@/components/SearchHeader";
import CoffeeResultCard from "@/components/CoffeeResultCard";
import BaristaResultCard from "@/components/BaristaResultCard";
import { useSearchParams } from "next/navigation";
import { Loader2, Plus } from "lucide-react";

type Mode = 'coffee' | 'people';

function DiscoverContent() {
  const searchParams = useSearchParams();
  const initialMode = (searchParams.get('mode') as Mode) || 'coffee';
  
  const [mode, setMode] = useState<Mode>(initialMode);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);

  // Scroll Listener for Collapsible Header
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY;
      if (scrollPos > 80 && !isHeaderCollapsed) {
        setIsHeaderCollapsed(true);
      } else if (scrollPos <= 80 && isHeaderCollapsed) {
        setIsHeaderCollapsed(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHeaderCollapsed]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const userId = data.user?.id || null;
      setCurrentUserId(userId);
      if (userId) {
        supabase.from('follows')
          .select('following_id')
          .eq('follower_id', userId)
          .then(({ data: followsData }) => {
            if (followsData) setFollowingIds(followsData.map(f => f.following_id));
          });
      }
    });
  }, []);

  const performSearch = useCallback(async (term: string, currentMode: Mode, currentCat: string, currentPage: number, append = false) => {
    if (append) setIsLoadingMore(true);
    else setIsLoading(true);

    try {
      if (currentMode === 'coffee') {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}&category=${currentCat}&page=${currentPage}`);
        const data = await res.json();
        
        if (append) {
          setResults(prev => [...prev, ...(data.products || [])]);
        } else {
          setResults(data.products || []);
        }
        setHasMore(data.hasMore || false);
      } else {
        // Baristas search
        let query = supabase
          .from('profiles')
          .select('id, username, level, avatar_config, followers_count');
        
        if (term.length > 0) {
          query = query.ilike('username', `%${term}%`).limit(20);
        } else {
          query = query.order('points', { ascending: false }).limit(10);
        }
        
        const { data } = await query;
        setResults(data || []);
        setHasMore(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  // Effect pour la recherche initiale ou le changement de filtres
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      performSearch(searchTerm, mode, category, 1, false);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, mode, category, performSearch]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    performSearch(searchTerm, mode, category, nextPage, true);
  };

  const handleBrandClick = (brand: string) => {
    if (searchTerm === brand) {
      setSearchTerm("");
    } else {
      setSearchTerm(brand);
      setMode('coffee');
    }
  };

  return (
    <div className="p-4 pb-32 flex flex-col gap-6 bg-stone-50 min-h-screen">
      
      <SearchHeader 
        mode={mode}
        setMode={setMode}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onBrandClick={handleBrandClick}
        category={category}
        setCategory={setCategory}
        isCollapsed={isHeaderCollapsed}
      />

      <div className="space-y-4">
        <h2 className="font-black text-stone-400 text-[10px] uppercase tracking-[0.2em] ml-2">
          {searchTerm ? 'Résultats de recherche' : (mode === 'coffee' ? 'Sélection premium' : 'Meilleurs Baristas')}
        </h2>
        
        {isLoading ? (
          <DiscoverSkeleton />
        ) : results.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border-4 border-dashed border-[#1A0F0A]/10">
            <p className="text-[#1A0F0A]/40 font-serif italic text-lg">Aucun grain trouvé pour cette quête...</p>
          </div>
        ) : (
          <>
            <div className={mode === 'coffee' ? "grid grid-cols-2 gap-3" : "flex flex-col gap-3"}>
              {results.map((item, index) => (
                mode === 'coffee' ? (
                  <CoffeeResultCard key={`${item.id}-${index}`} coffee={item} useIllustration={true} compact={true} />
                ) : (
                  <BaristaResultCard 
                    key={item.id} 
                    profile={item} 
                    currentUserId={currentUserId}
                    initialIsFollowing={followingIds.includes(item.id)}
                  />
                )
              ))}
            </div>

            {hasMore && mode === 'coffee' && (
              <div className="pt-8 flex justify-center">
                <button 
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="bg-[#1A0F0A] text-[#EBE2D4] px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:-translate-y-1 shadow-[0_6px_0_rgba(26,15,10,1)] active:translate-y-0 active:shadow-none transition-all flex items-center gap-3"
                >
                  {isLoadingMore ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                  Appuyer pour découvrir
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<DiscoverSkeleton />}>
      <DiscoverContent />
    </Suspense>
  );
}
