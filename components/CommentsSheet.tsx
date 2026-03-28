"use client";

import { useState, useEffect } from "react";
import { Drawer } from "vaul";
import { X, Send, Loader2, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import CoffeeAvatar from "@/components/CoffeeAvatar";
import { hapticFeedback } from "@/utils/haptics";

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
    } else {
      console.error(error);
    }
    setIsSubmitting(false);
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-sm" />
        <Drawer.Content className="bg-stone-50 flex flex-col rounded-t-[2.5rem] h-[85%] fixed bottom-0 left-0 right-0 z-[100] outline-none">
          <div className="p-5 bg-white rounded-t-[2.5rem] flex-1 flex flex-col overflow-hidden">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-stone-200 mb-6" />
            
            <div className="flex justify-between items-center mb-6 px-2 tracking-tight">
              <Drawer.Title className="text-xl font-black text-[var(--color-primary)] flex items-center gap-2">
                <MessageCircle size={24} /> Commentaires
              </Drawer.Title>
              <button onClick={onClose} className="p-2 bg-stone-100 rounded-full text-stone-400 hover:text-stone-600 transition-colors">
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
                  <div key={comment.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2">
                    <div className="w-10 h-10 shrink-0">
                      <CoffeeAvatar config={comment.profiles?.avatar_config || {}} size={40} />
                    </div>
                    <div className="bg-stone-50 rounded-2xl rounded-tl-none p-3 max-w-[85%] border border-[var(--color-border)] shadow-sm">
                      <p className="font-bold text-[11px] text-[var(--color-primary)] uppercase tracking-tight mb-1">{comment.profiles?.username || "Anonyme"}</p>
                      <p className="text-sm text-stone-700 leading-relaxed break-words">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input Area */}
            {currentUserId ? (
              <form onSubmit={handleSubmit} className="mt-auto pt-4 border-t border-[var(--color-border)] pb-safe relative">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Ajouter un commentaire..."
                    className="w-full bg-stone-100/80 border-none rounded-full py-4 pl-6 pr-14 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:bg-white transition-colors text-sm font-medium shadow-inner"
                  />
                  <button 
                    type="submit" 
                    disabled={!newComment.trim() || isSubmitting}
                    className="absolute right-2 p-2.5 bg-[var(--color-primary)] text-white rounded-full disabled:opacity-50 disabled:bg-stone-300 hover:scale-110 active:scale-95 transition-all shadow-md"
                  >
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className="ml-px" />}
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-auto pt-4 pb-safe text-center text-sm font-bold text-stone-400">
                Vous devez être connecté pour commenter.
              </div>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
