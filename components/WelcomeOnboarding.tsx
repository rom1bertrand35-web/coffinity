"use client";

import { useState } from "react";
import { Coffee, Coins, ArrowRight, Check, Bean, Thermometer, Zap, Milk, Flame, Sparkles, Plus, MessageSquare } from "lucide-react";
import CoffeeAvatar, { AvatarConfig } from "@/components/CoffeeAvatar";
import { hapticFeedback } from "@/utils/haptics";

interface WelcomeOnboardingProps {
  onComplete: (data: { 
    avatarConfig: AvatarConfig, 
    baristaType: string, 
    preferences: any 
  }) => void;
}

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

const INITIAL_AESTHETICS: AvatarConfig[] = [
  { hairStyle: "man_bun_thick", hairColor: "#1A1A1A", facialHair: "full_bushy_beard", facialHairColor: "#1A1A1A", clothing: "barista_apron_over_tee", clothingColor: "#4ADE80", skinColor: "#E0B696", expression: "smile", accessory: "none" },
  { hairStyle: "shaggy", hairColor: "#B55239", facialHair: "none", facialHairColor: "#B55239", clothing: "green_v_pattern_shirt", clothingColor: "#4ADE80", skinColor: "#FFDBAC", expression: "wide_smile_teeth", accessory: "glasses" },
  { hairStyle: "pompadour", hairColor: "#2C1810", facialHair: "mustache", facialHairColor: "#2C1810", clothing: "tshirt", clothingColor: "#1A0F0A", skinColor: "#8D5524", expression: "smile", accessory: "gold_earring" },
];

const BARISTA_TYPES = [
  { 
    id: "espresso_purist", 
    label: "Le Puriste Espresso", 
    desc: "Pour toi, le café se boit court, noir et sans compromis.",
    icon: <Zap size={24} className="text-[#B44222]" />,
  },
  { 
    id: "filter_enthusiast", 
    label: "L'Amateur de Filtre", 
    desc: "Tu cherches la clarté, l'acidité et les notes florales.",
    icon: <Thermometer size={24} className="text-blue-500" />,
  },
  { 
    id: "latte_lover", 
    label: "Le Fan de Latté", 
    desc: "Onctuosité et gourmandise sont tes maîtres mots.",
    icon: <Milk size={24} className="text-amber-600" />,
  },
  { 
    id: "capsule_explorer", 
    label: "L'Explorateur Nomade", 
    desc: "Efficacité et découverte de nouvelles marques en capsules.",
    icon: <Plus size={24} className="text-green-600" />,
  }
];

