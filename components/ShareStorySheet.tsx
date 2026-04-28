"use client";

import { useState, useRef } from "react";
import { Drawer } from "vaul";
import { Share2, X, Download, Star, Loader2, Sparkles } from "lucide-react";
import { toPng } from "html-to-image";
import { hapticFeedback } from "@/utils/haptics";
import CoffeeAvatar from "@/components/CoffeeAvatar";

interface ShareStorySheetProps {
  isOpen: boolean;
  onClose: () => void;
  post: any;
}

export default function ShareStorySheet({ isOpen, onClose, post }: ShareStorySheetProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const storyRef = useRef<HTMLDivElement>(null);

  const handleShare = async () => {
    if (!storyRef.current) return;
    
    setIsGenerating(true);
    hapticFeedback(10);

    try {
      // 1. Generate PNG
      const dataUrl = await toPng(storyRef.current, { 
        cacheBust: true,
        quality: 1,
        pixelRatio: 2 // High quality for Instagram
      });

      // 2. Try to use Web Share API (Mobile)
      if (navigator.share && navigator.canShare) {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], `coffinity-story-${post.id}.png`, { type: 'image/png' });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Dégustation de ${post.coffee_name}`,
            text: `Regardez ce que j'ai dégusté sur Coffinity !`,
          });
          onClose();
          return;
        }
      }

      // 3. Fallback: Download the image
      const link = document.createElement('a');
      link.download = `coffinity-story-${post.id}.png`;
      link.href = dataUrl;
      link.click();
      onClose();
    } catch (err) {
      console.error("Failed to share story:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-md" />
        <Drawer.Content className="bg-[#EBE2D4] flex flex-col rounded-t-[3rem] h-[90%] fixed bottom-0 left-0 right-0 z-[100] outline-none border-t-4 border-[#1A0F0A]">
          <div className="p-6 text-[#1A0F0A] flex-1 flex flex-col overflow-hidden relative">
            <div className="mx-auto w-16 h-2 flex-shrink-0 rounded-full bg-[#1A0F0A] opacity-20 mb-8" />
            
            <div className="flex justify-between items-center mb-6 px-2">
              <Drawer.Title className="text-3xl font-serif text-[#1A0F0A] flex items-center gap-3 font-black italic tracking-tighter uppercase">
                <Share2 size={28} strokeWidth={3} className="-rotate-12" /> Partage
              </Drawer.Title>
              <button onClick={onClose} className="p-3 bg-white text-[#1A0F0A] rounded-full border-2 border-[#1A0F0A] shadow-[2px_2px_0_#1A0F0A]">
                <X size={20} strokeWidth={3} />
              </button>
            </div>

            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1A0F0A]/40 text-center mb-6">Aperçu de ta Story Instagram</p>

            {/* STORY PREVIEW CONTAINER (Hidden from view but used for generation) */}
            <div className="flex-1 flex items-center justify-center overflow-y-auto pb-32">
              <div 
                ref={storyRef}
                className="w-[320px] aspect-[9/16] bg-[#EBE2D4] border-[6px] border-[#1A0F0A] shadow-[12px_12px_0_#1A0F0A] overflow-hidden flex flex-col relative p-6"
                style={{ fontFamily: 'var(--font-outfit)' }}
              >
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                   <div className="absolute top-10 left-10 w-20 h-20 border-2 border-[#1A0F0A] rounded-full" />
                   <div className="absolute bottom-20 right-10 w-32 h-32 border-2 border-[#1A0F0A] rounded-full" />
                </div>

                {/* Header: User Info */}
                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#1A0F0A] bg-white">
                    <CoffeeAvatar config={post.profiles?.avatar_config || {}} size={48} noBackground />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#B44222]">Archivé par</p>
                    <p className="text-sm font-black uppercase tracking-tighter text-[#1A0F0A] leading-none">{post.profiles?.username}</p>
                  </div>
                </div>

                {/* Main Content: Photo */}
                <div className="flex-1 w-full bg-white border-4 border-[#1A0F0A] rounded-[2rem] overflow-hidden shadow-[6px_6px_0_#1A0F0A] mb-6 relative group">
                  {post.image_url ? (
                    <img src={post.image_url} alt="coffee" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-8 bg-[#EBE2D4]/50">
                      <img src="/vintage_branch.png" alt="vintage" className="opacity-40 mix-blend-multiply" />
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 bg-[#1A0F0A] text-[#EBE2D4] px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-[#EBE2D4]/20">
                    <Sparkles size={10} className="text-[#B44222]" /> Coffinity v2.5
                  </div>
                </div>

                {/* Info: Coffee Details */}
                <div className="space-y-3 relative z-10 bg-white/40 p-4 rounded-[1.5rem] border-2 border-[#1A0F0A]/5 backdrop-blur-sm">
                  <div className="text-center">
                    <p className="text-[9px] font-black text-[#B44222] uppercase tracking-[0.3em] mb-1">{post.brand}</p>
                    <h3 className="text-2xl font-serif font-black italic tracking-tighter leading-none text-[#1A0F0A]">{post.coffee_name}</h3>
                  </div>
                  
                  <div className="flex justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className={i < post.rating ? "fill-[#B44222] text-[#1A0F0A]" : "text-[#1A0F0A]/10"} strokeWidth={2.5} />
                    ))}
                  </div>

                  {post.review && (
                    <p className="text-[11px] font-serif italic text-center text-[#1A0F0A]/80 line-clamp-2 px-2">
                      "{post.review}"
                    </p>
                  )}
                </div>

                {/* Footer: App Logo/Link */}
                <div className="mt-auto pt-6 flex flex-col items-center">
                  <div className="bg-[#1A0F0A] text-[#EBE2D4] px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] border-2 border-[#B44222]">
                    COFFINITY.APP
                  </div>
                  <p className="text-[8px] font-bold text-[#1A0F0A]/40 uppercase mt-2 tracking-widest">Le carnet des baristas</p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="absolute bottom-8 left-6 right-6">
              <button 
                onClick={handleShare}
                disabled={isGenerating}
                className="w-full bg-[#1A0F0A] text-[#EBE2D4] py-5 rounded-full font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#B44222] transition-colors shadow-[0_8px_0_rgba(26,15,10,0.3)] disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Génération...
                  </>
                ) : (
                  <>
                    <Download size={20} />
                    Télécharger & Partager
                  </>
                )}
              </button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
