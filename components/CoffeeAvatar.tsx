"use client";

import React from 'react';

export type AvatarConfig = {
  gender?: string;
  hairStyle?: string;
  hairColor?: string;
  facialHair?: string;
  facialHairColor?: string;
  clothing?: string;
  clothingColor?: string;
  skinColor?: string;
  accessory?: string;
  expression?: string;
};

interface CoffeeAvatarProps {
  config: AvatarConfig;
  size?: number;
  className?: string;
  noBackground?: boolean;
}

const DEFAULT_CONFIG = {
  skinColor: "#F3D2B3",
  hairColor: "#1A1A1A",
  clothingColor: "#4ADE80",
  hairStyle: "man_bun_thick",
  facialHair: "full_bushy_beard",
  facialHairColor: "#1A1A1A",
  clothing: "green_v_pattern_shirt",
  accessory: "gold_earring",
  expression: "wide_smile_teeth"
};

export default function CoffeeAvatar({ config, size = 100, className = "", noBackground = false }: CoffeeAvatarProps) {
  const safeConfig = { ...DEFAULT_CONFIG, ...config };
  
  const { 
    skinColor, 
    hairColor, 
    clothingColor, 
    hairStyle, 
    facialHair, 
    facialHairColor, 
    clothing,
    accessory,
    expression
  } = safeConfig;

  const renderHair = () => {
    switch (hairStyle) {
      case 'man_bun_thick':
        return (
          <g fill={hairColor} stroke="#1A0F0A" strokeWidth="2.5" strokeLinejoin="round">
            {/* Top Bun */}
            <path d="M45 10 C35 5 50 0 60 5 C75 10 50 20 45 10 Z" />
            <path d="M55 12 C65 2 70 12 55 20 Z" />
            {/* Main Hair Cutout Style */}
            <path d="M26 40 C20 20 80 20 74 40 L70 30 C60 15 40 15 30 30 Z" />
            <path d="M26 40 L30 20 L35 30 L45 15 L55 30 L65 15 L70 30 L74 40 Z" />
            {/* Strands */}
            <path d="M30 42 L35 25 M40 40 L45 20 M50 38 L55 20 M60 40 L65 25 M70 42 L72 30" stroke={hairColor} strokeWidth="4" />
          </g>
        );
      case 'pompadour':
        return (
          <g fill={hairColor} stroke="#1A0F0A" strokeWidth="2.5" strokeLinejoin="round">
            <path d="M24 45 C10 10 90 10 76 45 C75 30 60 10 50 10 C40 10 25 30 24 45 Z" />
            <path d="M25 40 Q40 5 60 20 Q50 -5 25 40 Z" />
          </g>
        );
      case 'shaggy':
        return (
          <g fill={hairColor} stroke="#1A0F0A" strokeWidth="2.5" strokeLinejoin="round">
            <path d="M22 55 L20 40 L25 30 L30 35 L40 15 L50 25 L60 15 L70 35 L75 30 L80 40 L78 55 Z" />
            <path d="M26 35 L30 50 M40 25 L35 45 M60 25 L65 45 M74 35 L70 50" stroke="#1A0F0A" />
          </g>
        );
      case 'short':
      default:
        return (
          <g fill={hairColor} stroke="#1A0F0A" strokeWidth="2.5" strokeLinejoin="round">
            <path d="M25 40 C25 20 75 20 75 40 L78 45 L22 45 Z" />
            <path d="M28 42 L30 25 M40 40 L45 20 M60 40 L65 20 M72 42 L70 25" stroke="#1A0F0A" strokeWidth="1" />
          </g>
        );
    }
  };

  const renderFacialHair = () => {
    switch (facialHair) {
      case 'full_bushy_beard':
        return (
          <g fill={facialHairColor} stroke="#1A0F0A" strokeWidth="2.5" strokeLinejoin="round">
            <path d="M24 55 Q20 75 30 85 Q40 95 50 95 Q60 95 70 85 Q80 75 76 55 L70 70 Q50 85 30 70 Z" />
            <path d="M30 85 L35 100 L45 85 L55 100 L65 85" stroke="#1A0F0A" strokeWidth="2.5" fill="none" />
          </g>
        );
      case 'handlebar':
        return (
          <g fill={facialHairColor} stroke="#1A0F0A" strokeWidth="2.5" strokeLinejoin="round">
            <path d="M35 65 Q50 60 65 65 Q75 55 60 62 Q50 58 40 62 Q25 55 35 65 Z" />
          </g>
        );
      case 'mustache':
        return (
          <g fill={facialHairColor} stroke="#1A0F0A" strokeWidth="2.5" strokeLinejoin="round">
            <path d="M40 65 Q50 63 60 65 Q65 68 50 68 Q35 68 40 65 Z" />
          </g>
        );
      default:
        return null;
    }
  };

  const renderClothing = () => {
    switch (clothing) {
      case 'green_v_pattern_shirt':
        return (
          <g stroke="#1A0F0A" strokeWidth="2.5" strokeLinejoin="round">
            {/* Cou / Col */}
            <path d="M35 80 L50 95 L65 80 L75 80 L70 110 L30 110 L25 80 Z" fill={clothingColor} />
            <path d="M35 80 L50 95 L65 80" fill="none" stroke="#1A0F0A" strokeWidth="3" />
            <circle cx="50" cy="85" r="2" fill="#1A0F0A" />
            <circle cx="50" cy="98" r="2" fill="#1A0F0A" />
            <circle cx="50" cy="111" r="2" fill="#1A0F0A" />
            {/* Shoulders */}
            <path d="M25 80 Q10 85 5 110 L95 110 Q90 85 75 80 Z" fill={clothingColor} />
            {/* Patterns V */}
            <g stroke="#1A0F0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.6">
              <path d="M20 90 L25 95 L30 90" />
              <path d="M15 100 L20 105 L25 100" />
              <path d="M35 100 L40 105 L45 100" />
              <path d="M60 90 L65 95 L70 90" />
              <path d="M75 100 L80 105 L85 100" />
              <path d="M55 105 L60 110 L65 105" />
            </g>
          </g>
        );
      case 'barista_apron_over_tee':
        return (
          <g stroke="#1A0F0A" strokeWidth="2.5" strokeLinejoin="round">
            <path d="M10 110 Q20 85 35 80 L65 80 Q80 85 90 110 Z" fill={clothingColor} />
            {/* Tablier en Cuir */}
            <path d="M30 85 L70 85 L75 110 L25 110 Z" fill="#6B4226" />
            <path d="M35 90 L65 90" stroke="#8B5A2B" strokeWidth="2" />
            {/* Sangles */}
            <path d="M30 85 L20 70 M70 85 L80 70" fill="none" stroke="#1A0F0A" strokeWidth="3" />
          </g>
        );
      case 'tshirt':
      default:
        return (
          <g stroke="#1A0F0A" strokeWidth="2.5" strokeLinejoin="round">
            <path d="M10 110 Q20 85 35 80 L65 80 Q80 85 90 110 Z" fill={clothingColor} />
            <path d="M35 80 C40 90 60 90 65 80" fill="none" />
          </g>
        );
    }
  };

  const renderAccessory = () => {
    switch (accessory) {
      case 'gold_earring':
        return (
          <g stroke="#1A0F0A" strokeWidth="2">
            <circle cx="82" cy="62" r="4" fill="#FFD700" />
            <circle cx="82" cy="62" r="1.5" fill="#1A0F0A" stroke="none" />
          </g>
        );
        case 'glasses':
          return (
            <g stroke="#1A0F0A" strokeWidth="2" fill="none">
              <rect x="25" y="42" width="22" height="15" rx="2" fill="rgba(255,255,255,0.4)" />
              <rect x="53" y="42" width="22" height="15" rx="2" fill="rgba(255,255,255,0.4)" />
              <path d="M47 48 L53 48 M25 45 L15 42 M75 45 L85 42" strokeWidth="3" />
            </g>
          );
      default:
        return null;
    }
  };

  const renderExpression = () => {
    switch (expression) {
      case 'wide_smile_teeth':
        return (
          <g stroke="#1A0F0A" strokeWidth="2.5" strokeLinejoin="round">
            {/* Bouche ouverte et rouge */}
            <path d="M35 68 C45 80 55 80 65 68 C60 76 40 76 35 68 Z" fill="#FF1A1A" />
            {/* Dents hautes */}
            <path d="M38 70 C45 74 55 74 62 70" fill="white" />
            <path d="M42 70 L42 72 M50 71 L50 73 M58 70 L58 72" stroke="#1A0F0A" strokeWidth="1" />
            {/* Gros sourcils asymétriques */}
            <path d="M28 40 L44 42 L42 36 Z" fill="#1A0F0A" stroke="none"/>
            <path d="M72 40 L56 42 L58 36 Z" fill="#1A0F0A" stroke="none"/>
          </g>
        );
      case 'angry_brows':
        return (
          <g stroke="#1A0F0A" strokeWidth="2.5" strokeLinejoin="round">
            <path d="M42 75 L58 75" fill="none" />
            <path d="M25 35 L45 42 L40 38 Z" fill="#1A0F0A" stroke="none"/>
            <path d="M75 35 L55 42 L60 38 Z" fill="#1A0F0A" stroke="none"/>
          </g>
        );
      case 'smile':
      default:
        return (
          <g stroke="#1A0F0A" strokeWidth="2.5" strokeLinejoin="round">
            <path d="M40 70 C45 76 55 76 60 70" fill="none" />
            <path d="M30 38 L42 40 M70 38 L58 40" strokeWidth="3.5" strokeLinecap="round" />
          </g>
        );
    }
  };

  return (
    <div style={{ width: size, height: size }} className={`relative overflow-hidden ${noBackground ? "" : "bg-[#EBE2D4] rounded-full border-[3px] border-[#1A0F0A]"} ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full scale-[1.05]">
        {/* Core Head & Neck structure with Vector Outlines */}
        <g stroke="#1A0F0A" strokeWidth="2.5" strokeLinejoin="round">
          {/* Cou Épais */}
          <path d="M35 70 L35 90 C35 95 65 95 65 90 L65 70 Z" fill={skinColor} />
          <path d="M35 85 L65 85" stroke="#1A0F0A" strokeWidth="1" opacity="0.2" fill="none" />
          
          {/* Oreilles (Grandes, circulaires comme image) */}
          <path d="M24 50 C12 45 15 65 24 60 Z" fill={skinColor} />
          <path d="M20 52 C18 55 18 58 20 60" fill="none" strokeWidth="1.5" />
          <path d="M76 50 C88 45 85 65 76 60 Z" fill={skinColor} />
          <path d="M80 52 C82 55 82 58 80 60" fill="none" strokeWidth="1.5" />

          {/* Visage (Bords marqués et carrés) */}
          <path d="M28 35 C28 20 72 20 72 35 L76 55 C76 75 65 85 50 85 C35 85 24 75 24 55 Z" fill={skinColor} />
        </g>
        
        {/* Tâches de rousseur (Détail rough) */}
        <g fill="#A0522D" opacity="0.3">
          <circle cx="34" cy="58" r="0.8" />
          <circle cx="38" cy="56" r="0.8" />
          <circle cx="32" cy="62" r="0.8" />
          <circle cx="66" cy="58" r="0.8" />
          <circle cx="62" cy="56" r="0.8" />
          <circle cx="68" cy="62" r="0.8" />
        </g>

        {/* Nez texturé et imposant */}
        <g stroke="#1A0F0A" strokeWidth="2.5" strokeLinejoin="round">
          <ellipse cx="50" cy="54" rx="4" ry="8" fill="#E6A391" />
        </g>

        {/* Yeux Vector */}
        <g fill="#1A0F0A" stroke="none">
          <circle cx="38" cy="48" r="3.5" />
          <circle cx="62" cy="48" r="3.5" />
          {/* Reflet Oeil */}
          <circle cx="39" cy="47" r="1" fill="white" />
          <circle cx="63" cy="47" r="1" fill="white" />
        </g>

        {/* Render Layers */}
        <g>
          {renderExpression()}
          {renderFacialHair()}
          {renderHair()}
          {renderClothing()}
          {renderAccessory()}
        </g>
      </svg>
    </div>
  );
}