export default function WelcomeOnboarding({ onComplete }: WelcomeOnboardingProps) {
  const [step, setStep] = useState(1);
  const [selectedAvatar, setSelectedAvatar] = useState<number>(0);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [preferences, setPreferences] = useState({
    roast: "medium",
    notes: [] as string[]
  });

  const totalSteps = 5;

  const nextStep = () => {
    hapticFeedback(10);
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete({
        avatarConfig: INITIAL_AESTHETICS[selectedAvatar],
        baristaType: selectedType || "espresso_purist",
        preferences: preferences
      });
    }
  };

  const SpeechBubble = ({ children }: { children: React.ReactNode }) => (
    <div className="relative bg-white border-4 border-[#1A0F0A] p-6 rounded-[2rem] shadow-[8px_8px_0_#1A0F0A] animate-in zoom-in-95 duration-300">
      <p className="text-sm font-black leading-relaxed text-[#1A0F0A] uppercase tracking-tight">
        {children}
      </p>
      {/* Triangle Bubble */}
      <div className="absolute -bottom-4 left-10 w-8 h-8 bg-white border-r-4 border-b-4 border-[#1A0F0A] rotate-45"></div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-[#EBE2D4] flex flex-col items-center p-6 pt-20 animate-in fade-in slide-in-from-bottom-[5%] duration-700 font-sans overflow-hidden">
      
      {/* ProgressBar Brutaliste */}
      <div className="absolute top-12 left-12 right-12 flex items-center justify-between">
         <div className="text-xl font-black text-[#1A0F0A]">0{step} / 0{totalSteps}</div>
         <div className="flex-1 ml-6 h-2 bg-black/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#1A0F0A] transition-all duration-500 ease-out" 
              style={{ width: `${(step / totalSteps) * 100}%` }}
            ></div>
         </div>
      </div>

      {/* BARISTO MASCOT */}
      <div className="w-full flex flex-col gap-6 max-w-sm mt-10">
        <div className="flex items-end gap-4 ml-2">
           <div className="w-24 h-24 flex-shrink-0 -mb-2 animate-in slide-in-from-left-8 duration-500">
              <CoffeeAvatar config={BARISTO_CONFIG} size={96} noBackground className="scale-110" />
           </div>
           <div className="flex-1 pb-4">
              <h2 className="text-xs font-black text-[#1A0F0A]/40 uppercase tracking-[0.3em]">Baristo dit :</h2>
           </div>
        </div>

        {/* STEP 1: WELCOME */}
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <SpeechBubble>
              "Salut l'artiste ! Bienvenue chez Coffinity. Je suis Baristo, ton guide pour cette aventure caféinée. Prêt à rejoindre la meilleure tribu de torréfacteurs ?"
            </SpeechBubble>
            <div className="px-2">
              <h1 className="text-5xl font-serif text-[#1A0F0A] font-black tracking-tighter leading-none mb-4 italic">L'Atelier des Baristas.</h1>
              <p className="text-base font-bold text-[#1A0F0A]/60 leading-snug">
                Ici, on archive nos crus, on compare nos notes et on découvre les meilleures pépites du monde entier.
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: BEANS */}
        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <SpeechBubble>
              "On ne travaille pas pour rien ici ! Pour te remercier de rejoindre l'atelier, je t'ai mis 100 Beans de côté. Gagne-en plus en partageant tes archives !"
            </SpeechBubble>
            <div className="w-full aspect-video bg-[#B44222] rounded-[2.5rem] border-4 border-[#1A0F0A] shadow-[8px_8px_0_#1A0F0A] flex flex-col items-center justify-center p-6 relative overflow-hidden">
               <Sparkles size={48} className="text-[#FFD700] absolute top-4 left-4 opacity-50 -rotate-12 animate-pulse" />
               <div className="text-7xl font-black text-[#EBE2D4] drop-shadow-lg">100</div>
               <div className="text-[#EBE2D4] font-black tracking-widest uppercase text-[10px] mt-2 border-t border-white/20 pt-2">Beans de Bienvenue</div>
            </div>
          </div>
        )}

        {/* STEP 3: TYPE */}
        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <SpeechBubble>
              "Pour bien te conseiller mes dernières trouvailles, j'ai besoin de savoir quel type de barista tu es. Plutôt puriste ou aventurier ?"
            </SpeechBubble>
            <div className="grid grid-cols-1 gap-3 overflow-y-auto max-h-[40vh] no-scrollbar pr-1">
               {BARISTA_TYPES.map((type) => (
                 <button 
                  key={type.id}
                  onClick={() => { hapticFeedback(5); setSelectedType(type.id); }}
                  className={`w-full p-5 rounded-2xl border-3 flex items-center gap-4 text-left transition-all duration-300 ${selectedType === type.id ? 'border-[#1A0F0A] bg-white shadow-[6px_6px_0_#1A0F0A] -translate-y-1' : 'border-[#1A0F0A]/10 bg-white/50 opacity-60 hover:opacity-100'}`}
                 >
                   <div className="bg-stone-100 p-3 rounded-xl border-2 border-[#1A0F0A]/5">
                      {type.icon}
                   </div>
                   <div className="flex-1 min-w-0">
                      <p className="font-black text-[10px] uppercase tracking-wider text-[#1A0F0A]">{type.label}</p>
                      <p className="text-[9px] font-bold text-[#1A0F0A]/60 leading-tight mt-1 truncate">{type.desc}</p>
                   </div>
                   {selectedType === type.id && <Check size={16} className="text-[#B44222]" strokeWidth={4} />}
                 </button>
               ))}
            </div>
          </div>
        )}

        {/* STEP 4: ROAST */}
        {step === 4 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <SpeechBubble>
              "Et côté torréfaction, tu préfères quand ça réveille les papilles ou quand c'est bien puissant et charnu ?"
            </SpeechBubble>
            <div className="flex flex-col gap-3">
               {[
                 { id: "light", label: "Légère", sub: "Florale & Acidulée" },
                 { id: "medium", label: "Moyenne", sub: "Équilibrée & Sucrée" },
                 { id: "dark", label: "Foncée", sub: "Puissante & Caramélisée" }
               ].map((roast) => (
                 <button 
                  key={roast.id}
                  onClick={() => { hapticFeedback(5); setPreferences({...preferences, roast: roast.id}); }}
                  className={`w-full p-6 rounded-[2rem] border-3 flex items-center justify-between transition-all ${preferences.roast === roast.id ? 'border-[#1A0F0A] bg-[#1A0F0A] text-[#EBE2D4] shadow-[6px_6px_0_#B44222]' : 'border-[#1A0F0A]/10 bg-white text-[#1A0F0A]'}`}
                 >
                   <div className="flex flex-col text-left">
                      <span className="font-black text-xs uppercase tracking-widest">{roast.label}</span>
                      <span className="text-[9px] font-bold opacity-60 uppercase mt-0.5">{roast.sub}</span>
                   </div>
                   <Flame size={20} className={preferences.roast === roast.id ? "text-[#B44222]" : "opacity-10"} strokeWidth={3} />
                 </button>
               ))}
            </div>
          </div>
        )}

        {/* STEP 5: AVATAR */}
        {step === 5 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <SpeechBubble>
              "Dernière chose : ton style ! On ne rentre pas dans l'atelier sans un look d'enfer. Choisis ton apparence de base, tu pourras la peaufiner plus tard."
            </SpeechBubble>
            <div className="grid grid-cols-3 gap-3 px-2">
               {INITIAL_AESTHETICS.map((config, idx) => (
                 <button 
                  key={idx}
                  onClick={() => { hapticFeedback(5); setSelectedAvatar(idx); }}
                  className={`w-full aspect-[3/4] rounded-3xl border-3 flex flex-col items-center justify-end overflow-hidden relative transition-all duration-300 ${selectedAvatar === idx ? 'border-[#1A0F0A] bg-orange-100/50 shadow-[6px_6px_0_#1A0F0A] -translate-y-1' : 'border-[#1A0F0A]/10 bg-white hover:border-[#1A0F0A]/30'}`}
                 >
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] w-[120px] h-[120px]">
                      <CoffeeAvatar config={config} size={120} noBackground />
                   </div>
                   {selectedAvatar === idx && (
                     <div className="absolute top-2 right-2 bg-[#4ADE80] text-white p-1 rounded-full border-2 border-[#1A0F0A] z-10 animate-in zoom-in-50">
                       <Check size={10} strokeWidth={4} />
                     </div>
                   )}
                 </button>
               ))}
            </div>
          </div>
        )}

      </div>

      <div className="absolute bottom-12 left-6 right-6 flex justify-center">
         <button 
          onClick={nextStep}
          disabled={step === 3 && !selectedType}
          className={`w-full max-w-sm bg-[#1A0F0A] text-[#EBE2D4] py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:-translate-y-1 shadow-[0_8px_0_rgba(26,15,10,0.3)] transition-all active:translate-y-0 active:shadow-none disabled:opacity-20`}
         >
           {step === totalSteps ? "ENTRER DANS L'ATELIER" : "CONTINUER"}
           <ArrowRight size={18} strokeWidth={3} />
         </button>
      </div>

    </div>
  );
}
