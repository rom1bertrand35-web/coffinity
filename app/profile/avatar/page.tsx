"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Smile, Scissors, Shirt, Glasses, ShoppingCart, Wallet, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import CoffeeAvatar, { AvatarConfig } from "@/components/CoffeeAvatar";
import { hapticFeedback } from "@/utils/haptics";

const SKIN_COLORS = ["#F3D2B3", "#E0B696", "#C68642", "#8D5524", "#FFDBAC", "#E5C298"];
const HAIR_COLORS = ["#1A1A1A", "#4B2C20", "#2C1810", "#8D5524", "#D6B08D", "#634E34", "#B55239", "#8E8E8E", "#D8D8D8", "#FCD34D"];
const CLOTHING_COLORS = ["#4ADE80", "#E5E7EB", "#4B2C20", "#253525", "#1E3A8A", "#7F1D1D", "#FFFFFF", "#101010", "#5B21B6", "#FFB6C1"];

type TabType = 'face' | 'hair' | 'clothing' | 'accessories';

// Prix en Beans (0 = Gratuits/Possédés de base)
const PRICES: Record<string, number> = {
  // Expressions
  'smile': 0,
  'wide_smile_teeth': 150,
  'angry_brows': 50,
  // Hair
  'short': 0,
  'shaggy': 100,
  'pompadour': 250,
  'man_bun_thick': 400,
  // Facial Hair
  'none': 0,
  'mustache': 50,
  'handlebar': 200,
  'full_bushy_beard': 300,
  // Clothing
  'tshirt': 0,
  'green_v_pattern_shirt': 300,
  'barista_apron_over_tee': 500,
  // Accessories
  'glasses': 150,
  'gold_earring': 200,
};

