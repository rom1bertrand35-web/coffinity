"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Coffee, Zap, Wind, Droplets } from "lucide-react";

interface TasteProfile {
  avg_intensity: number;
  avg_acidity: number;
  avg_body: number;
  avg_aroma: number;
  total_tastings: number;
}

export default function TasteRadar({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<TasteProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      const { data, error } = await supabase
        .from("user_taste_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (data) setProfile(data);
      setLoading(false);
    }
    fetchProfile();
  }, [userId]);

  if (loading) return <div className="h-48 w-full bg-black/5 animate-pulse rounded-3xl border-2 border-dashed border-[#1A0F0A]/20" />;
  
  if (!profile || profile.total_tastings < 1) {
    return (
      <div className="p-6 bg-white rounded-3xl border-2 border-[#1A0F0A] shadow-[4px_4px_0px_0px_rgba(26,15,10,1)] text-center">
        <Coffee className="w-10 h-10 mx-auto mb-2 opacity-20" />
        <p className="font-serif italic text-[#1A0F0A]/60">Scannez quelques cafés pour révéler votre profil de dégustateur...</p>
      </div>
    );
  }

  // Calcul des points du radar (SVG)
  const size = 200;
  const center = size / 2;
  const radius = size * 0.4;
  
  const getPoint = (value: number, angle: number) => {
    const r = (value / 5) * radius; // Valeur sur 5
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return `${x},${y}`;
  };

  const points = [
    getPoint(profile.avg_intensity, -Math.PI / 2),      // Haut
    getPoint(profile.avg_aroma, 0),                    // Droite
    getPoint(profile.avg_body, Math.PI / 2),           // Bas
    getPoint(profile.avg_acidity, Math.PI),            // Gauche
  ].join(" ");

  return (
    <div className="bg-white p-6 rounded-[2.5rem] border-2 border-[#1A0F0A] shadow-[8px_8px_0px_0px_rgba(26,15,10,1)] relative overflow-hidden">
      <div className="absolute top-4 right-6 text-right">
        <span className="text-[10px] font-sans font-black uppercase tracking-tighter opacity-30">Analyse du</span>
        <h3 className="text-xl font-serif font-bold leading-tight">Profil de Goût</h3>
      </div>

      <div className="flex items-center justify-center py-4">
        <svg width={size} height={size} className="drop-shadow-sm">
          {/* Cercles de guide */}
          {[1, 2, 3, 4, 5].map((level) => (
            <circle
              key={level}
              cx={center}
              cy={center}
              r={(level / 5) * radius}
              fill="none"
              stroke="#1A0F0A"
              strokeWidth="0.5"
              strokeDasharray="4 4"
              className="opacity-10"
            />
          ))}
          
          {/* Axes */}
          <line x1={center} y1={center - radius} x2={center} y2={center + radius} stroke="#1A0F0A" strokeWidth="0.5" className="opacity-10" />
          <line x1={center - radius} y1={center} x2={center + radius} y2={center} stroke="#1A0F0A" strokeWidth="0.5" className="opacity-10" />

          {/* Polygone du profil */}
          <polygon
            points={points}
            fill="#B44222"
            fillOpacity="0.15"
            stroke="#B44222"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          
          {/* Points aux sommets */}
          {points.split(" ").map((p, i) => {
            const [x, y] = p.split(",");
            return <circle key={i} cx={x} cy={y} r="4" fill="#1A0F0A" stroke="white" strokeWidth="2" />;
          })}
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-2">
        <StatItem icon={<Zap className="text-amber-600" size={12} />} label="Intensité" value={profile.avg_intensity.toFixed(1)} />
        <StatItem icon={<Wind className="text-blue-500" size={12} />} label="Arômes" value={profile.avg_aroma.toFixed(1)} />
        <StatItem icon={<Coffee className="text-orange-900" size={12} />} label="Corps" value={profile.avg_body.toFixed(1)} />
        <StatItem icon={<Droplets className="text-emerald-500" size={12} />} label="Acidité" value={profile.avg_acidity.toFixed(1)} />
      </div>
      
      <p className="mt-4 text-[10px] text-center font-sans uppercase tracking-widest opacity-40 font-bold">
        Basé sur {profile.total_tastings} dégustations
      </p>
    </div>
  );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-2 bg-[#EBE2D4]/50 p-2 rounded-xl border border-[#1A0F0A]/10">
      {icon}
      <div className="flex flex-col">
        <span className="text-[8px] uppercase font-bold opacity-50 tracking-tighter leading-none mb-1">{label}</span>
        <span className="text-sm font-serif font-black leading-none">{value}/5</span>
      </div>
    </div>
  );
}
