"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { hapticFeedback } from "@/utils/haptics";
import ShareStorySheet from "@/components/ShareStorySheet";

export default function TastingShareButton({ post }: { post: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => { hapticFeedback(10); setIsOpen(true); }}
        className="w-full bg-white text-[#1A0F0A] border-4 border-[#1A0F0A] py-5 rounded-full font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:-translate-y-1 shadow-[0_8px_0_rgba(26,15,10,0.1)] transition-all active:translate-y-0 active:shadow-none"
      >
        Partager ce Cru <Share2 size={18} strokeWidth={3} />
      </button>

      <ShareStorySheet 
        post={post}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
