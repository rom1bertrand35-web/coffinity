"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Lock, Check, Loader2, Sparkles, User, Scissors, Shirt, Glasses, Smile, ShoppingCart, Wallet } from "lucide-react";
import { supabase } from "@/lib/supabase";
import CoffeeAvatar, { AvatarConfig } from "@/components/CoffeeAvatar";
import { hapticFeedback } from "@/utils/haptics";

const SKIN_COLORS = ["#F3D2B3", "#E0B696", "#C68642", "#8D5524", "#FFDBAC", "#E5C298"];
const HAIR_COLORS = ["#4B2C20", "#2C1810", "#8D5524", "#D6B08D", "#1A1A1A", "#634E34", "#B55239", "#8E8E8E"];
const CLOTHING_COLORS = ["#E5E7EB", "#4B2C20", "#253525", "#1E3A8A", "#7F1D1D", "#FCD34D", "#FFFFFF", "#101010", "#5B21B6"];

type TabType = 'face' | 'hair' | 'clothing' | 'accessories';

export default function AvatarShopPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [coins, setCoins] = useState(0);
  const [inventory, setInventory] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('face');
  const [config, setConfig] = useState<AvatarConfig>({
    gender: "neutral",
    hairStyle: "short",
    hairColor: "#4B2C20",
    facialHair: "none",
    facialHairColor: "#4B2C20",
    clothing: "tshirt",
    clothingColor: "#E5E7EB",
    skinColor: "#F3D2B3",
    accessory: "none",
    expression: "smile"
  });

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/auth"); return; }

      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_config, coins, inventory')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profile) {
        setCoins(profile.coins || 0);
        setInventory(profile.inventory || ['short', 'none', 'tshirt', 'smile']);
        if (profile.avatar_config) setConfig(profile.avatar_config);
      }
      setIsLoading(false);
    }
    loadData();
  }, [router]);

  const handlePurchase = async (itemId: string, price: number) => {
    if (inventory.includes(itemId)) return;
    if (coins < price) {
      alert("Pas assez de Beans ! ☕️ Goûte des cafés pour en gagner.");
      return;
    }

    hapticFeedback([10, 50, 10]);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const newInventory = [...inventory, itemId];
    const newCoins = coins - price;

    const { error } = await supabase
      .from('profiles')
      .update({ 
        inventory: newInventory, 
        coins: newCoins 
      })
      .eq('id', session.user.id);

    if (!error) {
      setInventory(newInventory);
      setCoins(newCoins);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase.from('profiles').update({ avatar_config: config }).eq('id', session.user.id);
      hapticFeedback(5);
      router.push("/profile");
    }
    setIsSaving(false);
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-stone-50"><Loader2 className="animate-spin text-[var(--color-primary)]" size={32} /></div>;

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row overflow-hidden pb-20 md:pb-0">
      
      {/* PREVIEW PANEL */}
      <div className="w-full md:w-[450px] bg-stone-50 border-b md:border-r border-stone-200 p-6 flex flex-col items-center justify-center relative z-20">
        <div className="w-full flex justify-between items-center mb-10 md:absolute md:top-8 md:px-8">
           <button onClick={() => router.back()} className="p-3 bg-white shadow-sm rounded-full border border-stone-200"><ArrowLeft size={20} /></button>
           <div className="bg-[var(--color-primary)] text-white px-5 py-2 rounded-full flex items-center gap-2 shadow-lg shadow-[var(--color-primary)]/20">
              <Wallet size={16} />
              <span className="font-black text-sm">{coins} BEANS</span>
           </div>
        </div>

        <div className="relative scale-110 md:scale-150 transition-all duration-500">
          <div className="absolute inset-0 bg-white/50 blur-3xl rounded-full scale-150"></div>
          <CoffeeAvatar config={config} size={220} className="shadow-2xl border-8 border-white rounded-[3.5rem] relative z-10" />
        </div>

        <div className="mt-16 hidden md:flex flex-col w-full max-w-xs gap-4">
           <button onClick={handleSave} disabled={isSaving} className="w-full bg-[var(--color-primary)] text-white py-5 rounded-[2rem] font-black shadow-xl hover:scale-105 active:scale-95 transition-all">
             {isSaving ? <Loader2 className="animate-spin mx-auto" size={24} /> : "ENREGISTRER MON STYLE"}
           </button>
        </div>
      </div>

      {/* SHOP PANEL */}
      <div className="flex-1 flex flex-col h-full bg-white relative">
        <div className="flex gap-2 p-4 md:p-8 overflow-x-auto no-scrollbar border-b border-stone-50 sticky top-0 bg-white/80 backdrop-blur-md z-10">
          <TabButton active={activeTab === 'face'} onClick={() => setActiveTab('face')} icon={<Smile size={20} />} label="VISAGE" />
          <TabButton active={activeTab === 'hair'} onClick={() => setActiveTab('hair')} icon={<Scissors size={20} />} label="CHEVEUX" />
          <TabButton active={activeTab === 'clothing'} onClick={() => setActiveTab('clothing')} icon={<Shirt size={20} />} label="SHOP" />
          <TabButton active={activeTab === 'accessories'} onClick={() => setActiveTab('accessories')} icon={<Glasses size={20} />} label="EXTRAS" />
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-12">
          
          {activeTab === 'face' && (
            <div className="space-y-10 animate-in slide-in-from-right-4">
              <OptionSection title="Teint">
                <div className="grid grid-cols-6 gap-3">
                  {SKIN_COLORS.map(c => <ColorCircle key={c} color={c} active={config.skinColor === c} onClick={() => setConfig({...config, skinColor: c})} />)}
                </div>
              </OptionSection>
              <OptionSection title="Expressions">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <ItemCard label="Basic Smile" id="smile" price={0} active={config.expression === 'smile'} owned={true} previewConfig={{...config, expression: 'smile'}} onClick={() => setConfig({...config, expression: 'smile'})} />
                  <ItemCard label="Cool Vibes" id="cool" price={150} active={config.expression === 'cool'} owned={inventory.includes('cool')} previewConfig={{...config, expression: 'cool'}} onBuy={() => handlePurchase('cool', 150)} onClick={() => setConfig({...config, expression: 'cool'})} />
                  <ItemCard label="Surprise" id="surprised" price={50} active={config.expression === 'surprised'} owned={inventory.includes('surprised')} previewConfig={{...config, expression: 'surprised'}} onBuy={() => handlePurchase('surprised', 50)} onClick={() => setConfig({...config, expression: 'surprised'})} />
                </div>
              </OptionSection>
            </div>
          )}

          {activeTab === 'hair' && (
            <div className="space-y-10 animate-in slide-in-from-right-4">
              <OptionSection title="Couleur">
                <div className="grid grid-cols-6 gap-3">
                  {HAIR_COLORS.map(c => <ColorCircle key={c} color={c} active={config.hairColor === c} onClick={() => setConfig({...config, hairColor: c, facialHairColor: c})} />)}
                </div>
              </OptionSection>
              <OptionSection title="Coupes">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <ItemCard label="Short" id="short" price={0} active={config.hairStyle === 'short'} owned={true} previewConfig={{...config, hairStyle: 'short'}} onClick={() => setConfig({...config, hairStyle: 'short'})} />
                  <ItemCard label="Mullet" id="mullet" price={300} active={config.hairStyle === 'mullet'} owned={inventory.includes('mullet')} previewConfig={{...config, hairStyle: 'mullet'}} onBuy={() => handlePurchase('mullet', 300)} onClick={() => setConfig({...config, hairStyle: 'mullet'})} />
                  <ItemCard label="Man Bun" id="man_bun" price={500} active={config.hairStyle === 'man_bun'} owned={inventory.includes('man_bun')} previewConfig={{...config, hairStyle: 'man_bun'}} onBuy={() => handlePurchase('man_bun', 500)} onClick={() => setConfig({...config, hairStyle: 'man_bun'})} />
                  <ItemCard label="Afro" id="afro" price={800} active={config.hairStyle === 'afro'} owned={inventory.includes('afro')} previewConfig={{...config, hairStyle: 'afro'}} onBuy={() => handlePurchase('afro', 800)} onClick={() => setConfig({...config, hairStyle: 'afro'})} />
                </div>
              </OptionSection>
            </div>
          )}

          {/* Répéter pour les autres onglets avec ItemCard... */}
        </div>

        <div className="md:hidden fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white to-transparent pointer-events-none">
           <button onClick={handleSave} className="w-full bg-[var(--color-primary)] text-white py-4 rounded-[2rem] font-black shadow-2xl pointer-events-auto active:scale-95 transition-transform">
             ENREGISTRER
           </button>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition-all ${active ? 'bg-stone-900 text-white shadow-xl' : 'bg-stone-50 text-stone-400'}`}>
      {icon}<span className="font-bold text-xs">{label}</span>
    </button>
  );
}

function OptionSection({ title, children }: any) {
  return (
    <div className="space-y-4">
      <h3 className="text-[10px] font-black text-stone-300 uppercase tracking-[0.3em] ml-2">{title}</h3>
      {children}
    </div>
  );
}

function ColorCircle({ color, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full aspect-square rounded-full border-4 transition-all ${active ? 'border-[var(--color-primary)] scale-110 shadow-lg' : 'border-white shadow-sm'}`} style={{ backgroundColor: color }} />
  );
}

