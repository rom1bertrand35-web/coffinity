"use client";

import { useState } from "react";
import { ArrowRight, UserPlus, UserCheck, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import CoffeeAvatar from "./CoffeeAvatar";
import { supabase } from "@/lib/supabase";
import { hapticFeedback } from "@/utils/haptics";
import { usePoints } from "./PointsFeedback";

interface BaristaResultCardProps {
  profile: {
    id: string;
    username: string;
    level: string;
    avatar_config: any;
    tastings_count?: number;
  };
  currentUserId?: string | null;
  initialIsFollowing?: boolean;
}

export default function BaristaResultCard({ profile, currentUserId, initialIsFollowing = false }: BaristaResultCardProps) {
  const router = useRouter();
  const { showPoints } = usePoints();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const isOwnProfile = currentUserId === profile.id;

  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUserId || isOwnProfile) return;
    
    setIsFollowLoading(true);
    hapticFeedback(10);
    
    try {
      if (isFollowing) {
        await supabase.from('follows').delete().match({ follower_id: currentUserId, following_id: profile.id });
        setIsFollowing(false);
      } else {
        await supabase.from('follows').insert({ follower_id: currentUserId, following_id: profile.id });
        setIsFollowing(true);
        showPoints(10, `Tu suis maintenant ${profile.username} !`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFollowLoading(false);
    }
  };

  return (
    <div 
      onClick={() => router.push(`/profile/${profile.id}`)} 
      className="bg-white p-4 rounded-[2rem] border border-stone-200 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer animate-in fade-in slide-in-from-right-4"
    >
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-stone-100 rounded-2xl overflow-hidden border border-white shadow-inner">
          <CoffeeAvatar config={profile.avatar_config || {}} size={56} noBackground />
        </div>
        <div>
          <p className="font-black text-stone-800 leading-none group-hover:text-[var(--color-primary)] transition-colors">
            {profile.username}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase">
              {profile.level}
            </span>
            {profile.tastings_count !== undefined && (
              <span className="text-[10px] font-bold text-stone-400">
                • {profile.tastings_count} dégustations
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!isOwnProfile && currentUserId && (
          <button 
            onClick={handleFollow}
            disabled={isFollowLoading}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition-all flex items-center gap-2 ${
              isFollowing 
                ? "bg-stone-100 text-stone-400 border border-stone-200" 
                : "bg-[var(--color-primary)] text-white shadow-md active:scale-95"
            }`}
          >
            {isFollowLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : isFollowing ? (
              <>
                <UserCheck size={14} />
                Suivi
              </>
            ) : (
              <>
                <UserPlus size={14} />
                Suivre
              </>
            )}
          </button>
        )}
        <div className="bg-stone-50 p-3 rounded-full text-stone-300 group-hover:text-[var(--color-primary)] group-hover:bg-[var(--color-primary)]/5 transition-all">
          <ArrowRight size={20} />
        </div>
      </div>
    </div>
  );
}
