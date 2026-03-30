"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Coffee, Star, Trophy, Loader2, UserPlus, UserCheck, Grid, List, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { usePoints } from "@/components/PointsFeedback";
import CoffeeAvatar from "@/components/CoffeeAvatar";
import { ProfileSkeleton } from "@/components/Skeletons";

export default function UserProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { showPoints } = usePoints();
  
  const [profile, setProfile] = useState<any>(null);
  const [tastings, setTastings] = useState<any[]>([]);
  const [stats, setStats] = useState({ count: 0, avgRating: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
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
        setProfile((prev: any) => ({ ...prev, followers_count: (prev.followers_count || 1) - 1 }));
      } else {
        await supabase.from('follows').insert({ follower_id: currentUserId, following_id: id });
        setIsFollowing(true);
        setProfile((prev: any) => ({ ...prev, followers_count: (prev.followers_count || 0) + 1 }));
        showPoints(10, `Tu suis maintenant ${profile.username} !`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFollowLoading(false);
    }
  };

  if (isLoading) return <ProfileSkeleton />;

  return (
    <div className="min-h-screen bg-[#EBE2D4] pb-32 animate-in fade-in duration-700">
      {/* Header Mural */}
      <header className="bg-[#EBE2D4] border-b-4 border-[#1A0F0A] px-6 py-6 flex items-center gap-4 sticky top-0 z-40 shadow-[0_4px_0_rgba(26,15,10,0.1)]">
        <button onClick={() => router.back()} className="p-2 bg-white border-2 border-[#1A0F0A] rounded-full shadow-[2px_2px_0_#1A0F0A] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all">
          <ArrowLeft size={20} strokeWidth={3} />
        </button>
        <h1 className="text-xl font-black text-[#1A0F0A] tracking-tighter uppercase font-serif italic truncate">Atelier de {profile?.username}</h1>
      </header>

      <div className="max-w-md mx-auto p-6 space-y-8">
        
        {/* Profile Card Hero */}
        <div className="bg-white rounded-[2.5rem] p-10 border-4 border-[#1A0F0A] shadow-[8px_8px_0_#1A0F0A] flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-stone-100 border-b-2 border-[#1A0F0A]/10"></div>
          
          <div className="relative mt-6">
            <div className="relative p-1 bg-white border-4 border-[#1A0F0A] rounded-full shadow-xl">
              <CoffeeAvatar config={profile?.avatar_config || {}} size={140} />
            </div>
          </div>

          <div className="mt-8 space-y-4 w-full">
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-[#1A0F0A] tracking-tighter uppercase font-serif">{profile?.username}</h2>
              <div className="inline-flex items-center gap-2 bg-[#1A0F0A] text-[#EBE2D4] px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 border-[#1A0F0A]">
                <Trophy size={14} className="text-amber-400" />
                {profile?.level || "Grain Vert 🌱"}
              </div>
            </div>

            {/* XP PROGRESS BAR */}
            <div className="w-full max-w-[200px] mx-auto space-y-1.5">
              <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-[#1A0F0A]/40">
                <span>XP: {profile?.points || 0}</span>
                <span>Next Level</span>
              </div>
              <div className="w-full h-3 bg-stone-100 border-2 border-[#1A0F0A] rounded-full overflow-hidden shadow-[2px_2px_0_#1A0F0A]">
                <div 
                  className="h-full bg-[#B44222] transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${Math.min(100, ((profile?.points || 0) % 500) / 5)}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>

          {currentUserId && (
            <button 
              onClick={handleFollow}
              disabled={isFollowLoading}
              className={`mt-8 w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 border-3 ${
                isFollowing 
                  ? "bg-[#EBE2D4] text-[#1A0F0A] border-[#1A0F0A] opacity-60" 
                  : "bg-[#1A0F0A] text-[#EBE2D4] border-[#1A0F0A] shadow-[0_6px_0_#B44222] hover:-translate-y-1 active:translate-y-0 active:shadow-none"
              }`}
            >
              {isFollowLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : isFollowing ? (
                <>
                  <UserCheck size={20} />
                  Abonné
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  S'abonner
                </>
              )}
            </button>
          )}

          {/* Social Stats */}
          <div className="flex gap-8 mt-8">
            <div className="flex flex-col items-center">
              <span className="text-xl font-black text-[#1A0F0A]">{profile?.followers_count || 0}</span>
              <span className="text-[10px] font-bold text-[#1A0F0A]/40 uppercase tracking-widest">Followers</span>
            </div>
            <div className="w-px h-8 bg-[#1A0F0A]/10 self-center"></div>
            <div className="flex flex-col items-center">
              <span className="text-xl font-black text-[#1A0F0A]">{profile?.following_count || 0}</span>
              <span className="text-[10px] font-bold text-[#1A0F0A]/40 uppercase tracking-widest">Suivis</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 w-full gap-4 mt-8 pt-8 border-t-2 border-[#1A0F0A]/5">
            <div className="flex flex-col">
              <span className="text-2xl font-black text-[#1A0F0A]">{stats.count}</span>
              <span className="text-[10px] font-bold text-[#1A0F0A]/40 uppercase tracking-widest">Archive</span>
            </div>
            <div className="flex flex-col border-x-2 border-[#1A0F0A]/5">
              <span className="text-2xl font-black text-[#1A0F0A]">{stats.avgRating}</span>
              <span className="text-[10px] font-bold text-[#1A0F0A]/40 uppercase tracking-widest">Note</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-[var(--color-accent)]">{profile?.points || 0}</span>
              <span className="text-[10px] font-bold text-[#1A0F0A]/40 uppercase tracking-widest">Beans</span>
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex border-4 border-[#1A0F0A] bg-white rounded-2xl p-1 overflow-hidden shadow-[4px_4px_0_#1A0F0A]">
          <button 
            onClick={() => setViewMode('grid')}
            className={`flex-1 flex items-center justify-center py-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-[#1A0F0A] text-[#EBE2D4]' : 'text-[#1A0F0A]/40'}`}
          >
            <Grid size={20} />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`flex-1 flex items-center justify-center py-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-[#1A0F0A] text-[#EBE2D4]' : 'text-[#1A0F0A]/40'}`}
          >
            <List size={20} />
          </button>
        </div>

        {/* Tastings Display */}
        <div className="space-y-4">
          {tastings.length === 0 ? (
            <div className="bg-white rounded-[2.5rem] p-16 text-center border-4 border-dashed border-[#1A0F0A]/10">
              <Coffee className="mx-auto text-stone-200 mb-4" size={60} />
              <p className="text-[#1A0F0A]/40 font-serif text-lg italic">Aucune archive publique...</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-3 gap-2">
              {tastings.map((item) => (
                <button 
                  key={item.id}
                  onClick={() => router.push(`/tasting/${item.id}`)}
                  className="aspect-square bg-white border-2 border-[#1A0F0A] rounded-xl overflow-hidden shadow-[2px_2px_0_#1A0F0A] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all relative group"
                >
                  {item.image_url ? (
                    <img src={item.image_url} className="w-full h-full object-cover" alt={item.coffee_name} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#FDFBFB]">
                      <Coffee size={20} className="text-stone-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-[#1A0F0A]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white font-black text-xs">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    {item.rating}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {tastings.map((item) => (
                <button 
                  key={item.id} 
                  onClick={() => router.push(`/tasting/${item.id}`)}
                  className="w-full bg-white p-5 rounded-[2rem] border-4 border-[#1A0F0A] shadow-[6px_6px_0_#1A0F0A] flex items-center justify-between group text-left hover:translate-x-1 transition-transform"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-stone-100 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-[#1A0F0A]/10">
                      {item.image_url ? <img src={item.image_url} className="w-full h-full object-cover" /> : <Coffee size={24} className="text-stone-300" />}
                    </div>
                    <div>
                      <p className="font-black text-[#1A0F0A] leading-tight font-serif text-lg">{item.coffee_name}</p>
                      <p className="text-[10px] font-black text-[#1A0F0A]/40 uppercase tracking-widest">{item.brand}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#EBE2D4] px-3 py-1.5 rounded-xl border-2 border-[#1A0F0A]">
                    <span className="font-black text-[#1A0F0A]">{item.rating}</span>
                    <Star size={14} className="fill-amber-500 text-amber-500" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
