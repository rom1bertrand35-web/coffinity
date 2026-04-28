"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, Star, Loader2, UserPlus, UserCheck, MoreHorizontal, MessageCircle, Share2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { usePoints } from "@/components/PointsFeedback";
import CoffeeAvatar from "@/components/CoffeeAvatar";
import { hapticFeedback } from "@/utils/haptics";
import TastingActions from "@/components/TastingActions";
import CommentsSheet from "@/components/CommentsSheet";
import ShareStorySheet from "@/components/ShareStorySheet";
import { awardBeans } from "@/lib/economy";

export default function FeedPostCard({ 
  post, 
  currentUserId, 
  router, 
  isFollowing, 
  onFollowToggle, 
  onUpdate, 
  onDelete 
}: any) {
  const { showPoints } = usePoints();
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const isOwnPost = post.user_id === currentUserId;

  const timeAgo = () => {
    const diff = new Date().getTime() - new Date(post.created_at).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleLike = async () => {
    if (!currentUserId) return;
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikesCount((prev: number) => newIsLiked ? prev + 1 : prev - 1);
    hapticFeedback(newIsLiked ? [10, 30, 10] : 5);
    try {
      if (newIsLiked) {
        await supabase.from('likes').insert({ user_id: currentUserId, tasting_id: post.id });
        awardBeans(currentUserId, 5); // +5 Beans
        showPoints(5, "Tasting liked!");
      } else {
        await supabase.from('likes').delete().match({ user_id: currentUserId, tasting_id: post.id });
        awardBeans(currentUserId, -5); // -5 Beans (Retrait du bonus)
      }
    } catch (err) {
      setIsLiked(!newIsLiked);
      setLikesCount((prev: number) => !newIsLiked ? prev + 1 : prev - 1);
    }
  };

  const handleFollow = async () => {
    if (!currentUserId || isOwnPost) return;
    setIsFollowLoading(true);
    hapticFeedback(10);
    try {
      if (isFollowing) {
        await supabase.from('follows').delete().match({ follower_id: currentUserId, following_id: post.user_id });
        onFollowToggle(false);
      } else {
        await supabase.from('follows').insert({ follower_id: currentUserId, following_id: post.user_id });
        onFollowToggle(true);
        awardBeans(currentUserId, 15); // +15 Beans for following
        showPoints(15, "Explorer ! You followed someone.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFollowLoading(false);
    }
  };

  return (
    <article className="bento-card bg-[var(--color-card)] flex flex-col animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all overflow-hidden mb-6">
      {/* HEADER: Avatar & Info */}
      <div className="flex justify-between items-center p-5">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push(`/profile/${post.user_id}`)}
            className="w-14 h-14 rounded-full overflow-hidden hover:scale-105 transition-transform flex-shrink-0"
          >
            <CoffeeAvatar 
              config={post.profiles?.avatar_config || {
                gender: "neutral",
                hairStyle: "short",
                hairColor: "#4B2C20",
                facialHair: "none",
                facialHairColor: "#4B2C20",
                clothing: "tshirt",
                clothingColor: "#E5E7EB",
                skinColor: "#F3D2B3"
              }} 
              size={56} 
            />
          </button>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <button 
                onClick={() => router.push(`/profile/${post.user_id}`)}
                className="font-black text-base uppercase tracking-tighter hover:underline underline-offset-2 text-left text-[var(--color-foreground)]"
              >
                {post.profiles?.username || "Anonymous Brewer"}
              </button>
              {post.is_official && (
                <span className="bg-[#B44222] text-[#EBE2D4] text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border-2 border-[#1A0F0A] shadow-md">
                  Officiel
                </span>
              )}
              {!isOwnPost && !post.is_official && currentUserId && (
                <button 
                  onClick={handleFollow}
                  disabled={isFollowLoading}
                  className={`text-[9px] font-black px-3 py-1 rounded-full border-2 uppercase tracking-wider transition-all flex items-center gap-1 ${
                    isFollowing 
                      ? "bg-[var(--color-secondary)] text-gray-400 border-[#1A0F0A]/20" 
                      : "bg-[#1A0F0A] text-[#EBE2D4] border-[#1A0F0A] shadow-[2px_2px_0_#B44222] active:translate-y-0.5 active:shadow-none"
                  }`}
                >
                  {isFollowLoading ? (
                    <Loader2 size={10} className="animate-spin" />
                  ) : isFollowing ? (
                    <>
                      <UserCheck size={10} />
                      Suivi
                    </>
                  ) : (
                    <>
                      <UserPlus size={10} />
                      Suivre
                    </>
                  )}
                </button>
              )}
            </div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest opacity-60">
              {post.profiles?.level || "Beginner"} • {timeAgo()}
            </p>
          </div>
        </div>
        
        {isOwnPost ? (
          <TastingActions 
            tasting={post} 
            onUpdate={onUpdate} 
            onDelete={onDelete} 
          />
        ) : (
          <button className="text-[#1A0F0A] hover:bg-black/5 rounded-full transition-colors p-2">
            <MoreHorizontal size={20} />
          </button>
        )}
      </div>

      {/* IMAGE (INSTA STYLE) */}
      <div 
        onClick={() => router.push(`/tasting/${post.id}`)}
        className="w-full aspect-[4/3] bg-[var(--color-background)] relative overflow-hidden group border-y-2 border-[#1A0F0A] cursor-pointer"
      >
        {post.image_url ? (
          <Image 
            src={post.image_url} 
            alt={post.coffee_name} 
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-8 bg-[#EBE2D4]">
             <Image 
              src="/vintage_branch.png" 
              alt="vintage coffee branch" 
              fill
              className="object-contain opacity-80 mix-blend-multiply" 
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>
        )}
      </div>

      {/* ACTIONS (Under Image) */}
      <div className="flex items-center gap-4 px-4 pt-4">
        <button onClick={handleLike} className={`flex items-center gap-1.5 transition-colors hover:scale-110 active:scale-90 ${isLiked ? 'text-red-500' : 'text-[#1A0F0A] hover:text-stone-500'}`}>
          <Heart size={26} className={isLiked ? "fill-red-500" : ""} strokeWidth={isLiked ? 1.5 : 2.5} />
        </button>
        <button onClick={() => { hapticFeedback(5); setIsCommentsOpen(true); }} className="flex items-center gap-1.5 text-[#1A0F0A] hover:text-stone-500 transition-colors hover:scale-110 active:scale-90">
          <MessageCircle size={26} strokeWidth={2.5} />
        </button>
        <button onClick={() => { hapticFeedback(5); setIsShareOpen(true); }} className="flex items-center gap-1.5 text-[#1A0F0A] hover:text-stone-500 transition-colors hover:scale-110 active:scale-90 ml-auto">
          <Share2 size={24} strokeWidth={2.5} />
        </button>
      </div>
      
      {/* LIKES COUNT */}
      <div className="px-4 pt-2">
        <span className="text-sm font-black text-[#1A0F0A] transition-all duration-300">{likesCount} J'aime</span>
      </div>

      {/* CONTENT (Name, Brand, Review) */}
      <div className="px-4 pb-5 pt-2 flex flex-col gap-2">
        <div 
          onClick={() => router.push(`/tasting/${post.id}`)}
          className="cursor-pointer group/title"
        >
          <h3 className="text-2xl font-serif text-[#1A0F0A] inline mr-2 font-bold group-hover/title:underline decoration-2 underline-offset-4">{post.coffee_name}</h3>
          <span className="text-sm text-[#1A0F0A] uppercase tracking-[0.2em] font-black">{post.brand}</span>
        </div>
        
        <div className="flex gap-1 my-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} className={i < post.rating ? "fill-[#B44222] text-[#B44222]" : "text-stone-300 fill-stone-200 border-2 border-[#1A0F0A]/20 rounded-full"} />
          ))}
        </div>

        {post.review && (
          <p className="text-[14px] leading-relaxed text-[#1A0F0A] opacity-90 mt-1">
            <span className="font-bold text-[#1A0F0A] mr-2">{post.profiles?.username || "Anonyme"}</span>
            {post.review}
          </p>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {post.tags.map((tag: string) => (
              <span key={tag} className="text-[10px] uppercase tracking-wider font-extrabold text-[#B44222]">
                #{tag.replace(/\s+/g, '')}
              </span>
            ))}
          </div>
        )}
      </div>

      <CommentsSheet 
        tastingId={post.id} 
        isOpen={isCommentsOpen} 
        onClose={() => setIsCommentsOpen(false)} 
        currentUserId={currentUserId} 
      />

      <ShareStorySheet 
        post={post}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </article>
  );
}
