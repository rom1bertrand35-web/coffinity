"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { DiscoverSkeleton } from "@/components/Skeletons";
import SearchHeader from "@/components/SearchHeader";
import CoffeeResultCard from "@/components/CoffeeResultCard";
import BaristaResultCard from "@/components/BaristaResultCard";
import { useSearchParams } from "next/navigation";

type Mode = 'coffee' | 'people';

function DiscoverContent() {
  const searchParams = useSearchParams();
  const initialMode = (searchParams.get('mode') as Mode) || 'coffee';
  
  const [mode, setMode] = useState<Mode>(initialMode);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [followingIds, setFollowingIds] = useState<string[]>([]);

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

  const performSearch = useCallback(async (term: string, currentMode: Mode) => {
    setIsLoading(true);
    try {
      if (currentMode === 'coffee') {
        // Utiliser notre nouvelle API de recherche hybride
        const res = await fetch(`/api/search?q=${encodeURIComponent(term || 'café')}`);
        const data = await res.json();
        setResults(data.products || []);
      } else {
        // Recherche de profils via Supabase
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
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      performSearch(searchTerm, mode);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, mode, performSearch]);

  const handleBrandClick = (brand: string) => {
    setSearchTerm(brand);
    setMode('coffee');
  };

  return (
    <div className="p-4 pb-32 flex flex-col gap-6 bg-stone-50 min-h-screen">
      
      <SearchHeader 
        mode={mode}
        setMode={setMode}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onBrandClick={handleBrandClick}
      />

      <div className="space-y-4">
        <h2 className="font-black text-stone-400 text-[10px] uppercase tracking-[0.2em] ml-2">
          {searchTerm ? 'Résultats de recherche' : (mode === 'coffee' ? 'Sélection premium' : 'Meilleurs Baristas')}
        </h2>
        
        {isLoading ? (
          <DiscoverSkeleton />
        ) : results.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-stone-200">
            <p className="text-stone-400 font-medium">Aucun résultat trouvé pour "{searchTerm}"</p>
          </div>
        ) : (
          <div className={mode === 'coffee' ? "grid grid-cols-2 gap-4" : "flex flex-col gap-3"}>
            {results.map(item => (
              mode === 'coffee' ? (
                <CoffeeResultCard key={item.id} coffee={item} />
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
