"use client";

import { useState } from "react";
import { Coffee, Coins, ArrowRight, Check } from "lucide-react";
import CoffeeAvatar, { AvatarConfig } from "@/components/CoffeeAvatar";
import { hapticFeedback } from "@/utils/haptics";

interface WelcomeOnboardingProps {
  onComplete: (selectedConfig: AvatarConfig) => void;
}

const INITIAL_AESTHETICS: AvatarConfig[] = [
  { hairStyle: "man_bun_thick", hairColor: "#1A1A1A", facialHair: "full_bushy_beard", facialHairColor: "#1A1A1A", clothing: "barista_apron_over_tee", clothingColor: "#4ADE80", skinColor: "#E0B696", expression: "smile", accessory: "none" },
  { hairStyle: "shaggy", hairColor: "#B55239", facialHair: "none", facialHairColor: "#B55239", clothing: "green_v_pattern_shirt", clothingColor: "#4ADE80", skinColor: "#FFDBAC", expression: "wide_smile_teeth", accessory: "glasses" },
  { hairStyle: "pompadour", hairColor: "#2C1810", facialHair: "mustache", facialHairColor: "#2C1810", clothing: "tshirt", clothingColor: "#1A0F0A", skinColor: "#8D5524", expression: "cool", accessory: "gold_earring" },
];

export default function WelcomeOnboarding({ onComplete }: WelcomeOnboardingProps) {
  const [step, setStep] = useState(1);
  const [selectedAvatar, setSelectedAvatar] = useState<number>(0);

  const nextStep = () => {
    hapticFeedback(10);
    if (step < 3) {
      setStep(step + 1);
    } else {
      onComplete(INITIAL_AESTHETICS[selectedAvatar]);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#EBE2D4] flex flex-col justify-center items-center p-6 animate-in fade-in slide-in-from-bottom-[5%] duration-700 font-sans">
      
      {/* ProgressBar Brutaliste */}
      <div className="absolute top-12 left-12 right-12 flex items-center justify-between">
         <div className="text-xl font-black text-[#1A0F0A]">0{step} / 03</div>
         <div className="flex-1 ml-6 h-2 bg-black/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#1A0F0A] transition-all duration-500 ease-out" 
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
         </div>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-10 mt-10">
        
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col gap-6">
            <div className="w-24 h-24 bg-[#1A0F0A] rounded-full flex items-center justify-center shadow-[0_8px_0_rgba(0,0,0,0.2)] mb-4 -rotate-3">
              <Coffee size={40} className="text-[#EBE2D4]" strokeWidth={2.5} />
            </div>
            <h1 className="text-5xl font-serif text-[#1A0F0A] leading-none font-black tracking-tighter">Bienvenue dans la Tribu.</h1>
            <p className="text-lg text-[#1A0F0A]/80 font-bold leading-relaxed">
              Coffinity n'est pas qu'un réseau social.<br/> C'est le carnet de dégustation des puristes.
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col gap-6">
            <div className="w-full aspect-video bg-[#B44222] rounded-[2rem] border-4 border-[#1A0F0A] shadow-[0_10px_0_#1A0F0A] flex flex-col items-center justify-center p-6 relative overflow-hidden">
               {/* Coins Animation Mocks */}
               <Coins size={48} className="text-[#FFD700] absolute top-4 left-4 opacity-50 -rotate-12 animate-bounce" />
               <Coins size={32} className="text-[#FFD700] absolute bottom-8 right-6 opacity-30 rotate-12" />
               <div className="text-6xl font-black text-[#EBE2D4] drop-shadow-lg">100</div>
               <div className="text-[#EBE2D4] font-bold tracking-widest uppercase text-sm mt-2">BEANS OFFERTS</div>
            </div>
            
            <h2 className="text-4xl font-serif text-[#1A0F0A] leading-tight font-black tracking-tighter mt-4">Play to Earn.</h2>
            <p className="text-[#1A0F0A]/80 font-bold leading-relaxed">
              Pour te souhaiter la bienvenue, voici <strong className="text-[#1A0F0A]">100 Beans</strong>.<br/><br/>
              Gagne de l'argent en likant (+5), en commentant (+10) et en scannant massivement de nouveaux cafés (+20). Dépense-les dans la boutique pour construire ta propre identité.
            </p>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col gap-6">
            <h2 className="text-4xl font-serif text-[#1A0F0A] leading-tight font-black tracking-tighter mb-4">Prouve ton Style.</h2>
            
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
              (Tu pourras changer de tête et acheter d'autres vêtements plus tard).
            </p>
          </div>
        )}

      </div>

      <div className="absolute bottom-12 left-6 right-6 flex justify-center">
         <button 
          onClick={nextStep}
          className="w-full max-w-sm bg-[#1A0F0A] text-[#EBE2D4] py-5 rounded-full font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:-translate-y-1 hover:shadow-[0_8px_0_rgba(0,0,0,0.5)] transition-all active:translate-y-0 active:shadow-none"
         >
           {step === 3 ? "ENTRER DANS L'ARÈNE" : "CONTINUER"}
           <ArrowRight size={18} strokeWidth={2.5} />
         </button>
      </div>

    </div>
  );
}
