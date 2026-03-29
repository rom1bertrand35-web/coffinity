"use client";

import { Search, Coffee, Users, X, Bean, Thermometer, Zap } from "lucide-react";
import { hapticFeedback } from "@/utils/haptics";

interface SearchHeaderProps {
  mode: 'coffee' | 'people';
  setMode: (mode: 'coffee' | 'people') => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onBrandClick: (brand: string) => void;
  category: string;
  setCategory: (cat: string) => void;
  isCollapsed?: boolean;
}

const POPULAR_BRANDS = [
  { name: "Lavazza", icon: "🇮🇹" },
  { name: "Nespresso", icon: "☕️" },
  { name: "Starbucks", icon: "🧜‍♀️" },
  { name: "L'Or", icon: "🥇" },
  { name: "Carte Noire", icon: "⚫️" },
  { name: "Terres de Café", icon: "🌱" },
  { name: "Lugat", icon: "🦁" },
  { name: "Coutume", icon: "💎" },
  { name: "Malongo", icon: "🇫🇷" },
  { name: "Belleville", icon: "🗼" },
];

const CATEGORIES = [
  { name: "All", label: "Tout", icon: <Coffee size={14} /> },
  { name: "Grains", label: "Grains", icon: <Bean size={14} /> },
  { name: "Moulu", label: "Moulu", icon: <Thermometer size={14} /> },
  { name: "Capsules", label: "Capsules", icon: <Zap size={14} /> },
];

export default function SearchHeader({ 
  mode, 
  setMode, 
  searchTerm, 
  setSearchTerm, 
  onBrandClick,
  category,
  setCategory,
  isCollapsed = false
}: SearchHeaderProps) {
  
  const handleModeChange = (newMode: 'coffee' | 'people') => {
    setMode(newMode);
    hapticFeedback(5);
  };

  const handleBrandClick = (brand: string) => {
    onBrandClick(brand);
    hapticFeedback(10);
  };

  const handleCategoryClick = (cat: string) => {
    setCategory(cat);
    hapticFeedback(10);
  };

  return (
    <div className={`sticky top-0 z-20 bg-[#EBE2D4]/95 backdrop-blur-md transition-all duration-300 px-4 -mx-4 border-b-2 border-[#1A0F0A]/10 ${isCollapsed ? 'pb-2 pt-4 space-y-2 shadow-md' : 'pb-4 pt-10 space-y-5'}`}>
      {!isCollapsed && (
        <h1 className="text-4xl font-black italic tracking-tighter text-[#1A0F0A] uppercase animate-in fade-in slide-in-from-top-2 duration-300">Explorer</h1>
      )}
      
      {/* Toggle Mode Brutaliste */}
      {!isCollapsed && (
        <div className="flex bg-[#1A0F0A] p-1.5 rounded-2xl w-full border-2 border-[#1A0F0A] shadow-[0_4px_0_#1A0F0A] animate-in fade-in slide-in-from-top-4 duration-300">
          <button 
            onClick={() => handleModeChange('coffee')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all ${mode === 'coffee' ? 'bg-[#EBE2D4] text-[#1A0F0A] border-2 border-[#1A0F0A] translate-y-0.5' : 'text-[#EBE2D4] hover:bg-[#EBE2D4]/10'}`}
          >
            <Coffee size={16} strokeWidth={2.5} /> Cafés
          </button>
          <button 
            onClick={() => handleModeChange('people')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all ${mode === 'people' ? 'bg-[#EBE2D4] text-[#1A0F0A] border-2 border-[#1A0F0A] translate-y-0.5' : 'text-[#EBE2D4] hover:bg-[#EBE2D4]/10'}`}
          >
            <Users size={16} strokeWidth={2.5} /> Baristas
          </button>
        </div>
      )}

      {/* Search Input Brutaliste */}
      <div className="relative group">
        <div className="absolute inset-0 bg-[#1A0F0A] rounded-3xl translate-y-1 translate-x-1 opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
        <Search className={`absolute left-5 top-1/2 -translate-y-1/2 text-[#1A0F0A] transition-all ${isCollapsed ? 'w-4 h-4' : 'w-5 h-5'}`} size={20} strokeWidth={3} />
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={mode === 'coffee' ? "Chercher un grain..." : "Trouver un compagnon..."} 
          className={`relative w-full bg-white border-3 border-[#1A0F0A] rounded-3xl focus:outline-none focus:translate-y-[-2px] focus:translate-x-[-2px] shadow-[0_4px_0_#1A0F0A] transition-all font-bold placeholder:text-[#1A0F0A]/40 ${isCollapsed ? 'py-3 pl-12 pr-10 text-xs' : 'py-5 pl-14 pr-12 text-sm'}`}
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm("")}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-[#1A0F0A] hover:scale-110 transition-transform"
          >
            <X size={20} strokeWidth={3} />
          </button>
        )}
      </div>

      {/* Categories Chips */}
      {mode === 'coffee' && (
        <div className={`flex gap-2 overflow-x-auto no-scrollbar transition-all ${isCollapsed ? 'opacity-0 h-0 overflow-hidden mb-0' : 'pb-1 opacity-100'}`}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => handleCategoryClick(cat.name)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-black text-[9px] uppercase tracking-wider transition-all ${
                category === cat.name
                  ? "bg-[#1A0F0A] text-[#EBE2D4] border-[#1A0F0A] shadow-md"
                  : "bg-white/50 border-[#1A0F0A]/10 text-[#1A0F0A]/60 hover:border-[#1A0F0A]/30"
              }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Horizontal Brands Chips Brutaliste */}
      {mode === 'coffee' && (
        <div className={`flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 transition-all ${isCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'pb-2 opacity-100'}`}>
          {POPULAR_BRANDS.map((brand) => (
            <button
              key={brand.name}
              onClick={() => handleBrandClick(brand.name)}
              className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl border-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                searchTerm.toLowerCase().includes(brand.name.toLowerCase())
                  ? "bg-[#B44222] border-[#1A0F0A] text-white shadow-[0_4px_0_#1A0F0A] -translate-y-1"
                  : "bg-white border-[#1A0F0A] text-[#1A0F0A] hover:bg-orange-50 active:translate-y-0.5"
              }`}
            >
              <span className="text-sm">{brand.icon}</span>
              {brand.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
