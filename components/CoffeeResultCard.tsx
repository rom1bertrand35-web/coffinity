"use client";

import { useState } from "react";
import { ShoppingBag, Coffee, Plus, Star, Sparkles, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { getAmazonAffiliateUrl } from "@/lib/affiliate";

interface Comment {
  username: string;
  text: string;
  rating: number;
}

interface CoffeeResultCardProps {
  coffee: {
    id: string | number;
    name: string;
    brand: string;
    image_url?: string;
    url?: string;
    amazon_asin?: string;
    maxicoffee_url?: string;
    price?: string;
    avg_rating?: number | null;
    reviews_count?: number;
    last_comments?: Comment[];
    match_score?: number | null;
  };
}

export default function CoffeeResultCard({ coffee }: CoffeeResultCardProps) {
  const router = useRouter();
  const [imgError, setImgError] = useState(false);

  // Generate affiliate link
  const affiliateUrl = coffee.amazon_asin 
    ? getAmazonAffiliateUrl(coffee.amazon_asin) 
    : coffee.maxicoffee_url || coffee.url;

  const handleRate = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/scan/rate?name=${encodeURIComponent(coffee.name)}&brand=${encodeURIComponent(coffee.brand)}&image=${encodeURIComponent(coffee.image_url || '')}`);
  };

  const handleBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (affiliateUrl) {
      window.open(affiliateUrl, '_blank');
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 70) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-stone-500 bg-stone-50 border-stone-200";
  };

  return (
    <div className="bg-white rounded-[2rem] border-[3px] border-[#1A0F0A] shadow-[0_6px_0_rgba(26,15,10,1)] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 group">
      <div className="h-32 bg-stone-100/50 flex items-center justify-center p-4 relative border-b-2 border-[#1A0F0A]/10">
        {coffee.image_url && !imgError ? (
          <img 
            src={coffee.image_url} 
            alt={coffee.name} 
            className="h-full object-contain group-hover:scale-110 transition-transform duration-500" 
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity">
            <Coffee size={32} />
            <p className="text-[8px] font-black uppercase mt-1">Image Archives</p>
          </div>
        )}
        
        {/* Match Badge */}
        {coffee.match_score && (
          <div className={`absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest shadow-sm animate-in slide-in-from-left-2 duration-500 ${getMatchColor(coffee.match_score)}`}>
            <Sparkles size={8} fill="currentColor" />
            {coffee.match_score}% Match
          </div>
        )}
        
        <button 
          onClick={handleRate}
          className="absolute -bottom-4 right-4 w-10 h-10 bg-[#1A0F0A] text-[#EBE2D4] rounded-2xl shadow-lg flex items-center justify-center active:scale-90 transition-transform z-10 border-2 border-[#EBE2D4]"
        >
          <Plus size={20} />
        </button>
      </div>
      
      <div className="p-4 pt-6 flex flex-col flex-1 gap-2">
        <div className="flex justify-between items-start">
          <p className="text-[10px] font-black text-[var(--color-accent)] uppercase truncate max-w-[70%]">
            {coffee.brand || "Artisan"}
          </p>
          {coffee.avg_rating && (
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              <span className="text-[10px] font-black text-amber-700">{coffee.avg_rating}</span>
              <Star size={10} className="fill-amber-500 text-amber-500" />
            </div>
          )}
        </div>
        
        <h3 className="font-serif font-bold text-base leading-tight line-clamp-2 mb-1">
          {coffee.name}
        </h3>

        {/* Community Stats */}
        {coffee.reviews_count ? (
          <p className="text-[9px] font-black text-[#1A0F0A]/40 uppercase tracking-widest">
            {coffee.reviews_count} avis de la tribu
          </p>
        ) : (
          <p className="text-[9px] font-black text-[#1A0F0A]/20 uppercase tracking-widest italic">
            Soyez le premier à noter
          </p>
        )}

        {/* Last Comments Preview */}
        {coffee.last_comments && coffee.last_comments.length > 0 && (
          <div className="mt-2 space-y-2 border-t border-[#1A0F0A]/5 pt-3">
            {coffee.last_comments.slice(0, 2).map((comment, i) => (
              <div key={i} className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold text-[#1A0F0A]">{comment.username}</span>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={6} className={j < comment.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"} />
                    ))}
                  </div>
                </div>
                <p className="text-[10px] text-[#1A0F0A]/70 line-clamp-2 italic leading-snug">
                  "{comment.text}"
                </p>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-auto pt-4 flex flex-col gap-2">
          {affiliateUrl ? (
            <button 
              onClick={handleBuy} 
              className="w-full bg-[#1A0F0A] text-[#EBE2D4] text-[10px] font-black uppercase tracking-widest py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#B44222] transition-colors border-2 border-transparent active:scale-[0.98]"
            >
              <ShoppingBag size={14} />
              {coffee.amazon_asin ? "Voir sur Amazon" : "Commander"}
              <ExternalLink size={10} className="opacity-40" />
            </button>
          ) : (
            <div className="text-center py-2 opacity-20">
               <p className="text-[8px] font-black uppercase tracking-tighter">Épuisé ou indisponible</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