function ItemCard({ label, price, active, owned, onClick, onBuy, previewConfig }: any) {
  return (
    <div className={`p-4 rounded-[2.5rem] border-2 transition-all relative flex flex-col items-center gap-3 ${active ? 'border-[var(--color-primary)] bg-stone-50' : 'border-stone-100'}`}>
      <div className="w-20 h-20"><CoffeeAvatar config={previewConfig} size={80} noBackground /></div>
      <div className="text-center">
        <p className="text-[11px] font-black text-stone-800 uppercase tracking-tight">{label}</p>
        {!owned ? (
          <button onClick={onBuy} className="mt-2 bg-amber-100 text-amber-700 px-3 py-1 rounded-full flex items-center gap-1 text-[10px] font-black hover:bg-amber-200 transition-colors">
            <ShoppingCart size={10} /> {price}
          </button>
        ) : (
          <button onClick={onClick} className={`mt-2 px-4 py-1 rounded-full text-[10px] font-black transition-colors ${active ? 'bg-[var(--color-primary)] text-white' : 'bg-stone-200 text-stone-500'}`}>
            {active ? 'ÉQUIPÉ' : 'CHOISIR'}
          </button>
        )}
      </div>
      {owned && !active && <div className="absolute top-3 right-3 text-green-500"><Check size={14} strokeWidth={4} /></div>}
    </div>
  );
}
