"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Coffee, Star, Trophy, Loader2, UserPlus, UserCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { usePoints } from "@/components/PointsFeedback";
import CoffeeAvatar from "@/components/CoffeeAvatar";

export default function UserProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { showPoints } = usePoints();
  
  const [profile, setProfile] = useState<any>(null);
  const [tastings, setTastings] = useState<any[]>([]);
  const [stats, setStats] = useState({ count: 0, avgRating: 0 });
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      const myId = session?.user?.id || null;
      setCurrentUserId(myId);

      if (myId === id) {
        router.replace("/profile");
        return;
      }

      const [profileResponse, followResponse, tastingsResponse] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', id).single(),
        myId ? supabase.from('follows').select('*').match({ follower_id: myId, following_id: id }).maybeSingle() : Promise.resolve({ data: null }),
        supabase.from('tastings').select('*').eq('user_id', id).order('created_at', { ascending: false })
      ]);
      
      if (profileResponse.error || !profileResponse.data) {
        console.error("Profile not found:", profileResponse.error);
        router.push("/");
        return;
      }
      setProfile(profileResponse.data);
      setIsFollowing(!!followResponse.data);

      if (tastingsResponse.data) {
        const tastingsData = tastingsResponse.data;
        setTastings(tastingsData);
        const count = tastingsData.length;
        const avg = count > 0 ? tastingsData.reduce((acc: any, curr: any) => acc + curr.rating, 0) / count : 0;
        setStats({ count, avgRating: parseFloat(avg.toFixed(1)) });
      }
    } catch (err) {
      console.error("Critical error loading user profile:", err);
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFollow = async () => {
    if (!currentUserId || isFollowLoading) return;
    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        await supabase.from('follows').delete().match({ follower_id: currentUserId, following_id: id });
        setIsFollowing(false);
      } else {
        await supabase.from('follows').insert({ follower_id: currentUserId, following_id: id });
        setIsFollowing(true);
        showPoints(10, "Tu as commencé à suivre un Barista !");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFollowLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-stone-400 bg-stone-50">
        <Loader2 className="animate-spin mb-2" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-32 animate-in fade-in duration-700">
      <header className="bg-white border-b border-stone-200 px-4 py-4 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-stone-100 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-black text-[var(--color-primary)] tracking-tight uppercase">PROFIL</h1>
      </header>

      <div className="max-w-md mx-auto p-6 space-y-8">
        
        {/* Profile Card Hero */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-stone-200 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 bg-[var(--color-primary)]/5"></div>
          
          <div className="relative mt-4">
            <CoffeeAvatar config={profile?.avatar_config || {}} size={140} className="shadow-2xl border-4 border-white" />
          </div>

          <div className="mt-6 space-y-1">
            <h2 className="text-2xl font-black text-stone-800">{profile?.username}</h2>
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-1 rounded-full text-xs font-bold border border-amber-100">
              <Trophy size={14} />
              {profile?.level || "Apprenti"}
            </div>
          </div>

          {currentUserId && (
            <button 
              onClick={handleFollow}
              disabled={isFollowLoading}
              className={`mt-6 w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 shadow-lg ${
                isFollowing 
                  ? "bg-stone-100 text-stone-500 shadow-none border border-stone-200" 
                  : "bg-[var(--color-primary)] text-white hover:scale-[1.02] active:scale-95"
              }`}
            >
              {isFollowLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : isFollowing ? (
                <>
                  <UserCheck size={20} />
                  ABONNÉ
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  S'ABONNER
                </>
              )}
            </button>
          )}

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
                <p className="text-stone-400 text-sm font-medium">Aucune dégustation publique.</p>
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
                  <div className="flex items-center gap-1.5 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-100">
                    <span className="font-black text-stone-800">{item.rating}</span>
                    <Star size={14} className="fill-amber-400 text-amber-400" />
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