export default function AvatarShopPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [coins, setCoins] = useState(0);
  const [inventory, setInventory] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('face');
  const [config, setConfig] = useState<AvatarConfig>({
    gender: "neutral",
    hairStyle: "man_bun_thick",
    hairColor: "#1A1A1A",
    facialHair: "full_bushy_beard",
    facialHairColor: "#1A1A1A",
    clothing: "green_v_pattern_shirt",
    clothingColor: "#4ADE80",
    skinColor: "#F3D2B3",
    accessory: "gold_earring",
    expression: "wide_smile_teeth"
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
        // Toujours offrir les éléments de base s'ils sont manquants
        const baseItems = ['short', 'none', 'tshirt', 'smile'];
        const userInventory = profile.inventory || [];
        setInventory([...new Set([...baseItems, ...userInventory])]);
        
        if (profile.avatar_config) setConfig(profile.avatar_config);
      }
      setIsLoading(false);
    }
    loadData();
  }, [router]);

  const handlePurchase = async (itemId: string, price: number) => {
    if (inventory.includes(itemId)) return;
    if (coins < price) {
      alert("Tu n'as pas assez de Beans ! ☕️ Goûte des cafés ou écris des avis pour en gagner.");
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
      hapticFeedback(20);
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

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-[#EBE2D4]"><Loader2 className="animate-spin text-[#1A0F0A]" size={32} /></div>;

  return (
    <div className="min-h-screen bg-[#EBE2D4] flex flex-col md:flex-row overflow-hidden pb-20 md:pb-0 font-sans text-[#1A0F0A]">
      
      {/* PREVIEW PANEL */}
      <div className="w-full md:w-[450px] bg-[#EBE2D4] border-b md:border-r border-[#1A0F0A]/10 p-6 flex flex-col items-center justify-center relative z-20">
        <div className="w-full flex justify-between items-center mb-10 md:absolute md:top-8 md:px-8">
           <button onClick={() => router.back()} className="p-3 bg-white shadow-[0_4px_0_#1A0F0A] rounded-full border-2 border-[#1A0F0A] hover:translate-y-1 hover:shadow-none transition-all active:scale-95"><ArrowLeft size={20} /></button>
           <div className="bg-[#1A0F0A] text-[#EBE2D4] px-5 py-2 rounded-full flex items-center gap-2 shadow-lg">
              <Wallet size={16} />
              <span className="font-black text-sm">{coins} BEANS</span>
           </div>
        </div>

        <div className="relative scale-110 md:scale-150 transition-all duration-500">
          <CoffeeAvatar config={config} size={220} className="shadow-2xl shadow-[#1A0F0A]/20 relative z-10" />
        </div>

        <div className="mt-16 hidden md:flex flex-col w-full max-w-xs gap-4">
           <button onClick={handleSave} disabled={isSaving} className="w-full bg-[#1A0F0A] text-[#EBE2D4] py-5 rounded-[2rem] font-black shadow-xl hover:scale-105 active:scale-95 transition-all">
             {isSaving ? <Loader2 className="animate-spin mx-auto" size={24} /> : "SAUVEGARDER L'ARTWORK"}
           </button>
        </div>
      </div>

      {/* SHOP PANEL */}
      <div className="flex-1 flex flex-col h-full bg-[#FAFAF8] relative rounded-t-[3rem] md:rounded-none md:rounded-l-[3rem] shadow-[-10px_0_40px_rgba(0,0,0,0.05)] border-l border-t border-[#1A0F0A]/10 mt-[-2rem] md:mt-0 z-30">
        <div className="flex gap-2 p-6 md:p-8 overflow-x-auto no-scrollbar border-b border-[#1A0F0A]/10 sticky top-0 bg-[#FAFAF8]/90 backdrop-blur-md z-10 pt-10 md:pt-8">
          <TabButton active={activeTab === 'face'} onClick={() => setActiveTab('face')} icon={<Smile size={20} />} label="VISAGE" />
          <TabButton active={activeTab === 'hair'} onClick={() => setActiveTab('hair')} icon={<Scissors size={20} />} label="CHEVEUX" />
          <TabButton active={activeTab === 'clothing'} onClick={() => setActiveTab('clothing')} icon={<Shirt size={20} />} label="VÊTEMENTS" />
          <TabButton active={activeTab === 'accessories'} onClick={() => setActiveTab('accessories')} icon={<Glasses size={20} />} label="ACCESSOIRES" />
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-12">
          
          {/* FACE & BEARD TAB */}
          {activeTab === 'face' && (
            <div className="space-y-10 animate-in slide-in-from-right-4">
              <OptionSection title="Teint (Gratuit)">
                <div className="grid grid-cols-6 gap-3">
                  {SKIN_COLORS.map(c => <ColorCircle key={c} color={c} active={config.skinColor === c} onClick={() => setConfig({...config, skinColor: c})} />)}
                </div>
              </OptionSection>
              <OptionSection title="Expressions Papiers">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <ItemCard id="smile" label="Sourire Simple" price={PRICES['smile']} active={config.expression === 'smile'} owned={inventory.includes('smile')} previewConfig={{...config, expression: 'smile'}} onBuy={() => handlePurchase('smile', PRICES['smile'])} onClick={() => setConfig({...config, expression: 'smile'})} />
                  <ItemCard id="angry_brows" label="Fronceur" price={PRICES['angry_brows']} active={config.expression === 'angry_brows'} owned={inventory.includes('angry_brows')} previewConfig={{...config, expression: 'angry_brows'}} onBuy={() => handlePurchase('angry_brows', PRICES['angry_brows'])} onClick={() => setConfig({...config, expression: 'angry_brows'})} />
                  <ItemCard id="wide_smile_teeth" label="Rire Énorme" price={PRICES['wide_smile_teeth']} active={config.expression === 'wide_smile_teeth'} owned={inventory.includes('wide_smile_teeth')} previewConfig={{...config, expression: 'wide_smile_teeth'}} onBuy={() => handlePurchase('wide_smile_teeth', PRICES['wide_smile_teeth'])} onClick={() => setConfig({...config, expression: 'wide_smile_teeth'})} />
                </div>
              </OptionSection>
              <OptionSection title="Brousaille (Barbes)">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <ItemCard id="none" label="Rasé" price={PRICES['none']} active={config.facialHair === 'none'} owned={inventory.includes('none')} previewConfig={{...config, facialHair: 'none'}} onBuy={() => handlePurchase('none', PRICES['none'])} onClick={() => setConfig({...config, facialHair: 'none'})} />
                  <ItemCard id="mustache" label="Moustache" price={PRICES['mustache']} active={config.facialHair === 'mustache'} owned={inventory.includes('mustache')} previewConfig={{...config, facialHair: 'mustache'}} onBuy={() => handlePurchase('mustache', PRICES['mustache'])} onClick={() => setConfig({...config, facialHair: 'mustache'})} />
                  <ItemCard id="handlebar" label="Guidon" price={PRICES['handlebar']} active={config.facialHair === 'handlebar'} owned={inventory.includes('handlebar')} previewConfig={{...config, facialHair: 'handlebar'}} onBuy={() => handlePurchase('handlebar', PRICES['handlebar'])} onClick={() => setConfig({...config, facialHair: 'handlebar'})} />
                  <ItemCard id="full_bushy_beard" label="Explorateur" price={PRICES['full_bushy_beard']} active={config.facialHair === 'full_bushy_beard'} owned={inventory.includes('full_bushy_beard')} previewConfig={{...config, facialHair: 'full_bushy_beard'}} onBuy={() => handlePurchase('full_bushy_beard', PRICES['full_bushy_beard'])} onClick={() => setConfig({...config, facialHair: 'full_bushy_beard'})} />
                </div>
              </OptionSection>
            </div>
          )}

          {/* HAIR TAB */}
          {activeTab === 'hair' && (
            <div className="space-y-10 animate-in slide-in-from-right-4">
              <OptionSection title="Encre">
                <div className="grid grid-cols-6 gap-3">
                  {HAIR_COLORS.map(c => <ColorCircle key={c} color={c} active={config.hairColor === c} onClick={() => setConfig({...config, hairColor: c, facialHairColor: c})} />)}
                </div>
              </OptionSection>
              <OptionSection title="Coupes Texturées">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <ItemCard id="short" label="Court" price={PRICES['short']} active={config.hairStyle === 'short'} owned={inventory.includes('short')} previewConfig={{...config, hairStyle: 'short'}} onBuy={() => handlePurchase('short', PRICES['short'])} onClick={() => setConfig({...config, hairStyle: 'short'})} />
                  <ItemCard id="shaggy" label="Bordélique" price={PRICES['shaggy']} active={config.hairStyle === 'shaggy'} owned={inventory.includes('shaggy')} previewConfig={{...config, hairStyle: 'shaggy'}} onBuy={() => handlePurchase('shaggy', PRICES['shaggy'])} onClick={() => setConfig({...config, hairStyle: 'shaggy'})} />
                  <ItemCard id="pompadour" label="Pompadour" price={PRICES['pompadour']} active={config.hairStyle === 'pompadour'} owned={inventory.includes('pompadour')} previewConfig={{...config, hairStyle: 'pompadour'}} onBuy={() => handlePurchase('pompadour', PRICES['pompadour'])} onClick={() => setConfig({...config, hairStyle: 'pompadour'})} />
                  <ItemCard id="man_bun_thick" label="Chignon XXL" price={PRICES['man_bun_thick']} active={config.hairStyle === 'man_bun_thick'} owned={inventory.includes('man_bun_thick')} previewConfig={{...config, hairStyle: 'man_bun_thick'}} onBuy={() => handlePurchase('man_bun_thick', PRICES['man_bun_thick'])} onClick={() => setConfig({...config, hairStyle: 'man_bun_thick'})} />
                </div>
              </OptionSection>
            </div>
          )}

          {/* CLOTHING TAB */}
          {activeTab === 'clothing' && (
            <div className="space-y-10 animate-in slide-in-from-right-4">
              <OptionSection title="Teinture Libre">
                <div className="grid grid-cols-6 gap-3">
                  {CLOTHING_COLORS.map(c => <ColorCircle key={c} color={c} active={config.clothingColor === c} onClick={() => setConfig({...config, clothingColor: c})} />)}
                </div>
              </OptionSection>
              <OptionSection title="Garde-robe Éditoriale">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <ItemCard id="tshirt" label="T-Shirt Simple" price={PRICES['tshirt']} active={config.clothing === 'tshirt'} owned={inventory.includes('tshirt')} previewConfig={{...config, clothing: 'tshirt'}} onBuy={() => handlePurchase('tshirt', PRICES['tshirt'])} onClick={() => setConfig({...config, clothing: 'tshirt'})} />
                  <ItemCard id="green_v_pattern_shirt" label="Chemise 'V'" price={PRICES['green_v_pattern_shirt']} active={config.clothing === 'green_v_pattern_shirt'} owned={inventory.includes('green_v_pattern_shirt')} previewConfig={{...config, clothing: 'green_v_pattern_shirt', clothingColor: "#4ADE80"}} onBuy={() => handlePurchase('green_v_pattern_shirt', PRICES['green_v_pattern_shirt'])} onClick={() => setConfig({...config, clothing: 'green_v_pattern_shirt'})} />
                  <ItemCard id="barista_apron_over_tee" label="Tablier Barista" price={PRICES['barista_apron_over_tee']} active={config.clothing === 'barista_apron_over_tee'} owned={inventory.includes('barista_apron_over_tee')} previewConfig={{...config, clothing: 'barista_apron_over_tee'}} onBuy={() => handlePurchase('barista_apron_over_tee', PRICES['barista_apron_over_tee'])} onClick={() => setConfig({...config, clothing: 'barista_apron_over_tee'})} />
                </div>
              </OptionSection>
            </div>
          )}

          {/* ACCESSORIES TAB */}
          {activeTab === 'accessories' && (
            <div className="space-y-10 animate-in slide-in-from-right-4">
              <OptionSection title="Breloques & Lunettes">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <ItemCard id="none" label="Rien" price={0} active={config.accessory === 'none' || !config.accessory} owned={true} previewConfig={{...config, accessory: 'none'}} onClick={() => setConfig({...config, accessory: 'none'})} />
                  <ItemCard id="glasses" label="Lunettes Épaisses" price={PRICES['glasses']} active={config.accessory === 'glasses'} owned={inventory.includes('glasses')} previewConfig={{...config, accessory: 'glasses'}} onBuy={() => handlePurchase('glasses', PRICES['glasses'])} onClick={() => setConfig({...config, accessory: 'glasses'})} />
                  <ItemCard id="gold_earring" label="Boucle Artisan" price={PRICES['gold_earring']} active={config.accessory === 'gold_earring'} owned={inventory.includes('gold_earring')} previewConfig={{...config, accessory: 'gold_earring'}} onBuy={() => handlePurchase('gold_earring', PRICES['gold_earring'])} onClick={() => setConfig({...config, accessory: 'gold_earring'})} />
                </div>
              </OptionSection>
            </div>
          )}

        </div>

        {/* MOBILE SAVE BUTTON */}
        <div className="md:hidden fixed bottom-6 left-6 right-6 z-50">
           <button onClick={handleSave} className="w-full bg-[#1A0F0A] text-[#EBE2D4] py-4 rounded-[2rem] font-black shadow-[0_8px_0_rgba(26,15,10,0.5)] active:translate-y-2 active:shadow-none transition-all flex items-center justify-center">
             {isSaving ? <Loader2 className="animate-spin" /> : "SAUVEGARDER L'ARTWORK"}
           </button>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 rounded-2xl border-2 transition-all ${active ? 'bg-[#1A0F0A] text-[#EBE2D4] border-[#1A0F0A] shadow-[0_4px_0_rgba(26,15,10,0.5)]' : 'bg-transparent text-[#1A0F0A]/50 border-transparent hover:bg-stone-200'}`}>
      {icon}<span className="font-bold text-xs uppercase tracking-wider">{label}</span>
    </button>
  );
}

function OptionSection({ title, children }: any) {
  return (
    <div className="space-y-4">
      <h3 className="text-[10px] font-black text-[#1A0F0A]/40 uppercase tracking-[0.3em] ml-2 border-b-2 border-[#1A0F0A]/10 pb-2 inline-block">{title}</h3>
      {children}
    </div>
  );
}

function ColorCircle({ color, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full aspect-square rounded-full border-4 transition-all ${active ? 'border-[#1A0F0A] scale-110 shadow-lg' : 'border-white shadow-sm'}`} style={{ backgroundColor: color }} />
  );
}

function ItemCard({ label, price, active, owned, onClick, onBuy, previewConfig }: any) {
  return (
    <div 
      className={`p-4 rounded-[2.5rem] border-[3px] transition-all duration-300 relative flex flex-col items-center gap-3 group overflow-hidden ${
        active 
          ? 'border-[#1A0F0A] bg-orange-50/50 shadow-[0_6px_0_rgba(26,15,10,1)] -translate-y-1' 
          : 'border-[#1A0F0A]/10 bg-white hover:border-[#1A0F0A]/30 shadow-sm'
      }`}
    >
      <div className="w-20 h-20 transition-transform duration-500 group-hover:scale-110 origin-bottom">
         <CoffeeAvatar config={previewConfig} size={80} noBackground />
      </div>
      
      <div className="text-center relative z-10 w-full">
        <p className="text-[11px] font-black text-[#1A0F0A] uppercase tracking-tight truncate px-1">{label}</p>
        
        {!owned ? (
          <button onClick={onBuy} className="mt-2 mx-auto bg-[#EBE2D4] text-[#B44222] border-2 border-[#B44222] w-full py-1.5 rounded-full flex justify-center items-center gap-1 text-[10px] font-black transition-colors hover:bg-[#B44222] hover:text-[#EBE2D4]">
            <ShoppingCart size={12} /> {price} B
          </button>
        ) : (
          <button onClick={onClick} className={`mt-2 w-full py-1.5 rounded-full text-[10px] border-2 font-black transition-colors ${active ? 'bg-[#1A0F0A] text-white border-[#1A0F0A]' : 'bg-[#FAFAF8] text-[#1A0F0A] border-[#1A0F0A]/20 hover:border-[#1A0F0A]/50'}`}>
            {active ? 'ÉQUIPÉ' : 'CHOISIR'}
          </button>
        )}
      </div>
      
      {owned && !active && <div className="absolute top-4 right-4 text-[#4ADE80] bg-white rounded-full shadow-sm p-0.5"><Check size={14} strokeWidth={4} /></div>}
    </div>
  );
}
