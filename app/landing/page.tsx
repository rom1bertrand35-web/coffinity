"use client";

import Link from "next/link";
import { Coffee, ScanLine, BarChart3, Users, ChevronRight, ArrowRight, Star } from "lucide-react";
import BotanicalCoffeeIllustration from "@/components/BotanicalCoffeeIllustration";
import CoffeeAvatar from "@/components/CoffeeAvatar";
import { motion } from "framer-motion";

const BARISTO_CONFIG = {
  skinColor: "#F3D2B3",
  hairStyle: "cap",
  facialHair: "mustache",
  facialHairColor: "#1A1A1A",
  clothing: "barista_apron_over_tee",
  clothingColor: "#FAFAF8",
  expression: "wide_smile_teeth",
  accessory: "none"
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#EBE2D4] text-[#1A0F0A] selection:bg-[#B44222] selection:text-white">
      
      {/* HEADER / NAV */}
      <nav className="p-6 flex justify-between items-center max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#1A0F0A] rounded-xl flex items-center justify-center shadow-[3px_3px_0_rgba(180,66,34,1)]">
            <Coffee className="text-white" size={20} />
          </div>
          <span className="font-serif font-black text-2xl tracking-tighter italic">Coffinity</span>
        </div>
        <Link 
          href="/auth" 
          className="bg-white border-3 border-[#1A0F0A] px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-widest shadow-[4px_4px_0_#1A0F0A] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
        >
          Connexion
        </Link>
      </nav>

      {/* HERO SECTION */}
      <section className="px-6 pt-12 pb-20 max-w-4xl mx-auto text-center space-y-12">
        
        {/* BARISTO INTRO */}
        <div className="flex flex-col items-center gap-6">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative group"
          >
            <div className="w-24 h-24 bg-white border-4 border-[#1A0F0A] rounded-full shadow-[6px_6px_0_#1A0F0A] overflow-hidden p-1">
              <CoffeeAvatar config={BARISTO_CONFIG} size={88} />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-[#B44222] text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border-2 border-[#1A0F0A] shadow-md">
              Mascotte Officielle
            </div>
          </motion.div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative bg-white border-4 border-[#1A0F0A] p-6 rounded-[2rem] shadow-[8px_8px_0_#1A0F0A] max-w-md"
          >
            <p className="text-sm font-black leading-relaxed text-[#1A0F0A] uppercase tracking-tight italic">
              "Salut l'artiste ! Je suis Baristo. Bienvenue dans mon atelier digital. Prêt à archiver tes meilleurs crus avec moi ?"
            </p>
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-white border-l-4 border-t-4 border-[#1A0F0A] rotate-45"></div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-[#B44222]/10 border-2 border-[#B44222]/20 px-4 py-2 rounded-full text-[#B44222] text-[10px] font-black uppercase tracking-[0.2em]"
        >
          <Star size={12} fill="currentColor" /> Le Réseau Social des Passionnés de Grain
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-serif font-black italic leading-[0.9] tracking-tighter"
        >
          L'Archive de vos <br />
          <span className="text-[#B44222]">Meilleurs Crus.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl font-medium text-[#1A0F0A]/70 max-w-xl mx-auto leading-relaxed"
        >
          Scannez vos paquets, analysez votre profil aromatique par IA et rejoignez une tribu de baristas exigeants.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="pt-4"
        >
          <Link 
            href="/auth" 
            className="group bg-[#1A0F0A] text-[#EBE2D4] px-10 py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-[0_12px_0_rgba(180,66,34,0.3)] hover:-translate-y-1 active:translate-y-0 transition-all flex items-center gap-4 mx-auto w-fit"
          >
            Rejoindre la Tribu <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </section>

      {/* PROOF IN NUMBERS */}
      <section className="px-6 py-16 bg-[#1A0F0A] text-[#EBE2D4] -rotate-1 w-[110%] -left-[5%] relative overflow-hidden">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-12 md:gap-24 rotate-1 py-4">
          <StatItem value="1.2k" label="Baristas Actifs" />
          <StatItem value="260+" label="Crus Référencés" />
          <StatItem value="5k" label="Notes & Avis" />
          <StatItem value="100%" label="Indépendant" />
        </div>
      </section>

      {/* FEATURES BENTO */}
      <section className="px-6 py-24 max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-serif font-black italic tracking-tighter">Plus qu'une simple application.</h2>
          <p className="text-[#1A0F0A]/60 font-bold uppercase text-[10px] tracking-[0.3em]">Un carnet de bord botanique digital</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <BentoCard 
            title="Scan Intelligent" 
            desc="Identifiez instantanément plus de 260 références grâce à notre base de données spécialisée."
            icon={<ScanLine size={32} />}
            illustration={<BotanicalCoffeeIllustration seed="scan" className="w-32 h-32 opacity-20 absolute -right-4 -bottom-4" />}
          />
          {/* Card 2 */}
          <BentoCard 
            title="Radar de Goût" 
            desc="L'IA analyse vos dégustations pour définir votre profil : Fruité, Intense, Acide ou Équilibré."
            icon={<BarChart3 size={32} />}
            accent
          />
          {/* Card 3 */}
          <BentoCard 
            title="Tribu Sociale" 
            desc="Suivez vos baristas favoris, échangez vos conseils et découvrez les tendances de la semaine."
            icon={<Users size={32} />}
            illustration={
              <div className="flex -space-x-4 absolute -right-4 -bottom-2 opacity-30">
                <div className="border-2 border-[#1A0F0A] rounded-full overflow-hidden bg-white scale-75"><CoffeeAvatar config={{}} size={60} /></div>
                <div className="border-2 border-[#1A0F0A] rounded-full overflow-hidden bg-white"><CoffeeAvatar config={{}} size={60} /></div>
              </div>
            }
          />
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-6 py-32 text-center bg-[#EBE2D4] relative overflow-hidden">
        <BotanicalCoffeeIllustration seed="final" className="absolute top-0 left-0 w-64 h-64 opacity-5 -translate-x-20 -translate-y-20 rotate-45" />
        <BotanicalCoffeeIllustration seed="final2" className="absolute bottom-0 right-0 w-64 h-64 opacity-5 translate-x-20 translate-y-20 -rotate-12" />
        
        <div className="max-w-2xl mx-auto space-y-10 relative z-10">
          <h2 className="text-5xl font-serif font-black italic tracking-tighter leading-tight">
            Votre prochain café <br /> commence ici.
          </h2>
          <Link 
            href="/auth" 
            className="inline-block bg-[#1A0F0A] text-[#EBE2D4] px-12 py-6 rounded-full font-black text-sm uppercase tracking-[0.2em] shadow-[0_8px_0_#B44222] hover:-translate-y-1 active:translate-y-0 transition-all"
          >
            Créer mon Profil Gratuitement
          </Link>
          <p className="text-[10px] font-black text-[#1A0F0A]/40 uppercase tracking-widest">
            Disponible en WebApp & PWA • Gratuit pour toujours
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="p-12 border-t-2 border-[#1A0F0A]/10 text-center space-y-6">
        <div className="font-serif font-black text-xl italic opacity-30">Coffinity</div>
        <p className="text-[9px] font-bold text-[#1A0F0A]/40 uppercase tracking-widest">
          © 2026 Coffinity — Crafted with Passion & Caffeine
        </p>
      </footer>
    </div>
  );
}

function StatItem({ value, label }: { value: string, label: string }) {
  return (
    <div className="text-center space-y-1">
      <div className="text-4xl md:text-5xl font-serif font-black italic text-[#B44222]">{value}</div>
      <div className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-60">{label}</div>
    </div>
  );
}

function BentoCard({ title, desc, icon, illustration, accent = false }: any) {
  return (
    <div className={`p-8 rounded-[2.5rem] border-3 border-[#1A0F0A] relative overflow-hidden transition-all hover:shadow-[8px_8px_0_#1A0F0A] group ${accent ? 'bg-white' : 'bg-transparent'}`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border-2 border-[#1A0F0A] transition-transform group-hover:-rotate-6 ${accent ? 'bg-[#B44222] text-white shadow-[4px_4px_0_#1A0F0A]' : 'bg-white shadow-[4px_4px_0_#B44222]'}`}>
        {icon}
      </div>
      <h3 className="text-2xl font-serif font-black italic mb-4 tracking-tighter">{title}</h3>
      <p className="text-sm font-medium text-[#1A0F0A]/70 leading-relaxed relative z-10">{desc}</p>
      {illustration}
    </div>
  );
}
