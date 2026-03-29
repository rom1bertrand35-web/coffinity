"use client";

import { useState } from "react";
import { Coffee, Coins, ArrowRight, Check, Bean, Thermometer, Zap, Milk, Flame, Sparkles, Plus } from "lucide-react";
import CoffeeAvatar, { AvatarConfig } from "@/components/CoffeeAvatar";
import { hapticFeedback } from "@/utils/haptics";

interface WelcomeOnboardingProps {
  onComplete: (data: { 
    avatarConfig: AvatarConfig, 
    baristaType: string, 
    preferences: any 
  }) => void;
}

const INITIAL_AESTHETICS: AvatarConfig[] = [
  { hairStyle: "man_bun_thick", hairColor: "#1A1A1A", facialHair: "full_bushy_beard", facialHairColor: "#1A1A1A", clothing: "barista_apron_over_tee", clothingColor: "#4ADE80", skinColor: "#E0B696", expression: "smile", accessory: "none" },
  { hairStyle: "shaggy", hairColor: "#B55239", facialHair: "none", facialHairColor: "#B55239", clothing: "green_v_pattern_shirt", clothingColor: "#4ADE80", skinColor: "#FFDBAC", expression: "wide_smile_teeth", accessory: "glasses" },
  { hairStyle: "pompadour", hairColor: "#2C1810", facialHair: "mustache", facialHairColor: "#2C1810", clothing: "tshirt", clothingColor: "#1A0F0A", skinColor: "#8D5524", expression: "cool", accessory: "gold_earring" },
];

