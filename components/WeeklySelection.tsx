"use client";

import { useEffect, useState } from "react";
import { Sparkles, ArrowRight, ShoppingBag, Star, Info, Map as MapIcon, Quote } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import CoffeeAvatar, { AvatarConfig } from "./CoffeeAvatar";
import InteractiveCoffeeMap from "./InteractiveCoffeeMap";

const BARISTO_CONFIG: AvatarConfig = {
  skinColor: "#F3D2B3",
  hairStyle: "cap",
  facialHair: "mustache",
  facialHairColor: "#1A1A1A",
  clothing: "barista_apron_over_tee",
  clothingColor: "#FAFAF8",
  expression: "wide_smile_teeth",
  accessory: "none"
};

export default function WeeklySelection() {
  const [selection, setSelection] = useState<any>(null);
  const [coffees, setCoffees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadWeekly() {
      const now = new Date();
      const onejan = new Date(now.getFullYear(), 0, 1);
      const week = Math.ceil((((now.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
      
      const { data: sel } = await supabase
        .from('weekly_selections')
        .select('*')
        .eq('week_number', week)
        .eq('year', now.getFullYear())
        .maybeSingle();

      if (sel) {
        setSelection(sel);
        const { data: cfs } = await supabase
          .from('coffees')
          .select('*')
          .in('id', sel.coffee_ids);
        setCoffees(cfs || []);
      }
      setIsLoading(false);
    }
    loadWeekly();
  }, []);

  if (isLoading || !selection) return null;

  return (
    <div className="bg-[#1A0F0A] rounded-[2.5rem] p-8 border-4 border-[#1A0F0A] shadow-[8px_8px_0_#B44222] text-[#EBE2D4] relative overflow-hidden animate-in fade-in zoom-in-95 duration-700 mb-12">
      {/* Background Decor */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#B44222] rounded-full blur-3xl opacity-20"></div>
      
      <div className="relative z-10 flex flex-col gap-8">
        
        {/* Baristo Header */}
        <div className="flex items-center gap-4 border-b-2 border-white/10 pb-6">
           <div className="w-16 h-16 bg-[#EBE2D4] rounded-2xl p-1 border-2 border-[#B44222] shadow-lg rotate-3">
              <CoffeeAvatar config={BARISTO_CONFIG} size={60} noBackground />
           </div>
           <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="bg-[#B44222] text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Officiel</span>
                <h3 className="font-serif italic font-black text-xl tracking-tight">Le Choix de Baristo</h3>
              </div>
              <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em] mt-1">Épinglé • Semaine {selection.week_number}</p>
           </div>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-4xl font-serif italic font-black tracking-tighter leading-none">
            {selection.title}
          </h2>
          
          <div className="relative">
            <Quote className="absolute -top-2 -left-2 text-[#B44222] opacity-40" size={24} />
            <p className="text-sm font-medium leading-relaxed opacity-90 pl-6 italic">
              {selection.description}
            </p>
          </div>
        </div>

        {/* Interactive Map */}
        {selection.origins && selection.origins.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
               <MapIcon size={14} className="text-[#B44222]" />
               <span className="text-[10px] font-black uppercase tracking-widest">Carte des Origines</span>
            </div>
            <InteractiveCoffeeMap origins={selection.origins} />
          </div>
        )}

        {/* Coffee Selection */}
        <div className="grid grid-cols-1 gap-4 mt-2">
          {coffees.map((coffee) => (
            <div 
              key={coffee.id}
              className="bg-white/5 backdrop-blur-md p-5 rounded-[2rem] flex items-center gap-5 border border-white/5 group hover:bg-white/10 transition-all cursor-pointer shadow-xl"
              onClick={() => router.push(`/scan/rate?name=${encodeURIComponent(coffee.name)}&brand=${encodeURIComponent(coffee.brand)}&image=${encodeURIComponent(coffee.image_url)}`)}
            >
              <div className="w-20 h-20 rounded-2xl bg-white p-2 overflow-hidden flex-shrink-0 border-2 border-[#1A0F0A] -rotate-2 group-hover:rotate-0 transition-transform">
                <img src={coffee.image_url} alt={coffee.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase text-[#B44222] tracking-widest leading-none mb-1.5">{coffee.brand}</p>
                <h3 className="font-serif font-black text-lg truncate leading-tight italic">{coffee.name}</h3>
                <div className="flex items-center gap-1.5 mt-2 text-[10px] opacity-60 font-bold uppercase tracking-wider">
                   <Star size={12} className="fill-[#B44222] text-[#B44222]" />
                   <span>Cliquer pour noter</span>
                </div>
              </div>
              {coffee.url && (
                <button 
                  onClick={(e) => { e.stopPropagation(); window.open(coffee.url, '_blank'); }}
                  className="bg-[#EBE2D4] text-[#1A0F0A] p-4 rounded-3xl hover:scale-110 active:scale-95 transition-all shadow-[0_4px_0_rgba(0,0,0,0.2)] border-2 border-[#1A0F0A]"
                >
                  <ShoppingBag size={20} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Baristo Tips */}
        {selection.baristo_tips && (
          <div className="bg-[#B44222]/10 border-2 border-[#B44222]/30 p-6 rounded-[2rem]">
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B44222] mb-2 flex items-center gap-2">
                <Info size={14} /> Le conseil de Baristo
             </p>
             <p className="text-xs font-bold leading-relaxed opacity-80">
                {selection.baristo_tips}
             </p>
          </div>
        )}

        <button 
          onClick={() => {
            // Find Baristo profile link (we search by username if ID is unknown)
            supabase.from('profiles').select('id').eq('username', 'Baristo').single().then(({data}) => {
              if (data) router.push(`/profile/${data.id}`);
              else router.push('/discover?mode=people');
            });
          }}
          className="mt-4 flex items-center justify-center gap-3 py-4 bg-white/5 border-2 border-white/10 rounded-full font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white/10 transition-all text-[#B44222]"
        >
          Visiter l'Atelier de Baristo <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
