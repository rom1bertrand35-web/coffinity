"use client";

import React from 'react';

interface IllustrationProps {
  className?: string;
  seed?: string | number; // Pour varier légèrement le dessin
}

/**
 * Composant générant une illustration de café de style "Carnet Botanique Ancien"
 * Style : Lignes noires fines, aspect gravure, minimaliste.
 */
export default function BotanicalCoffeeIllustration({ className, seed }: IllustrationProps) {
  // On utilise le seed pour choisir une variante d'illustration
  const variants = [
    // Variante 1 : La Branche de Caféier (Botanique)
    <g key="v1" stroke="currentColor" fill="none" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M50 85C50 85 48 60 60 40C72 20 85 15 85 15" opacity="0.6" />
      <path d="M50 85C50 85 55 70 40 55C25 40 15 45 15 45" opacity="0.4" />
      {/* Feuilles */}
      <path d="M60 40C60 40 75 45 82 35C89 25 78 22 72 20C66 18 58 25 60 40Z" fill="currentColor" fillOpacity="0.05" />
      <path d="M40 55C40 55 35 70 25 72C15 74 12 65 15 58C18 51 30 48 40 55Z" fill="currentColor" fillOpacity="0.05" />
      {/* Grains / Cerises */}
      <circle cx="58" cy="42" r="3" fill="#B44222" />
      <circle cx="62" cy="38" r="2.5" fill="#B44222" />
      <circle cx="38" cy="58" r="3" fill="#B44222" />
    </g>,
    // Variante 2 : Le Grain de Café Stylisé (Icône Luxe)
    <g key="v2" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="50" cy="50" rx="20" ry="30" transform="rotate(30 50 50)" />
      <path d="M38 35C38 35 45 50 50 50C55 50 62 65 62 65" />
      <path d="M45 42C45 42 48 48 50 50" opacity="0.5" />
      <path d="M52 52C52 52 55 58 58 62" opacity="0.5" />
    </g>,
    // Variante 3 : La Tasse Finesse (Ligne Claire)
    <g key="v3" stroke="currentColor" fill="none" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M30 40H70V65C70 75 60 80 50 80C40 80 30 75 30 65V40Z" />
      <path d="M70 45C75 45 80 50 80 55C80 60 75 65 70 65" />
      <path d="M45 25C45 25 47 15 50 15C53 15 55 25 55 25" opacity="0.4" />
      <path d="M35 30C35 30 37 20 40 20C43 20 45 30 45 30" opacity="0.2" />
    </g>
  ];

  // Sélection de la variante basée sur le seed (ou random si pas de seed)
  const index = seed 
    ? (typeof seed === 'string' ? seed.length % variants.length : Math.floor(Number(seed)) % variants.length)
    : 0;

  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {variants[index]}
    </svg>
  );
}
