"use client";

import Link from "next/link";
import { Coffee, ScanLine, BarChart3, Users, ChevronRight, ArrowRight, Star } from "lucide-react";
import BotanicalCoffeeIllustration from "@/components/BotanicalCoffeeIllustration";
import CoffeeAvatar from "@/components/CoffeeAvatar";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";

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
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="min-h-screen bg-[#EBE2D4] text-[#1A0F0A] selection:bg-[#B44222] selection:text-white overflow-x-hidden">
      
      {/* Progress Bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-1.5 bg-[#B44222] origin-left z-[100]" style={{ scaleX }} />

      {/* Floating Botanical Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <FloatingElement delay={0} x="10%" y="20%" rotate={15} seed="f1" />
        <FloatingElement delay={1} x="85%" y="10%" rotate={-10} seed="f2" />
        <FloatingElement delay={0.5} x="5%" y="70%" rotate={45} seed="f3" />
        <FloatingElement delay={1.5} x="90%" y="80%" rotate={-20} seed="f4" />
      </div>

      {/* HEADER / NAV */}
      <nav className="p-6 md:px-12 md:py-10 flex justify-between items-center max-w-7xl mx-auto relative z-10">
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ rotate: 10, scale: 1.1 }}
            className="w-12 h-12 bg-[#1A0F0A] rounded-2xl flex items-center justify-center shadow-[4px_4px_0_rgba(180,66,34,1)] cursor-pointer"
          >
            <Coffee className="text-white" size={24} />
          </motion.div>
          <span className="font-serif font-black text-3xl tracking-tighter italic">Coffinity</span>
        </div>
        <Link 
          href="/auth" 
          className="bg-white border-3 border-[#1A0F0A] px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-[6px_6px_0_#1A0F0A] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_#1A0F0A] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
        >
          Se Connecter
        </Link>
      </nav>

      {/* HERO SECTION */}
      <section className="px-6 pt-16 pb-24 max-w-6xl mx-auto text-center space-y-16 relative z-10">
        
        {/* BARISTO INTRO */}
        <div className="flex flex-col items-center gap-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ y: -5 }}
            className="relative cursor-help"
          >
            <div className="w-28 h-28 bg-white border-4 border-[#1A0F0A] rounded-full shadow-[8px_8px_0_#1A0F0A] overflow-hidden p-1">
              <CoffeeAvatar config={BARISTO_CONFIG} size={104} />
            </div>
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -bottom-2 -right-2 bg-[#B44222] text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border-2 border-[#1A0F0A] shadow-md"
            >
              Mascotte
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative bg-white border-4 border-[#1A0F0A] p-8 rounded-[2.5rem] shadow-[10px_10px_0_#1A0F0A] max-w-md group"
          >
            <p className="text-base font-black leading-relaxed text-[#1A0F0A] uppercase tracking-tight italic">
              "Salut l'artiste ! Je suis Baristo. Bienvenue dans mon atelier digital. Prêt à archiver tes meilleurs crus avec moi ?"
            </p>
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-white border-l-4 border-t-4 border-[#1A0F0A] rotate-45"></div>
          </motion.div>
        </div>

        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-2 bg-[#B44222]/10 border-2 border-[#B44222]/20 px-6 py-2.5 rounded-full text-[#B44222] text-[11px] font-black uppercase tracking-[0.3em]"
          >
            <Star size={14} fill="currentColor" /> L'Élite des Baristas Indépendants
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-6xl md:text-9xl font-serif font-black italic leading-[0.85] tracking-tighter"
          >
            L'Archive de vos <br />
            <span className="text-[#B44222] relative">
              Meilleurs Crus.
              <motion.svg 
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                viewBox="0 0 100 10" className="absolute -bottom-2 left-0 w-full h-4 text-[#B44222] fill-none stroke-current stroke-[4px] rounded-full"
              >
                <path d="M0,5 Q50,10 100,5" />
              </motion.svg>
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xl md:text-2xl font-medium text-[#1A0F0A]/60 max-w-2xl mx-auto leading-relaxed font-sans"
          >
            Scannez vos paquets, analysez votre profil aromatique par IA et rejoignez une tribu de baristas exigeants.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="pt-8"
        >
          <Link 
            href="/auth" 
            className="group relative bg-[#1A0F0A] text-[#EBE2D4] px-12 py-8 rounded-[3rem] font-black text-lg uppercase tracking-[0.2em] shadow-[0_15px_0_rgba(180,66,34,0.3)] hover:-translate-y-2 active:translate-y-0 transition-all flex items-center gap-6 mx-auto w-fit overflow-hidden"
          >
            <span className="relative z-10">Entrer dans le Club</span>
            <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform relative z-10" />
            <motion.div 
              className="absolute inset-0 bg-[#B44222] translate-y-[100%]"
              whileHover={{ translateY: 0 }}
              transition={{ type: "tween" }}
            />
          </Link>
        </motion.div>
      </section>

      {/* SCROLLING MARQUEE */}
      <div className="bg-[#1A0F0A] py-10 overflow-hidden border-y-4 border-[#1A0F0A] flex whitespace-nowrap">
        <MarqueeText />
        <MarqueeText />
      </div>

      {/* FEATURES BENTO - ENHANCED FOR DESKTOP */}
      <section className="px-6 py-32 max-w-7xl mx-auto space-y-20 relative z-10">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
          <div className="space-y-4 text-left">
            <h2 className="text-5xl md:text-7xl font-serif font-black italic tracking-tighter leading-none">Plus qu'une application.</h2>
            <p className="text-[#B44222] font-black uppercase text-[12px] tracking-[0.4em]">Un carnet de bord botanique digital</p>
          </div>
          <p className="max-w-xs text-sm font-bold opacity-40 uppercase tracking-widest text-right">
            L'excellence réside dans le détail du grain et la précision du palais.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Card 1: 7 columns */}
          <BentoCard 
            className="md:col-span-7"
            title="Scan Intelligent" 
            desc="Identifiez instantanément plus de 260 références grâce à notre base de données spécialisée. Plus besoin de chercher, scannez et notez."
            icon={<ScanLine size={40} />}
            illustration={<BotanicalCoffeeIllustration seed="scan_big" className="w-64 h-64 opacity-10 absolute -right-10 -bottom-10 rotate-12 group-hover:rotate-0 transition-transform duration-700" />}
          />
          {/* Card 2: 5 columns */}
          <BentoCard 
            className="md:col-span-5"
            title="Radar de Goût" 
            desc="L'IA analyse vos dégustations pour définir votre profil : Fruité, Intense, Acide ou Équilibré."
            icon={<BarChart3 size={40} />}
            accent
          />
          {/* Card 3: 4 columns */}
          <BentoCard 
            className="md:col-span-4"
            title="Tribu Sociale" 
            desc="Suivez vos baristas favoris, échangez vos conseils et découvrez les tendances."
            icon={<Users size={32} />}
            illustration={
              <div className="flex -space-x-6 absolute -right-4 -bottom-4 opacity-40 group-hover:space-x-1 transition-all duration-500">
                <div className="border-4 border-[#1A0F0A] rounded-full overflow-hidden bg-white scale-90"><CoffeeAvatar config={{}} size={80} /></div>
                <div className="border-4 border-[#1A0F0A] rounded-full overflow-hidden bg-white"><CoffeeAvatar config={{}} size={80} /></div>
              </div>
            }
          />
          {/* Card 4: 8 columns */}
          <BentoCard 
            className="md:col-span-8"
            title="Monétisation Indépendante" 
            desc="Trouvez le café parfait au meilleur prix. Coffinity est partenaire des meilleurs torréfacteurs pour vous garantir des liens d'achat direct."
            icon={<Star size={32} />}
            illustration={<BotanicalCoffeeIllustration seed="beans" className="w-48 h-48 opacity-10 absolute right-10 -top-10 -rotate-45" />}
          />
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-6 py-40 text-center bg-[#EBE2D4] relative overflow-hidden z-10 border-t-4 border-[#1A0F0A]">
        <motion.div 
          style={{ opacity: useTransform(scrollYProgress, [0.8, 1], [0, 1]) }}
          className="max-w-4xl mx-auto space-y-12 relative z-10"
        >
          <h2 className="text-6xl md:text-9xl font-serif font-black italic tracking-tighter leading-tight">
            Votre prochain café <br /> commence ici.
          </h2>
          <div className="flex flex-col items-center gap-6">
            <Link 
              href="/auth" 
              className="inline-block bg-[#1A0F0A] text-[#EBE2D4] px-16 py-8 rounded-full font-black text-xl uppercase tracking-[0.3em] shadow-[0_10px_0_#B44222] hover:-translate-y-2 active:translate-y-0 transition-all border-4 border-[#1A0F0A]"
            >
              Créer mon Profil
            </Link>
            <p className="text-[12px] font-black text-[#1A0F0A]/40 uppercase tracking-[0.4em]">
              Rejoignez 1 200+ baristas exigeants
            </p>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="p-16 border-t-4 border-[#1A0F0A] bg-white text-center space-y-8 relative z-10">
        <div className="font-serif font-black text-4xl italic text-[#1A0F0A]">Coffinity</div>
        <div className="flex justify-center gap-12 text-[10px] font-black uppercase tracking-widest opacity-60">
          <Link href="#" className="hover:text-[#B44222] transition-colors">Manifeste</Link>
          <Link href="#" className="hover:text-[#B44222] transition-colors">Confidentialité</Link>
          <Link href="#" className="hover:text-[#B44222] transition-colors">Contact</Link>
        </div>
        <p className="text-[10px] font-bold text-[#1A0F0A]/40 uppercase tracking-[0.3em]">
          © 2026 Coffinity — Built for the lovers of the bean.
        </p>
      </footer>
    </div>
  );
}

function MarqueeText() {
  return (
    <div className="flex items-center gap-8 px-4 animate-marquee">
      {[1,2,3,4].map((i) => (
        <div key={i} className="flex items-center gap-8">
          <span className="text-4xl md:text-6xl font-serif font-black italic text-[#EBE2D4] uppercase tracking-tighter">L'Art du Grain</span>
          <Coffee className="text-[#B44222] w-12 h-12" />
          <span className="text-transparent uppercase tracking-tighter" style={{ WebkitTextStroke: '2px #EBE2D4', fontSize: '3.5rem', fontWeight: 900, fontFamily: 'var(--font-serif)' }}>Culture Barista</span>
          <Star className="text-[#B44222] w-12 h-12 fill-current" />
        </div>
      ))}
    </div>
  );
}

function FloatingElement({ delay, x, y, rotate, seed }: any) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: [0.05, 0.15, 0.05],
        y: [0, -30, 0],
        rotate: [rotate, rotate + 10, rotate]
      }}
      transition={{ 
        duration: 15, 
        delay, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
      className="absolute text-[#1A0F0A]"
      style={{ left: x, top: y }}
    >
      <BotanicalCoffeeIllustration seed={seed} className="w-80 h-80" />
    </motion.div>
  );
}

function BentoCard({ title, desc, icon, illustration, className = "", accent = false }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      className={`p-10 rounded-[3rem] border-4 border-[#1A0F0A] relative overflow-hidden transition-all hover:shadow-[12px_12px_0_#1A0F0A] group ${accent ? 'bg-white' : 'bg-transparent'} ${className}`}
    >
      <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center mb-8 border-3 border-[#1A0F0A] transition-transform group-hover:-rotate-12 ${accent ? 'bg-[#B44222] text-white shadow-[6px_6px_0_#1A0F0A]' : 'bg-white shadow-[6px_6px_0_#B44222]'}`}>
        {icon}
      </div>
      <h3 className="text-4xl font-serif font-black italic mb-6 tracking-tighter leading-none">{title}</h3>
      <p className="text-lg font-medium text-[#1A0F0A]/70 leading-relaxed relative z-10 max-w-sm">{desc}</p>
      {illustration}
    </motion.div>
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
