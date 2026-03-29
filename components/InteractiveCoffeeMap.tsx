"use client";

import React from 'react';
import { MapPin } from 'lucide-react';

interface Origin {
  name: string;
  x: number; // 0-100
  y: number; // 0-100
}

interface InteractiveCoffeeMapProps {
  origins: Origin[];
}

export default function InteractiveCoffeeMap({ origins }: InteractiveCoffeeMapProps) {
  return (
    <div className="w-full aspect-[2/1] bg-[#EBE2D4] border-2 border-[#1A0F0A] rounded-2xl relative overflow-hidden shadow-inner">
      {/* Hand-drawn style simple world map SVG path (abstract) */}
      <svg viewBox="0 0 100 50" className="w-full h-full opacity-20 fill-[#1A0F0A]">
        <path d="M10,20 Q15,10 25,15 T40,20 T55,15 T70,25 T85,20 Q95,30 85,40 T70,35 T55,45 T40,35 T25,40 T10,30 Z" />
        <path d="M60,5 Q70,0 80,5 T90,10 T85,20 T70,15 Z" />
        <path d="M20,40 Q30,45 40,40 T50,45 T45,35 Z" />
      </svg>

      {/* Origin Pins */}
      {origins.map((origin, idx) => (
        <div 
          key={idx}
          className="absolute group"
          style={{ left: `${origin.x}%`, top: `${origin.y}%` }}
        >
          <div className="relative -translate-x-1/2 -translate-y-full flex flex-col items-center">
            <div className="bg-[#B44222] text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-[#1A0F0A] shadow-md opacity-0 group-hover:opacity-100 transition-opacity mb-1 whitespace-nowrap">
              {origin.name}
            </div>
            <MapPin size={16} className="text-[#1A0F0A] fill-[#B44222] animate-bounce" />
          </div>
        </div>
      ))}

      {/* Grid overlay for aesthetic */}
      <div className="absolute inset-0 grid grid-cols-10 grid-rows-5 pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div key={i} className="border-[0.5px] border-[#1A0F0A]/5"></div>
        ))}
      </div>
    </div>
  );
}
