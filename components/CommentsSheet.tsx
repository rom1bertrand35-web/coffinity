"use client";

import { useState, useEffect } from "react";
import { Drawer } from "vaul";
import { X, Send, Loader2, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import CoffeeAvatar from "@/components/CoffeeAvatar";
import { hapticFeedback } from "@/utils/haptics";
import { awardBeans } from "@/lib/economy";
import { usePoints } from "@/components/PointsFeedback";

interface CommentsSheetProps {
  tastingId: number;
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string | null;
}

export default function CommentsSheet({ tastingId, isOpen, onClose, currentUserId }: CommentsSheetProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const pointsInfo = usePoints();
  const showPoints = pointsInfo ? pointsInfo.showPoints : () => {};

  useEffect(() => {
    if (isOpen && tastingId) {
      loadComments();
    }
  }, [isOpen, tastingId]);

  const loadComments = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("comments")
      .select(`
        *,
        profiles:user_id (
          username,
          avatar_config
        )
      `)
      .eq("tasting_id", tastingId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setComments(data);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUserId) return;

    setIsSubmitting(true);
    hapticFeedback(5);

    try {
      // 1. Modération du contenu
      const modRes = await fetch('/api/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newComment.trim() })
      });
      const modData = await modRes.json();

      if (!modData.isSafe) {
        alert(modData.reason);
        setIsSubmitting(false);
        return;
      }

      // 2. Enregistrement Supabase
      const { data, error } = await supabase
        .from("comments")
        .insert({
          tasting_id: tastingId,
          user_id: currentUserId,
          content: newComment.trim()
        })
        .select(`*, profiles:user_id(username, avatar_config)`)
        .single();

      if (!error && data) {
        setComments(prev => [...prev, data]);
        setNewComment("");
        awardBeans(currentUserId, 10);
        showPoints(10, "Great thought!");
      } else {
        console.error(error);
      }
    } catch (err) {
      console.error("Comment submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-sm" />
        <Drawer.Content className="bg-[#EBE2D4] flex flex-col rounded-t-[3rem] h-[85%] fixed bottom-0 left-0 right-0 z-[100] outline-none border-t-4 border-[#1A0F0A]">
          <div className="p-6 text-[#1A0F0A] flex-1 flex flex-col overflow-hidden relative">
            <div className="mx-auto w-16 h-2 flex-shrink-0 rounded-full bg-[#1A0F0A] opacity-20 mb-8" />
            
            <div className="flex justify-between items-center mb-10 px-2">
              <Drawer.Title className="text-4xl font-serif text-[#1A0F0A] flex items-center gap-4 font-black italic tracking-tighter uppercase">
                <MessageCircle size={32} strokeWidth={3} className="-rotate-12" /> Avis
              </Drawer.Title>
              <button onClick={onClose} className="p-3 bg-[#1A0F0A] text-[#EBE2D4] rounded-full border-2 border-[#1A0F0A] hover:translate-y-1 transition-all shadow-[0_4px_0_rgba(0,0,0,0.2)]">
                <X size={20} strokeWidth={3} />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto px-2 space-y-6 pb-4">
              {isLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#1A0F0A]/20" size={32} /></div>
              ) : comments.length === 0 ? (
                <div className="text-center py-20 bg-white/30 rounded-[2.5rem] border-3 border-dashed border-[#1A0F0A]/10">
                  <p className="font-extrabold text-[#1A0F0A] text-xl mb-2">Le calme plat...</p>
                  <p className="text-sm font-bold opacity-60">Partage ta science du grain en premier !</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="w-12 h-12 shrink-0 rounded-full border-3 border-[#1A0F0A] overflow-hidden shadow-sm bg-white">
                      <CoffeeAvatar config={comment.profiles?.avatar_config || {}} size={48} noBackground />
                    </div>
                    <div className="flex flex-col pt-1">
                      <p className="font-black text-[10px] text-[#B44222] uppercase tracking-[0.2em] mb-1.5">{comment.profiles?.username || "Anonyme"}</p>
                      <div className="bg-white border-2 border-[#1A0F0A] rounded-2xl rounded-tl-none p-4 shadow-[0_4px_0_rgba(26,15,10,0.1)]">
                        <p className="text-[15px] font-bold text-[#1A0F0A] leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input Area Brutaliste */}
            {currentUserId ? (
              <form onSubmit={handleSubmit} className="mt-auto pt-6 pb-safe relative">
                <div className="relative group">
                  <div className="absolute inset-0 bg-[#1A0F0A] rounded-full translate-y-1 translate-x-1 opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Écris ton avis..."
                    className="relative w-full bg-white border-3 border-[#1A0F0A] rounded-full py-5 pl-8 pr-16 focus:outline-none focus:translate-y-[-2px] focus:translate-x-[-2px] text-sm font-black text-[#1A0F0A] placeholder:text-[#1A0F0A]/30 shadow-[0_4px_0_#1A0F0A] transition-all"
                  />
                  <button 
                    type="submit" 
                    disabled={!newComment.trim() || isSubmitting}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#1A0F0A] text-[#EBE2D4] rounded-full border-2 border-[#1A0F0A] disabled:opacity-30 hover:-rotate-12 active:scale-90 transition-all flex items-center justify-center shadow-lg"
                  >
                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={20} strokeWidth={2.5} className="ml-1" />}
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-auto pt-6 pb-12 text-center text-xs font-black uppercase tracking-widest text-[#1A0F0A]/40 bg-white/20 rounded-full border-2 border-dashed border-[#1A0F0A]/10">
                Connecte-toi pour briller en société.
              </div>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
