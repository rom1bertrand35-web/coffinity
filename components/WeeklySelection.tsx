"use client";

import { useEffect, useState } from "react";
import { Sparkles, ArrowRight, ShoppingBag, Star, Info } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function WeeklySelection() {
  const [selection, setSelection] = useState<any>(null);
  const [coffees, setCoffees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadWeekly() {
      // Get current week number
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
    <div className="bg-[#1A0F0A] rounded-[2.5rem] p-8 border-4 border-[#1A0F0A] shadow-[8px_8px_0_#B44222] text-[#EBE2D4] relative overflow-hidden animate-in fade-in zoom-in-95 duration-700 mb-8">
      {/* Background Decor */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#B44222] rounded-full blur-3xl opacity-20"></div>
      
      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <div className="inline-flex items-center gap-2 bg-[#B44222] text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
              <Sparkles size={12} />
              Sélection Signature
            </div>
            <h2 className="text-3xl font-serif italic font-black tracking-tighter mt-2 leading-tight">
              {selection.title}
            </h2>
          </div>
          <div className="bg-[#EBE2D4] text-[#1A0F0A] p-3 rounded-2xl rotate-6 shadow-lg border-2 border-[#1A0F0A]">
             <span className="font-black text-xs uppercase">S{selection.week_number}</span>
          </div>
        </div>

        <p className="text-sm font-medium leading-relaxed opacity-80 border-l-2 border-[#B44222] pl-4 py-1 italic">
          "{selection.description}"
        </p>

        <div className="grid grid-cols-1 gap-4 mt-2">
          {coffees.map((coffee) => (
            <div 
              key={coffee.id}
              className="bg-white/10 backdrop-blur-sm p-4 rounded-3xl flex items-center gap-4 border border-white/10 group hover:bg-white/20 transition-all cursor-pointer"
              onClick={() => router.push(`/scan/rate?name=${encodeURIComponent(coffee.name)}&brand=${encodeURIComponent(coffee.brand)}&image=${encodeURIComponent(coffee.image_url)}`)}
            >
              <div className="w-16 h-16 rounded-2xl bg-white p-2 overflow-hidden flex-shrink-0 border-2 border-[#1A0F0A]">
                <img src={coffee.image_url} alt={coffee.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase text-[#B44222] tracking-widest leading-none mb-1">{coffee.brand}</p>
                <h3 className="font-bold text-sm truncate leading-tight">{coffee.name}</h3>
                <div className="flex items-center gap-1 mt-1 text-[10px] opacity-60">
                   <Info size={10} />
                   <span>Cliquer pour noter ce cru</span>
                </div>
              </div>
              {coffee.url && (
                <button 
                  onClick={(e) => { e.stopPropagation(); window.open(coffee.url, '_blank'); }}
                  className="bg-[#EBE2D4] text-[#1A0F0A] p-3 rounded-2xl hover:scale-110 active:scale-95 transition-all shadow-md"
                >
                  <ShoppingBag size={16} />
                </button>
              )}
            </div>
          ))}
        </div>

        <button 
          onClick={() => router.push('/discover')}
          className="mt-2 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#B44222] hover:text-[#EBE2D4] transition-colors group"
        >
          Voir tout le catalogue <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
