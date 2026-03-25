"use client";

import { useState, useEffect } from "react";
import { Search, ShoppingBag, Loader2, Coffee, Users, UserPlus, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { DiscoverSkeleton } from "@/components/Skeletons";
import { useRouter } from "next/navigation";
import CoffeeAvatar from "@/components/CoffeeAvatar";

type Mode = 'coffee' | 'people';

export default function DiscoverPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('coffee');
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      try {
        if (mode === 'coffee') {
          let query = supabase.from('coffees').select('*');
          if (searchTerm.length > 2) query = query.ilike('name', `%${searchTerm}%`).limit(20);
          else query = query.order('created_at', { ascending: false }).limit(6);
          const { data } = await query;
          setResults(data || []);
        } else {
          // RECHERCHE DE PROFILS
          let query = supabase.from('profiles').select('id, username, level, avatar_config');
          if (searchTerm.length > 0) query = query.ilike('username', `%${searchTerm}%`).limit(20);
          else query = query.order('points', { ascending: false }).limit(10);
          const { data } = await query;
          setResults(data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, mode]);

  return (
    <div className="p-4 pt-10 pb-32 flex flex-col gap-6 bg-stone-50 min-h-screen">
      <header className="mb-2">
        <h1 className="text-3xl font-black tracking-tight text-[var(--color-primary)]">DÉCOUVRIR</h1>
        
        {/* Toggle Mode */}
        <div className="flex bg-stone-200/50 p-1 rounded-2xl mt-4 w-full">
          <button 
            onClick={() => { setMode('coffee'); setSearchTerm(""); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${mode === 'coffee' ? 'bg-white text-[var(--color-primary)] shadow-sm' : 'text-stone-400'}`}
          >
            <Coffee size={18} /> Cafés
          </button>
          <button 
            onClick={() => { setMode('people'); setSearchTerm(""); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${mode === 'people' ? 'bg-white text-[var(--color-primary)] shadow-sm' : 'text-stone-400'}`}
          >
            <Users size={18} /> Baristas
          </button>
        </div>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={mode === 'coffee' ? "Chercher un café, une marque..." : "Chercher un barista..."} 
          className="w-full bg-white border border-stone-200 rounded-3xl py-5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm shadow-sm transition-all font-medium"
        />
      </div>

      <div className="space-y-4">
        <h2 className="font-black text-stone-400 text-xs uppercase tracking-[0.2em] ml-2">
          {searchTerm ? 'Résultats' : (mode === 'coffee' ? 'Sélection du moment' : 'Top Baristas')}
        </h2>
        
        {isLoading ? <DiscoverSkeleton /> : (
          <div className={mode === 'coffee' ? "grid grid-cols-2 gap-4" : "flex flex-col gap-3"}>
            {results.map(item => (
              mode === 'coffee' ? (
                <div key={item.id} className="bg-white rounded-[2.5rem] border border-stone-200 shadow-sm overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
                  <div className="h-32 bg-stone-100/50 flex items-center justify-center p-4">
                    {item.image_url ? <img src={item.image_url} alt={item.name} className="h-full object-contain" /> : <Coffee className="text-stone-200" size={32} />}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <p className="text-[10px] font-black text-[var(--color-accent)] uppercase mb-1">{item.brand}</p>
                    <h3 className="font-bold text-sm leading-tight line-clamp-2 mb-4">{item.name}</h3>
                    <button onClick={() => item.url && window.open(item.url, '_blank')} className="mt-auto bg-stone-900 text-white p-3 rounded-2xl flex items-center justify-center hover:bg-[var(--color-primary)] transition-colors">
                      <ShoppingBag size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div key={item.id} onClick={() => router.push(`/profile/${item.id}`)} className="bg-white p-4 rounded-[2rem] border border-stone-200 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-stone-100 rounded-2xl overflow-hidden border border-white shadow-inner">
                      <CoffeeAvatar config={item.avatar_config || {}} size={56} noBackground />
                    </div>
                    <div>
                      <p className="font-black text-stone-800 leading-none">{item.username}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase">{item.level}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-stone-50 p-3 rounded-full text-stone-300 group-hover:text-[var(--color-primary)] group-hover:bg-[var(--color-primary)]/5 transition-all">
                    <ArrowRight size={20} />
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
