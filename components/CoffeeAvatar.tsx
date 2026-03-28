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

// Valeurs par défaut "Fallbacks" si la config est vide ou incomplète
const DEFAULT_CONFIG = {
  skinColor: "#F3D2B3",
  hairColor: "#4B2C20",
  clothingColor: "#E5E7EB",
  hairStyle: "short",
  facialHair: "none",
  facialHairColor: "#4B2C20",
  clothing: "tshirt",
  accessory: "none",
  expression: "smile"
};

export default function CoffeeAvatar({ config, size = 100, className = "", noBackground = false }: CoffeeAvatarProps) {
  // Fusion de la config reçue avec les valeurs par défaut
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

  const id = React.useId().replace(/:/g, "");

  // Renderers
  const renderHair = () => {
    switch (hairStyle) {
      case 'buzz_cut':
        return <path d="M25 45 Q25 22 50 22 Q75 22 75 45 L78 52 Q50 48 22 52 Z" fill={hairColor} opacity="0.4" />;
      case 'bowl_cut':
        return <path d="M18 45 Q18 15 50 15 Q82 15 82 45 L84 52 Q50 48 16 52 Z" fill={`url(#hairGrad-${id})`} />;
      case 'mullet':
        return (
          <g>
            <path d="M22 45 L18 80 Q20 88 40 88 L60 88 Q80 88 82 80 L78 45 Z" fill={`url(#hairGrad-${id})`} />
            <path d="M22 42 Q22 20 50 20 Q78 20 78 42 L80 50 Q50 46 20 50 Z" fill={`url(#hairGrad-${id})`} />
          </g>
        );
      case 'man_bun':
        return (
          <g>
            <circle cx="50" cy="15" r="10" fill={`url(#hairGrad-${id})`} />
            <path d="M22 42 Q22 20 50 20 Q78 20 78 42 L80 52 Q50 48 20 52 Z" fill={`url(#hairGrad-${id})`} />
          </g>
        );
      case 'long_wavy':
        return <path d="M15 45 Q10 70 15 90 Q30 100 50 95 Q70 100 85 90 Q90 70 85 45 Q85 15 50 15 Q15 15 15 45 Z" fill={`url(#hairGrad-${id})`} />;
      case 'ponytail':
        return (
          <g>
            <path d="M75 40 Q95 40 95 70 Q90 85 75 80" fill={`url(#hairGrad-${id})`} />
            <path d="M20 45 Q20 18 50 18 Q80 18 80 45 L82 52 Q50 48 18 52 Z" fill={`url(#hairGrad-${id})`} />
          </g>
        );
      case 'afro':
        return <circle cx="50" cy="40" r="35" fill={`url(#hairGrad-${id})`} />;
      case 'mohawk':
        return <path d="M40 45 L42 8 Q50 2 58 8 L60 45 Z" fill={`url(#hairGrad-${id})`} />;
      case 'bob_cut':
        return <path d="M18 45 Q18 18 50 18 Q82 18 82 45 L85 75 Q85 80 75 80 Q50 75 25 80 Q15 80 15 75 Z" fill={`url(#hairGrad-${id})`} />;
      case 'spiky':
        return (
          <g fill={`url(#hairGrad-${id})`}>
            <path d="M20 45 Q20 20 50 20 Q80 20 80 45 L82 50 Q50 45 18 50 Z" />
            <path d="M25 25 L30 10 L40 22 Z" />
            <path d="M40 20 L50 5 L60 20 Z" />
            <path d="M60 22 L70 10 L75 25 Z" />
          </g>
        );
      case 'pixie':
        return <path d="M22 45 Q22 25 50 25 Q78 25 78 45 L82 55 L70 45 L50 48 L30 45 L18 55 Z" fill={`url(#hairGrad-${id})`} />;
      case 'bald':
        return null;
      case 'short':
      default:
        return <path d="M24 45 Q24 22 50 22 Q76 22 76 45 L78 52 L22 52 Z" fill={`url(#hairGrad-${id})`} />;
    }
  };

  const renderFacialHair = () => {
    switch (facialHair) {
      case 'mustache':
        return <path d="M35 72 Q50 65 65 72 Q68 75 62 76 Q50 72 38 76 Q32 75 35 72" fill={facialHairColor} filter="url(#shadow-small)" />;
      case 'beard':
        return <path d="M25 60 Q50 100 75 60 L78 50 Q50 68 22 50 Z" fill={facialHairColor} opacity="0.9" />;
      case 'goatee':
        return <path d="M42 78 Q50 95 58 78 L55 75 Q50 78 45 75 Z" fill={facialHairColor} />;
      case 'stubble':
        return <path d="M28 60 Q50 90 72 60" stroke={facialHairColor} strokeWidth="8" fill="none" opacity="0.2" strokeDasharray="1 2" />;
      default:
        return null;
    }
  };

  const renderClothing = () => {
    const grad = `url(#clothGrad-${id})`;
    switch (clothing) {
      case 'hoodie':
        return (
          <g>
            <path d="M10 100 Q50 85 90 100 L110 150 L-10 150 Z" fill={grad} />
            <path d="M30 100 Q50 115 70 100 L75 130 Q50 140 25 130 Z" fill="rgba(0,0,0,0.1)" />
          </g>
        );
      case 'jacket':
        return (
          <g>
            <path d="M10 100 Q50 85 90 100 L110 150 L-10 150 Z" fill={grad} />
            <path d="M48 95 L52 95 L52 150 L48 150 Z" fill="rgba(0,0,0,0.2)" />
            <path d="M35 100 L50 120 L65 100" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
          </g>
        );
      case 'shirt':
        return (
          <g>
            <path d="M10 100 Q50 85 90 100 L110 150 L-10 150 Z" fill={grad} />
            <path d="M35 95 L50 110 L65 95" fill="white" opacity="0.9" />
          </g>
        );
      case 'sweater':
        return (
          <g>
            <path d="M10 100 Q50 85 90 100 L115 150 L-15 150 Z" fill={grad} />
            <path d="M25 100 Q50 108 75 100" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="4" />
          </g>
        );
      case 'turtleneck':
        return (
          <g>
            <path d="M10 100 Q50 85 90 100 L110 150 L-10 150 Z" fill={grad} />
            <rect x="35" y="90" width="30" height="15" rx="4" fill={grad} stroke="rgba(0,0,0,0.1)" />
          </g>
        );
      case 'apron':
        return (
          <g>
            <path d="M10 100 Q50 85 90 100 L110 150 L-10 150 Z" fill="#f5f5f5" />
            <path d="M30 90 L70 90 L80 150 L20 150 Z" fill="#3d231a" />
            <rect x="42" y="115" width="16" height="12" rx="2" fill="rgba(0,0,0,0.2)" />
          </g>
        );
      case 'tshirt':
      default:
        return <path d="M10 100 Q50 85 90 100 L110 150 L-10 150 Z" fill={grad} />;
    }
  };

  const renderAccessory = () => {
    switch (accessory) {
      case 'glasses':
        return (
          <g stroke="#333" strokeWidth="2" fill="none">
            <rect x="28" y="52" width="18" height="12" rx="4" />
            <rect x="54" y="52" width="18" height="12" rx="4" />
            <path d="M46 58 L54 58" />
          </g>
        );
      case 'round_glasses':
        return (
          <g stroke="#1a1a1a" strokeWidth="2" fill="rgba(255,255,255,0.1)">
            <circle cx="35" cy="58" r="10" />
            <circle cx="65" cy="58" r="10" />
            <path d="M45 58 L55 58" fill="none" />
          </g>
        );
      case 'sunglasses':
        return (
          <g fill="#1a1a1a">
            <rect x="28" y="52" width="20" height="10" rx="2" />
            <rect x="52" y="52" width="20" height="10" rx="2" />
            <path d="M48 56 L52 56" stroke="#1a1a1a" strokeWidth="2" />
          </g>
        );
      case 'beanie':
        return <path d="M22 40 Q22 10 50 10 Q78 10 78 40 L82 48 Q50 45 18 48 Z" fill="#2d3748" filter="url(#shadow-small)" />;
      case 'cap':
        return (
          <g>
            <path d="M22 40 Q22 15 50 15 Q78 15 78 40 L82 45 L18 45 Z" fill={clothingColor} />
            <path d="M78 40 L95 45 L95 50 L78 45 Z" fill={adjustColor(clothingColor || "#E5E7EB", -40)} />
          </g>
        );
      case 'headphones':
        return (
          <g stroke="#333" strokeWidth="6" fill="none">
            <path d="M20 55 Q20 15 50 15 Q80 15 80 55" />
            <rect x="15" y="50" width="8" height="15" rx="4" fill="#1a1a1a" stroke="none" />
            <rect x="77" y="50" width="8" height="15" rx="4" fill="#1a1a1a" stroke="none" />
          </g>
        );
      default:
        return null;
    }
  };

  const renderExpression = () => {
    switch (expression) {
      case 'neutral':
        return <path d="M44 80 L56 80" stroke="rgba(0,0,0,0.4)" strokeWidth="2.5" fill="none" strokeLinecap="round" />;
      case 'surprised':
        return <circle cx="50" cy="80" r="4" fill="rgba(0,0,0,0.3)" />;
      case 'cool':
        return <path d="M40 78 Q50 82 60 78" stroke="rgba(0,0,0,0.4)" strokeWidth="3" fill="none" strokeLinecap="round" />;
      case 'smile':
      default:
        return <path d="M42 78 Q50 84 58 78" stroke="rgba(0,0,0,0.4)" strokeWidth="2.5" fill="none" strokeLinecap="round" />;
    }
  };

  return (
    <div style={{ width: size, height: size }} className={`relative overflow-hidden ${noBackground ? "" : "bg-stone-100 dark:bg-stone-900 rounded-[2.5rem] border border-white/50 shadow-inner"} ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <radialGradient id={`skinGrad-${id}`} cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor={adjustColor(skinColor || "#F3D2B3", 30)} />
            <stop offset="40%" stopColor={skinColor} />
            <stop offset="85%" stopColor={adjustColor(skinColor || "#F3D2B3", -30)} />
            <stop offset="100%" stopColor={adjustColor(skinColor || "#F3D2B3", -50)} />
          </radialGradient>
          <linearGradient id={`hairGrad-${id}`} x1="10%" y1="0%" x2="90%" y2="100%">
            <stop offset="0%" stopColor={adjustColor(hairColor || "#4B2C20", 40)} />
            <stop offset="50%" stopColor={hairColor} />
            <stop offset="100%" stopColor={adjustColor(hairColor || "#4B2C20", -40)} />
          </linearGradient>
          <linearGradient id={`clothGrad-${id}`} x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor={adjustColor(clothingColor || "#E5E7EB", 20)} />
            <stop offset="50%" stopColor={clothingColor} />
            <stop offset="100%" stopColor={adjustColor(clothingColor || "#E5E7EB", -40)} />
          </linearGradient>
          <radialGradient id={`eyeGrad-${id}`} cx="50%" cy="50%" r="50%">
            <stop offset="70%" stopColor="white" />
            <stop offset="100%" stopColor="#e0e0e0" />
          </radialGradient>
          {/* Filtres 3D Pixar */}
          <filter id="shadow-small" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#2c1e16" floodOpacity="0.15"/>
          </filter>
          <filter id="shadow-medium" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#2c1e16" floodOpacity="0.25"/>
          </filter>
          <filter id="blur-blush" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* Tête (Face 3D Mesh) */}
        <path d="M20 52 C20 25 30 10 50 10 C70 10 80 25 80 52 C80 82 65 92 50 92 C35 92 20 82 20 52 Z" fill={`url(#skinGrad-${id})`} filter="url(#shadow-small)" />
        
        {/* Blush (Subsurface scattering) */}
        <ellipse cx="30" cy="65" rx="6" ry="4" fill="#ff4d4d" opacity="0.3" filter="url(#blur-blush)" />
        <ellipse cx="70" cy="65" rx="6" ry="4" fill="#ff4d4d" opacity="0.3" filter="url(#blur-blush)" />
        
        {/* Yeux Pixar (Glazed / Specular) */}
        <g filter="url(#shadow-small)">
          {/* Blanc de l'oeil avec relief */}
          <ellipse cx="38" cy="56" rx="7" ry="8.5" fill={`url(#eyeGrad-${id})`} />
          <ellipse cx="62" cy="56" rx="7" ry="8.5" fill={`url(#eyeGrad-${id})`} />
          
          {/* Iris & Pupille */}
          <circle cx="39" cy="56" r="4.5" fill="#2c1e16" />
          <circle cx="61" cy="56" r="4.5" fill="#2c1e16" />
          
          {/* Brillance (Specular highlights) */}
          <circle cx="37.5" cy="54" r="1.8" fill="white" />
          <circle cx="59.5" cy="54" r="1.8" fill="white" />
          <circle cx="40.5" cy="57.5" r="0.8" fill="white" opacity="0.7" />
          <circle cx="62.5" cy="57.5" r="0.8" fill="white" opacity="0.7" />
        </g>

        {/* Nez 3D */}
        <ellipse cx="50" cy="64" rx="4.5" ry="3.5" fill={adjustColor(skinColor || "#F3D2B3", -15)} opacity="0.8" />
        <ellipse cx="50" cy="63.2" rx="2.5" ry="1.5" fill="white" opacity="0.3" />

        <g filter="url(#shadow-medium)">
          {renderExpression()}
          {renderClothing()}
          {renderFacialHair()}
          {renderAccessory()}
          {renderHair()}
        </g>
      </svg>
    </div>
  );
}

function adjustColor(color: string, amount: number) {
  if (!color) return "#000000"; // Sécurité anti-crash
  return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).slice(-2));
}
