"use client";

import { useState, useEffect, useCallback } from "react";
import { Heart, Star, Loader2, UserPlus, UserCheck, MoreHorizontal, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { usePoints } from "@/components/PointsFeedback";
import CoffeeAvatar from "@/components/CoffeeAvatar";
import { FeedSkeleton } from "@/components/Skeletons";
import { hapticFeedback } from "@/utils/haptics";
import TastingActions from "@/components/TastingActions";
import CommentsSheet from "@/components/CommentsSheet";

export default function FeedPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'global' | 'following'>('global');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    
    // 1. Récupérer l'utilisateur
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id || null;
    setCurrentUserId(userId);

    // 2. Récupérer la liste des IDs que je suis (si connecté)
    let currentFollowing: string[] = [];
    if (userId) {
      const { data: followsData } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId);
      
      currentFollowing = followsData?.map(f => f.following_id) || [];
      setFollowingIds(currentFollowing);
    }

    // 3. Charger les posts
    let query = supabase
      .from('tastings')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          avatar_url,
          level,
          avatar_config
        ),
        likes (
          user_id
        )
      `)
      .order('created_at', { ascending: false });

    // Filtrer si on est sur l'onglet "Following"
    if (activeTab === 'following' && userId) {
      if (currentFollowing.length > 0) {
        query = query.in('user_id', currentFollowing);
      } else {
        // Si on ne suit personne, on force un résultat vide proprement
        setPosts([]);
        setIsLoading(false);
        return;
      }
    }

    const { data, error } = await query;

    if (!error) {
      const formattedPosts = data?.map(post => ({
        ...post,
        isLiked: post.likes?.some((l: any) => l.user_id === userId) || false
      })) || [];
      setPosts(formattedPosts);
    } else {
      console.error("Erreur chargement feed:", error);
    }
    setIsLoading(false);
  }, [activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="p-4 pt-10 pb-32 flex flex-col gap-6">
      <header className="flex flex-col gap-4">
        <div>
          <h1 className="text-4xl text-[var(--color-primary)] mb-2 font-serif font-bold">Coffinity</h1>
          <p className="text-[var(--color-muted-foreground)] text-sm">Discover what the community is brewing.</p>
        </div>

        {/* Onglets Global / Following */}
        {currentUserId && (
          <div className="flex bg-stone-100 p-1 rounded-2xl w-fit self-center sm:self-start">
            <button 
              onClick={() => setActiveTab('global')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'global' ? 'bg-white text-[var(--color-primary)] shadow-sm' : 'text-gray-400'}`}
            >
              Global
            </button>
            <button 
              onClick={() => setActiveTab('following')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'following' ? 'bg-white text-[var(--color-primary)] shadow-sm' : 'text-gray-400'}`}
            >
              Following
            </button>
          </div>
        )}
      </header>

      {isLoading ? (
        <FeedSkeleton />
      ) : posts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2rem] border border-[var(--color-border)] shadow-sm px-6">
           <p className="text-gray-500 mb-4">
             {activeTab === 'following' 
               ? "You don't follow anyone yet or they haven't posted anything." 
               : "The community is quiet today."}
           </p>
           <button 
            onClick={() => router.push('/discover?mode=people')}
            className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-2xl font-bold hover:scale-105 transition-transform"
           >
             {activeTab === 'following' ? "Discover people to follow" : "Start the conversation"}
           </button>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard 
            key={post.id} 
            post={post} 
            currentUserId={currentUserId}
            router={router}
            isFollowing={followingIds.includes(post.user_id)}
            onFollowToggle={(isNowFollowing: boolean) => {
              if (isNowFollowing) {
                setFollowingIds(prev => [...prev, post.user_id]);
              } else {
                setFollowingIds(prev => prev.filter(id => id !== post.user_id));
                // Si on est dans l'onglet following et qu'on unfollow, on retire le post de la vue
                if (activeTab === 'following') {
                  setPosts(prev => prev.filter(p => p.user_id !== post.user_id));
                }
              }
            }}
            onUpdate={loadData}
            onDelete={(id: number) => {
              setPosts(prev => prev.filter(p => p.id !== id));
            }}
          />
        ))
      )}
    </div>
  );
}

function PostCard({ post, currentUserId, router, isFollowing, onFollowToggle, onUpdate, onDelete }: any) {
  const { showPoints } = usePoints();
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

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
      } else {
        await supabase.from('likes').delete().match({ user_id: currentUserId, tasting_id: post.id });
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
        showPoints(10, "Explorer ! You followed someone.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFollowLoading(false);
    }
  };

  return (
    <article className="bento-card bg-[var(--color-card)] flex flex-col animate-in fade-in zoom-in-95 duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all overflow-hidden mb-6">
      {/* HEADER: Avatar & Info */}
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push(`/profile/${post.user_id}`)}
            className="w-10 h-10 rounded-full overflow-hidden border border-[var(--color-border)] shadow-sm hover:scale-105 transition-transform"
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
              size={40} 
            />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => router.push(`/profile/${post.user_id}`)}
                className="font-semibold text-sm hover:underline underline-offset-2 text-left text-[var(--color-foreground)]"
              >
                {post.profiles?.username || "Anonymous Brewer"}
              </button>
              {!isOwnPost && currentUserId && (
                <button 
                  onClick={handleFollow}
                  disabled={isFollowLoading}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all flex items-center gap-1 ${
                    isFollowing 
                      ? "bg-[var(--color-secondary)] text-gray-400 border-[var(--color-border)]" 
                      : "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm active:scale-95"
                  }`}
                >
                  {isFollowLoading ? (
                    <Loader2 size={10} className="animate-spin" />
                  ) : isFollowing ? (
                    <>
                      <UserCheck size={10} />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus size={10} />
                      Follow
                    </>
                  )}
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400">{post.profiles?.level || "Beginner"} • {timeAgo()}</p>
          </div>
        </div>
        
        {isOwnPost ? (
          <TastingActions 
            tasting={post} 
            onUpdate={onUpdate} 
            onDelete={onDelete} 
          />
        ) : (
          <button className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <MoreHorizontal size={20} />
          </button>
        )}
      </div>

      {/* IMAGE (INSTA STYLE) */}
      <div className="w-full aspect-[4/5] bg-[var(--color-background)] relative overflow-hidden group border-y border-black/5">
        {post.image_url ? (
          <img src={post.image_url} alt="bag" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-8 bg-[var(--color-background)]">
             <img src="/vintage_branch.png" alt="vintage coffee branch" className="w-full h-full object-contain opacity-80 mix-blend-multiply" />
          </div>
        )}
      </div>

      {/* ACTIONS (Under Image) */}
      <div className="flex items-center gap-4 px-4 pt-4">
        <button onClick={handleLike} className={`flex items-center gap-1.5 transition-colors hover:scale-110 active:scale-90 ${isLiked ? 'text-red-500' : 'text-[var(--color-foreground)] hover:text-stone-500'}`}>
          <Heart size={26} className={isLiked ? "fill-red-500" : ""} strokeWidth={isLiked ? 1.5 : 2} />
        </button>
        <button onClick={() => { hapticFeedback(5); setIsCommentsOpen(true); }} className="flex items-center gap-1.5 text-[var(--color-foreground)] hover:text-stone-500 transition-colors hover:scale-110 active:scale-90">
          <MessageCircle size={26} strokeWidth={2} />
        </button>
      </div>
      
      {/* LIKES COUNT */}
      <div className="px-4 pt-2">
        <span className="text-sm font-black text-[var(--color-foreground)]">{likesCount} J'aime</span>
      </div>

      {/* CONTENT (Name, Brand, Review) */}
      <div className="px-4 pb-5 pt-2 flex flex-col gap-2">
        <div>
          <h3 className="text-2xl font-serif text-[var(--color-foreground)] inline mr-2 font-bold">{post.coffee_name}</h3>
          <span className="text-sm text-[var(--color-muted-foreground)] uppercase tracking-wider font-semibold">{post.brand}</span>
        </div>
        
        <div className="flex gap-1 my-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} className={i < post.rating ? "fill-[var(--color-accent)] text-[var(--color-accent)]" : "text-stone-200"} />
          ))}
        </div>

        {post.review && (
          <p className="text-[14px] leading-relaxed text-[var(--color-foreground)] opacity-90 mt-1">
            <span className="font-bold text-[var(--color-foreground)] mr-2">{post.profiles?.username || "Anonyme"}</span>
            {post.review}
          </p>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {post.tags.map((tag: string) => (
              <span key={tag} className="text-[10px] uppercase tracking-wider font-extrabold text-[var(--color-primary)]">
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
    </article>
  );
}
