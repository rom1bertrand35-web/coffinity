"use client";

import { Search, Coffee, Users, X } from "lucide-react";
import { hapticFeedback } from "@/utils/haptics";

interface SearchHeaderProps {
  mode: 'coffee' | 'people';
  setMode: (mode: 'coffee' | 'people') => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onBrandClick: (brand: string) => void;
}

const POPULAR_BRANDS = [
  { name: "Lavazza", icon: "☕️" },
  { name: "Terres de Café", icon: "🌱" },
  { name: "Lugat", icon: "🦁" },
  { name: "Bazzara", icon: "🔥" },
  { name: "Café Mokxa", icon: "💎" },
  { name: "L'Arbre à Café", icon: "🌳" },
];

export default function SearchHeader({ mode, setMode, searchTerm, setSearchTerm, onBrandClick }: SearchHeaderProps) {
  
  const handleModeChange = (newMode: 'coffee' | 'people') => {
    setMode(newMode);
    hapticFeedback(5);
  };

  const handleBrandClick = (brand: string) => {
    onBrandClick(brand);
    hapticFeedback(10);
  };

  return (
    <div className="sticky top-0 z-20 bg-stone-50/80 backdrop-blur-md pb-4 pt-10 px-4 -mx-4 space-y-4">
      <h1 className="text-3xl font-black tracking-tight text-[var(--color-primary)]">DÉCOUVRIR</h1>
      
      {/* Toggle Mode */}
      <div className="flex bg-stone-200/50 p-1 rounded-2xl w-full shadow-inner">
        <button 
          onClick={() => handleModeChange('coffee')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${mode === 'coffee' ? 'bg-white text-[var(--color-primary)] shadow-sm' : 'text-stone-400'}`}
        >
          <Coffee size={16} /> Cafés
        </button>
        <button 
          onClick={() => handleModeChange('people')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${mode === 'people' ? 'bg-white text-[var(--color-primary)] shadow-sm' : 'text-stone-400'}`}
        >
          <Users size={16} /> Baristas
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={mode === 'coffee' ? "Chercher un café, une marque..." : "Chercher un barista..."} 
          className="w-full bg-white border border-stone-200 rounded-3xl py-5 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm shadow-sm transition-all font-medium"
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-500"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Horizontal Brands Chips (Only in Coffee mode) */}
      {mode === 'coffee' && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
          {POPULAR_BRANDS.map((brand) => (
            <button
              key={brand.name}
              onClick={() => handleBrandClick(brand.name)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all ${
                searchTerm.toLowerCase().includes(brand.name.toLowerCase())
                  ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-md scale-105"
                  : "bg-white border-stone-200 text-stone-600 hover:border-stone-300 shadow-sm active:scale-95"
              }`}
            >
              <span>{brand.icon}</span>
              {brand.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
