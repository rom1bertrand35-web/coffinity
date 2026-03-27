"use client";

import { ShoppingBag, Coffee, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface CoffeeResultCardProps {
  coffee: {
    id: string | number;
    name: string;
    brand: string;
    image_url?: string;
    url?: string;
    price?: string;
  };
}

export default function CoffeeResultCard({ coffee }: CoffeeResultCardProps) {
  const router = useRouter();

  const handleRate = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/scan/rate?name=${encodeURIComponent(coffee.name)}&brand=${encodeURIComponent(coffee.brand)}&image=${encodeURIComponent(coffee.image_url || '')}`);
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-stone-200 shadow-sm overflow-hidden flex flex-col animate-in fade-in zoom-in-95 group">
      <div className="h-32 bg-stone-100/50 flex items-center justify-center p-4 relative">
        {coffee.image_url ? (
          <img src={coffee.image_url} alt={coffee.name} className="h-full object-contain group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <Coffee className="text-stone-200" size={32} />
        )}
        
        {/* Action Bouton Flottant pour Noter */}
        <button 
          onClick={handleRate}
          className="absolute -bottom-4 right-4 w-10 h-10 bg-[var(--color-primary)] text-white rounded-2xl shadow-lg flex items-center justify-center active:scale-90 transition-transform z-10"
        >
          <Plus size={20} />
        </button>
      </div>
      
      <div className="p-4 pt-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-1">
          <p className="text-[10px] font-black text-[var(--color-accent)] uppercase truncate max-w-[70%]">
            {coffee.brand || "Artisan"}
          </p>
          {coffee.price && (
            <span className="text-[10px] font-bold text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded-md">
              {coffee.price}
            </span>
          )}
        </div>
        <h3 className="font-bold text-sm leading-tight line-clamp-2 mb-4 group-hover:text-[var(--color-primary)] transition-colors">
          {coffee.name}
        </h3>
        
        {coffee.url && (
          <button 
            onClick={() => window.open(coffee.url, '_blank')} 
            className="mt-auto text-[10px] font-bold text-stone-400 flex items-center gap-1.5 hover:text-stone-600 transition-colors"
          >
            <ShoppingBag size={12} />
            Voir sur le site
          </button>
        )}
      </div>
    </div>
  );
}
