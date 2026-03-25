"use client";

import { useState, useEffect, useCallback } from "react";
import { Settings, Coffee, Star, Trophy, Loader2, LogOut, Palette } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import CoffeeAvatar from "@/components/CoffeeAvatar";
import { ProfileSkeleton } from "@/components/Skeletons";
import TastingActions from "@/components/TastingActions";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [tastings, setTastings] = useState<any[]>([]);
  const [stats, setStats] = useState({ count: 0, avgRating: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/auth");
        return;
      }

      const userId = session.user.id;

      const [pRes, tRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
        supabase.from('tastings').select('*').eq('user_id', userId).order('created_at', { ascending: false })
      ]);

      if (pRes.data) setProfile(pRes.data);
      else setProfile({ username: session.user.email?.split('@')[0], points: 0, level: 'Débutant' });

      if (tRes.data) {
        setTastings(tRes.data);
        const count = tRes.data.length;
        const avg = count > 0 ? tRes.data.reduce((acc: any, curr: any) => acc + curr.rating, 0) / count : 0;
        setStats({ count, avgRating: parseFloat(avg.toFixed(1)) });
      }
    } catch (err: any) {
      console.error("Critical Load Error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  const handleDeleteTasting = (id: number) => {
    setTastings(prev => {
      const newList = prev.filter(t => t.id !== id);
      const count = newList.length;
      const avg = count > 0 ? newList.reduce((acc: any, curr: any) => acc + curr.rating, 0) / count : 0;
      setStats({ count, avgRating: parseFloat(avg.toFixed(1)) });
      return newList;
    });
  };

  if (isLoading) return <ProfileSkeleton />;

  return (
    <div className="min-h-screen bg-stone-50 pb-32 animate-in fade-in duration-700">
      {/* Header compact & pro */}
      <header className="bg-white border-b border-stone-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-black text-[var(--color-primary)] tracking-tight">MON COMPTE</h1>
        <div className="flex gap-1">
          <button className="p-2 text-stone-400 hover:text-stone-600 transition-colors"><Settings size={20} /></button>
          <button onClick={handleLogout} className="p-2 text-red-400 hover:text-red-600 transition-colors"><LogOut size={20} /></button>
        </div>
      </header>

      <div className="max-w-md mx-auto p-6 space-y-8">
        
        {/* Profile Card Hero */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-stone-200 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 bg-[var(--color-primary)]/5"></div>
          
          <div className="relative mt-4">
            <CoffeeAvatar config={profile?.avatar_config || {}} size={140} className="shadow-2xl border-4 border-white" />
            <button 
              onClick={() => router.push("/profile/avatar")}
              className="absolute bottom-0 right-0 bg-[var(--color-primary)] text-white p-3 rounded-2xl shadow-lg hover:scale-110 active:scale-90 transition-all border-4 border-white"
            >
              <Palette size={20} />
            </button>
          </div>

          <div className="mt-6 space-y-1">
            <h2 className="text-2xl font-black text-stone-800">{profile?.username}</h2>
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-1 rounded-full text-xs font-bold border border-amber-100">
              <Trophy size={14} />
              {profile?.level || "Apprenti"}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 w-full gap-4 mt-8 pt-8 border-t border-stone-100">
            <div className="flex flex-col">
              <span className="text-2xl font-black text-stone-800">{stats.count}</span>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Cafés</span>
            </div>
            <div className="flex flex-col border-x border-stone-100">
              <span className="text-2xl font-black text-stone-800">{stats.avgRating}</span>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Note</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-[var(--color-accent)]">{profile?.points || 0}</span>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Points</span>
            </div>
          </div>
        </div>

        {/* Tastings List */}
        <div className="space-y-4">
          <div className="flex justify-between items-end px-2">
            <h3 className="font-black text-stone-800 text-lg uppercase tracking-tight">Dernières notes</h3>
            <span className="text-stone-400 text-xs font-bold">{tastings.length} TOTAL</span>
          </div>

          <div className="space-y-3">
            {tastings.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border-2 border-dashed border-stone-200">
                <Coffee className="mx-auto text-stone-200 mb-2" size={40} />
                <p className="text-stone-400 text-sm font-medium">Aucune dégustation enregistrée</p>
              </div>
            ) : (
              tastings.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between group hover:border-[var(--color-primary)] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-stone-100 rounded-2xl overflow-hidden flex items-center justify-center border border-stone-100 shadow-inner">
                      {item.image_url ? <img src={item.image_url} className="w-full h-full object-cover" /> : <Coffee size={24} className="text-stone-300" />}
                    </div>
                    <div>
                      <p className="font-bold text-stone-800 leading-tight group-hover:text-[var(--color-primary)] transition-colors">{item.coffee_name}</p>
                      <p className="text-xs font-bold text-stone-400 uppercase tracking-wide">{item.brand}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-100">
                      <span className="font-black text-stone-800">{item.rating}</span>
                      <Star size={14} className="fill-amber-400 text-amber-400" />
                    </div>
                    <TastingActions 
                      tasting={item}
                      onUpdate={loadData}
                      onDelete={handleDeleteTasting}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
