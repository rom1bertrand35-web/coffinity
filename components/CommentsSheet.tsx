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
    setIsSubmitting(false);
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm" />
        <Drawer.Content className="bg-[var(--color-primary)] flex flex-col rounded-t-[3rem] h-[85%] fixed bottom-0 left-0 right-0 z-[100] outline-none">
          <div className="p-6 bg-[var(--color-primary)] text-[var(--color-background)] rounded-t-[3rem] flex-1 flex flex-col overflow-hidden">
            <div className="mx-auto w-12 h-1 flex-shrink-0 rounded-full bg-[var(--color-background)] opacity-20 mb-8" />
            
            <div className="flex justify-between items-center mb-6 px-2 tracking-tight">
              <Drawer.Title className="text-3xl font-serif text-[var(--color-background)] flex items-center gap-3">
                <MessageCircle size={28} strokeWidth={1.5} /> Comments
              </Drawer.Title>
              <button onClick={onClose} className="p-2 border border-[var(--color-background)]/20 rounded-full text-[var(--color-background)] hover:bg-[var(--color-background)] hover:text-[var(--color-primary)] transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto px-2 space-y-5 pb-4">
              {isLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-stone-300" /></div>
              ) : comments.length === 0 ? (
                <div className="text-center py-16 text-stone-400">
                  <p className="font-bold">Aucun commentaire</p>
                  <p className="text-sm">Soyez le premier à donner votre avis !</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="w-10 h-10 shrink-0 rounded-full border border-[var(--color-background)]/20 overflow-hidden">
                      <CoffeeAvatar config={comment.profiles?.avatar_config || {}} size={40} />
                    </div>
                    <div className="flex flex-col pt-1">
                      <p className="font-bold text-[11px] text-[var(--color-background)]/60 uppercase tracking-widest mb-1">{comment.profiles?.username || "Anonyme"}</p>
                      <p className="text-[15px] font-medium text-[var(--color-background)] leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input Area */}
            {currentUserId ? (
              <form onSubmit={handleSubmit} className="mt-auto pt-4 pb-safe relative">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full bg-[var(--color-primary)] border border-[var(--color-background)]/30 rounded-full py-4 pl-6 pr-14 focus:outline-none focus:border-[var(--color-accent)] text-sm font-medium text-[var(--color-background)] placeholder-[var(--color-background)]/40 transition-colors"
                  />
                  <button 
                    type="submit" 
                    disabled={!newComment.trim() || isSubmitting}
                    className="absolute right-2 p-2.5 bg-[var(--color-background)] text-[var(--color-primary)] rounded-full disabled:opacity-30 hover:scale-110 active:scale-95 transition-all"
                  >
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} strokeWidth={2} className="ml-px" />}
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-auto pt-4 pb-safe text-center text-sm font-bold text-[var(--color-background)]/50">
                Vous devez être connecté pour commenter.
              </div>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
