"use client";

import { useState, useEffect, useCallback } from "react";
import { Settings, Coffee, Star, Trophy, Loader2, LogOut, Palette, Users, Grid, List, X, Medal } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import CoffeeAvatar from "@/components/CoffeeAvatar";
import { ProfileSkeleton } from "@/components/Skeletons";
import TastingActions from "@/components/TastingActions";
import { Drawer } from "vaul";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [tastings, setTastings] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [stats, setStats] = useState({ count: 0, avgRating: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowingOpen, setIsFollowingOpen] = useState(false);
  const [isFollowersOpen, setIsFollowersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const loadData = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/auth");
        return;
      }

      const userId = session.user.id;

      const [pRes, tRes, followingRes, followersRes, badgesRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
        supabase.from('tastings').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('follows').select('*, profiles:following_id(*)').eq('follower_id', userId),
        supabase.from('follows').select('*, profiles:follower_id(*)').eq('following_id', userId),
        supabase.from('user_badges').select('*, badges(*)').eq('user_id', userId)
      ]);

      if (pRes.data) setProfile(pRes.data);
      else setProfile({ username: session.user.email?.split('@')[0], points: 0, level: 'Débutant' });

      if (tRes.data) {
        setTastings(tRes.data);
        const count = tRes.data.length;
        const avg = count > 0 ? tRes.data.reduce((acc: any, curr: any) => acc + curr.rating, 0) / count : 0;
        setStats({ count, avgRating: parseFloat(avg.toFixed(1)) });
      }

      if (followingRes.data) setFollowing(followingRes.data.map(f => f.profiles));
      if (followersRes.data) setFollowers(followersRes.data.map(f => f.profiles));
      if (badgesRes.data) setBadges(badgesRes.data.map(b => b.badges));

    } catch (err: any) {
      console.error("Critical Load Error:", err);
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
    <div className="min-h-screen bg-[#EBE2D4] pb-32 animate-in fade-in duration-700">
      {/* Header Mural */}
      <header className="bg-[#EBE2D4] border-b-4 border-[#1A0F0A] px-6 py-6 flex justify-between items-center sticky top-0 z-40 shadow-[0_4px_0_rgba(26,15,10,0.1)]">
        <h1 className="text-2xl font-black text-[#1A0F0A] tracking-tighter uppercase font-serif italic">Atelier de {profile?.username}</h1>
        <div className="flex gap-2">
          <button className="p-3 bg-white border-2 border-[#1A0F0A] rounded-2xl shadow-[4px_4px_0_#1A0F0A] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"><Settings size={20} /></button>
          <button onClick={handleLogout} className="p-3 bg-red-50 border-2 border-[#1A0F0A] text-red-600 rounded-2xl shadow-[4px_4px_0_#1A0F0A] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"><LogOut size={20} /></button>
        </div>
      </header>

      <div className="max-w-md mx-auto p-6 space-y-8">
        
        {/* Profile Card Hero */}
        <div className="bg-white rounded-[2.5rem] p-10 border-4 border-[#1A0F0A] shadow-[8px_8px_0_#1A0F0A] flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-stone-100 border-b-2 border-[#1A0F0A]/10"></div>
          
          <div className="relative mt-6">
            <div className="relative p-1 bg-white border-4 border-[#1A0F0A] rounded-full shadow-xl">
              <CoffeeAvatar config={profile?.avatar_config || {}} size={140} />
            </div>
            <button 
              onClick={() => router.push("/profile/avatar")}
              className="absolute bottom-0 right-0 bg-[#1A0F0A] text-[#EBE2D4] p-4 rounded-2xl shadow-lg hover:scale-110 active:scale-90 transition-all border-4 border-white z-10"
            >
              <Palette size={20} />
            </button>
          </div>

          <div className="mt-8 space-y-2">
            <h2 className="text-3xl font-black text-[#1A0F0A] tracking-tighter uppercase font-serif">{profile?.username}</h2>
            <div className="inline-flex items-center gap-2 bg-[#1A0F0A] text-[#EBE2D4] px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 border-[#1A0F0A]">
              <Trophy size={14} className="text-amber-400" />
              {profile?.level || "Apprenti"}
            </div>
          </div>

          {/* Social Stats */}
          <div className="flex gap-8 mt-8">
            <button onClick={() => setIsFollowersOpen(true)} className="flex flex-col items-center group">
              <span className="text-xl font-black text-[#1A0F0A] group-hover:underline">{followers.length}</span>
              <span className="text-[10px] font-bold text-[#1A0F0A]/40 uppercase tracking-widest">Followers</span>
            </button>
            <div className="w-px h-8 bg-[#1A0F0A]/10 self-center"></div>
            <button onClick={() => setIsFollowingOpen(true)} className="flex flex-col items-center group">
              <span className="text-xl font-black text-[#1A0F0A] group-hover:underline">{following.length}</span>
              <span className="text-[10px] font-bold text-[#1A0F0A]/40 uppercase tracking-widest">Suivis</span>
            </button>
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

        {/* Badges Section */}
        {badges.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-black text-[#1A0F0A] text-xs uppercase tracking-[0.3em] ml-2">Succès Débloqués</h3>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {badges.map((badge) => (
                <div 
                  key={badge.id}
                  className="flex-shrink-0 bg-white border-3 border-[#1A0F0A] p-4 rounded-[2rem] shadow-[4px_4px_0_#1A0F0A] flex flex-col items-center gap-2 min-w-[100px] animate-in zoom-in duration-500"
                >
                  <span className="text-3xl">{badge.icon}</span>
                  <p className="text-[8px] font-black uppercase text-center leading-tight tracking-tighter">{badge.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

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
              <p className="text-[#1A0F0A]/40 font-serif text-lg italic">Aucune dégustation dans les archives...</p>
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
                <div key={item.id} className="bg-white p-5 rounded-[2rem] border-4 border-[#1A0F0A] shadow-[6px_6px_0_#1A0F0A] flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-stone-100 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-[#1A0F0A]/10">
                      {item.image_url ? <img src={item.image_url} className="w-full h-full object-cover" /> : <Coffee size={24} className="text-stone-300" />}
                    </div>
                    <div>
                      <p className="font-black text-[#1A0F0A] leading-tight font-serif text-lg">{item.coffee_name}</p>
                      <p className="text-[10px] font-black text-[#1A0F0A]/40 uppercase tracking-widest">{item.brand}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 bg-[#EBE2D4] px-3 py-1.5 rounded-xl border-2 border-[#1A0F0A]">
                      <span className="font-black text-[#1A0F0A]">{item.rating}</span>
                      <Star size={14} className="fill-amber-500 text-amber-500" />
                    </div>
                    <TastingActions 
                      tasting={item}
                      onUpdate={loadData}
                      onDelete={handleDeleteTasting}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODALS / DRAWERS */}
      <FollowListDrawer 
        isOpen={isFollowingOpen} 
        onClose={() => setIsFollowingOpen(false)} 
        title="Artisans suivis" 
        users={following}
        router={router}
      />
      
      <FollowListDrawer 
        isOpen={isFollowersOpen} 
        onClose={() => setIsFollowersOpen(false)} 
        title="Ma Tribu" 
        users={followers}
        router={router}
      />
    </div>
  );
}

function FollowListDrawer({ isOpen, onClose, title, users, router }: any) {
  return (
    <Drawer.Root open={isOpen} onOpenChange={onClose}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" />
        <Drawer.Content className="bg-[#EBE2D4] border-t-4 border-[#1A0F0A] flex flex-col rounded-t-[3rem] h-[80vh] mt-24 fixed bottom-0 left-0 right-0 z-[101] outline-none">
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[#1A0F0A]/20 mt-4 mb-8" />
          
          <div className="px-8 pb-8 flex flex-col h-full">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black text-[#1A0F0A] tracking-tighter uppercase font-serif">{title}</h2>
              <button onClick={onClose} className="p-2 bg-white border-2 border-[#1A0F0A] rounded-full shadow-[2px_2px_0_#1A0F0A] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {users.length === 0 ? (
                <div className="py-20 text-center opacity-40">
                  <Users size={40} className="mx-auto mb-4" />
                  <p className="font-serif italic">Le vide intersidéral...</p>
                </div>
              ) : (
                users.map((user: any) => (
                  <button 
                    key={user.id}
                    onClick={() => { onClose(); router.push(`/profile/${user.id}`); }}
                    className="w-full bg-white p-4 rounded-[2rem] border-4 border-[#1A0F0A] shadow-[4px_4px_0_#1A0F0A] flex items-center justify-between group hover:translate-x-1 transition-transform"
                  >
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#1A0F0A] shadow-sm">
                        <CoffeeAvatar config={user.avatar_config || {}} size={48} />
                      </div>
                      <div>
                        <p className="font-black text-[#1A0F0A] leading-tight text-base uppercase">{user.username}</p>
                        <p className="text-[10px] font-bold text-[#1A0F0A]/40 uppercase tracking-[0.2em]">{user.level || 'Apprenti'}</p>
                      </div>
                    </div>
                    <div className="bg-[#EBE2D4] p-2 rounded-xl border-2 border-[#1A0F0A] group-hover:bg-[#1A0F0A] group-hover:text-[#EBE2D4] transition-colors">
                      <Users size={16} />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