const BARISTA_TYPES = [
  { 
    id: "espresso_purist", 
    label: "Le Puriste Espresso", 
    desc: "Pour toi, le café se boit court, noir et sans compromis.",
    icon: <Zap size={24} className="text-[#B44222]" />,
    match: "Intensity & Body"
  },
  { 
    id: "filter_enthusiast", 
    label: "L'Amateur de Filtre", 
    desc: "Tu cherches la clarté, l'acidité et les notes florales.",
    icon: <Thermometer size={24} className="text-blue-500" />,
    match: "Acidity & Aroma"
  },
  { 
    id: "latte_lover", 
    label: "Le Fan de Latté", 
    desc: "Onctuosité et gourmandise sont tes maîtres mots.",
    icon: <Milk size={24} className="text-amber-600" />,
    match: "Sweetness & Body"
  },
  { 
    id: "capsule_explorer", 
    label: "L'Explorateur Nomade", 
    desc: "Efficacité et découverte de nouvelles marques en capsules.",
    icon: <Plus size={24} className="text-green-600" />,
    match: "Convenience & Variety"
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

  return (
    <div className="fixed inset-0 z-[100] bg-[#EBE2D4] flex flex-col justify-center items-center p-6 animate-in fade-in slide-in-from-bottom-[5%] duration-700 font-sans overflow-hidden">
      
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

      <div className="w-full max-w-sm flex flex-col gap-8 mt-10">
        
        {/* STEP 1: WELCOME & CONCEPT */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col gap-6">
            <div className="w-24 h-24 bg-[#1A0F0A] rounded-full flex items-center justify-center shadow-[0_8px_0_rgba(0,0,0,0.2)] mb-4 -rotate-3">
              <Coffee size={40} className="text-[#EBE2D4]" strokeWidth={2.5} />
            </div>
            <h1 className="text-5xl font-serif text-[#1A0F0A] leading-none font-black tracking-tighter">L'Atelier des Baristas.</h1>
            <p className="text-lg text-[#1A0F0A]/80 font-bold leading-relaxed">
              Coffinity est ton carnet de bord numérique.<br/><br/>
              Archive tes dégustations, découvre des grains du monde entier et compare tes notes avec la tribu.
            </p>
          </div>
        )}

        {/* STEP 2: PLAY TO EARN */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col gap-6">
            <div className="w-full aspect-video bg-[#B44222] rounded-[2rem] border-4 border-[#1A0F0A] shadow-[0_10px_0_#1A0F0A] flex flex-col items-center justify-center p-6 relative overflow-hidden">
               <Sparkles size={48} className="text-[#FFD700] absolute top-4 left-4 opacity-50 -rotate-12 animate-pulse" />
               <div className="text-6xl font-black text-[#EBE2D4] drop-shadow-lg">100</div>
               <div className="text-[#EBE2D4] font-bold tracking-widest uppercase text-sm mt-2">BEANS DE BIENVENUE</div>
            </div>
            
            <h2 className="text-4xl font-serif text-[#1A0F0A] leading-tight font-black tracking-tighter mt-4">Ta Monnaie, Tes Grains.</h2>
            <p className="text-[#1A0F0A]/80 font-bold leading-relaxed">
              Nous t'offrons <strong className="text-[#1A0F0A]">100 Beans</strong> pour bien démarrer.<br/><br/>
              Gagne des Beans à chaque archive partagée. Utilise-les pour débloquer des accessoires exclusifs et monter en niveau.
            </p>
          </div>
        )}

        {/* STEP 3: PREFERENCES (NEW) */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col gap-6">
            <h2 className="text-4xl font-serif text-[#1A0F0A] leading-tight font-black tracking-tighter mb-2">Quel grain es-tu ?</h2>
            
            <div className="grid grid-cols-1 gap-3">
               {BARISTA_TYPES.map((type) => (
                 <button 
                  key={type.id}
                  onClick={() => { hapticFeedback(5); setSelectedType(type.id); }}
                  className={`w-full p-5 rounded-2xl border-3 flex items-center gap-4 text-left transition-all duration-300 ${selectedType === type.id ? 'border-[#1A0F0A] bg-white shadow-[0_6px_0_#1A0F0A] -translate-y-1' : 'border-[#1A0F0A]/10 bg-white/50 opacity-60 hover:opacity-100 hover:border-[#1A0F0A]/30'}`}
                 >
                   <div className="bg-stone-100 p-3 rounded-xl border-2 border-[#1A0F0A]/5">
                      {type.icon}
                   </div>
                   <div className="flex-1">
                      <p className="font-black text-xs uppercase tracking-wider text-[#1A0F0A]">{type.label}</p>
                      <p className="text-[10px] font-bold text-[#1A0F0A]/60 leading-tight mt-1">{type.desc}</p>
                   </div>
                   {selectedType === type.id && <Check size={16} className="text-[#B44222]" strokeWidth={4} />}
                 </button>
               ))}
            </div>
          </div>
        )}

        {/* STEP 4: ROAST PREFERENCE (NEW) */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col gap-6">
            <h2 className="text-4xl font-serif text-[#1A0F0A] leading-tight font-black tracking-tighter mb-2">Ton intensité idéale.</h2>
            <p className="text-[#1A0F0A]/60 font-bold -mt-4 uppercase text-[10px] tracking-widest">Choisis ta torréfaction favorite</p>
            
            <div className="flex flex-col gap-4">
               {["Légère (Acidulée)", "Moyenne (Équilibrée)", "Foncée (Puissante)"].map((roast, idx) => (
                 <button 
                  key={idx}
                  onClick={() => { hapticFeedback(5); setPreferences({...preferences, roast: roast.toLowerCase()}); }}
                  className={`w-full p-6 rounded-[2rem] border-3 flex items-center justify-between transition-all ${preferences.roast === roast.toLowerCase() ? 'border-[#1A0F0A] bg-[#1A0F0A] text-[#EBE2D4] shadow-lg' : 'border-[#1A0F0A]/10 bg-white text-[#1A0F0A]'}`}
                 >
                   <span className="font-black text-sm uppercase tracking-wider">{roast}</span>
                   {preferences.roast === roast.toLowerCase() ? <Flame size={20} className="text-[#B44222]" /> : <Flame size={20} className="opacity-10" />}
                 </button>
               ))}
            </div>
          </div>
        )}

        {/* STEP 5: AVATAR SELECTION */}
        {step === 5 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col gap-6">
            <h2 className="text-4xl font-serif text-[#1A0F0A] leading-tight font-black tracking-tighter mb-4">Ton Identité.</h2>
            
            <div className="grid grid-cols-3 gap-3">
               {INITIAL_AESTHETICS.map((config, idx) => (
                 <button 
                  key={idx}
                  onClick={() => { hapticFeedback(5); setSelectedAvatar(idx); }}
                  className={`w-full aspect-[3/4] rounded-2xl border-[3px] flex flex-col items-center justify-end overflow-hidden relative transition-all duration-300 ${selectedAvatar === idx ? 'border-[#1A0F0A] bg-orange-100/50 shadow-[0_6px_0_#1A0F0A] -translate-y-1' : 'border-[#1A0F0A]/20 bg-white hover:border-[#1A0F0A]/50'}`}
                 >
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] w-[120px] h-[120px]">
                      <CoffeeAvatar config={config} size={120} noBackground />
                   </div>
                   {selectedAvatar === idx && (
                     <div className="absolute top-2 right-2 bg-[#4ADE80] text-white p-1 rounded-full border-2 border-[#1A0F0A] z-10 animate-in zoom-in-50">
                       <Check size={12} strokeWidth={4} />
                     </div>
                   )}
                 </button>
               ))}
            </div>
            <p className="text-sm font-bold text-[#1A0F0A]/60 text-center mt-2">
              Prêt à brasser ? Clique ci-dessous pour entrer dans l'Atelier.
            </p>
          </div>
        )}

      </div>

      <div className="absolute bottom-12 left-6 right-6 flex justify-center">
         <button 
          onClick={nextStep}
          disabled={step === 3 && !selectedType}
          className={`w-full max-w-sm bg-[#1A0F0A] text-[#EBE2D4] py-5 rounded-full font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:-translate-y-1 hover:shadow-[0_8px_0_rgba(0,0,0,0.5)] transition-all active:translate-y-0 active:shadow-none disabled:opacity-30 disabled:hover:translate-y-0 disabled:hover:shadow-none`}
         >
           {step === totalSteps ? "COMMENCER L'EXPÉRIENCE" : "CONTINUER"}
           <ArrowRight size={18} strokeWidth={2.5} />
         </button>
      </div>

    </div>
  );
}
