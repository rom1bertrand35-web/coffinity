"use client";

import { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Star, ArrowLeft, Camera, ImagePlus, Loader2, Bean, Thermometer, Zap, Wind } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { usePoints } from "@/components/PointsFeedback";
import { awardBeans } from "@/lib/economy";

function RateCoffeeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showPoints } = usePoints();

  const initialName = searchParams.get('name') || "";
  const initialBrand = searchParams.get('brand') || "";
  const initialImage = searchParams.get('image') || "";

  const [coffeeName, setCoffeeName] = useState(initialName);
  const [brand, setBrand] = useState(initialBrand);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // New specific criteria
  const [intensity, setIntensity] = useState(3);
  const [acidity, setAcidity] = useState(3);
  const [body, setBody] = useState(3);
  const [aroma, setAroma] = useState(3);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Gestion de la photo utilisateur
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ALL_TAGS = ["Fruity", "Floral", "Chocolate", "Nutty", "Acidic", "Bitter", "Sweet", "Spicy", "Caramel"];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      if (selectedTags.length < 3) {
        setSelectedTags([...selectedTags, tag]);
      }
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image is too large (max 5MB).");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }
    if (!coffeeName) {
      setError("Coffee name is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Modération globale
      const textToModerate = `${coffeeName} ${review}`;
      const entryType = (!initialName && !initialBrand) ? 'manual_entry' : 'review';

      const modRes = await fetch('/api/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: textToModerate, 
          type: entryType,
          coffeeName: coffeeName,
          brand: brand
        })
      });
      const modData = await modRes.json();

      if (!modData.isSafe) {
        setError(modData.reason || "Please ensure your content is appropriate and coffee-related.");
        setIsSubmitting(false);
        return;
      }

      // 2. Vérification Supabase Auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error("Auth error:", authError);
        router.push('/auth');
        return;
      }

      // On utilise la photo de l'utilisateur en priorité, sinon celle de la base de données
      const finalImageUrl = userPhoto || initialImage || null;

      const { data: insertData, error: insertError } = await supabase
        .from('tastings')
        .insert([
          {
            user_id: user.id,
            coffee_name: coffeeName,
            brand: brand,
            rating: rating,
            tags: selectedTags,
            review: review,
            image_url: finalImageUrl,
            intensity: intensity,
            acidity: acidity,
            body: body,
            aroma: aroma
          }
        ])
        .select();

      if (insertError) {
         console.error("Supabase Insert Error details:", JSON.stringify(insertError, null, 2));
         throw insertError;
      }

      // Update user points (+20 for a review)
      await awardBeans(user.id, 20);
      showPoints(20, "Expert ! You shared a new tasting.");
      
      router.push('/');
      router.refresh();

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to post your review. Please try again.");
      setIsSubmitting(false);
    }
  };

  const RatingSlider = ({ label, icon, value, onChange, low, high }: any) => (
    <div className="flex flex-col gap-2 bg-white/50 p-4 rounded-3xl border border-[#1A0F0A]/5">
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-black text-[10px] uppercase tracking-widest text-[#1A0F0A]">{label}</span>
        </div>
        <span className="font-black text-xs text-[var(--color-accent)]">{value}/5</span>
      </div>
      <input 
        type="range" min="1" max="5" step="1" 
        value={value} 
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#1A0F0A]"
      />
      <div className="flex justify-between px-1 text-[8px] font-bold text-stone-400 uppercase tracking-tighter">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col p-4 pb-24">
      <style dangerouslySetInnerHTML={{__html: `nav { display: none !important; }`}} />

      <header className="flex items-center gap-4 py-4 mb-4">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors text-[#1A0F0A]">
          <ArrowLeft size={24} strokeWidth={3} />
        </button>
        <h1 className="text-xl font-black uppercase tracking-tighter text-[#1A0F0A] font-serif italic">Archive de Dégustation</h1>
      </header>

      {error && (
        <div className="w-full p-4 mb-6 text-sm font-bold text-red-600 bg-red-50 border-2 border-red-200 rounded-2xl animate-bounce">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4">

        {/* Photo Upload Area */}
        <div className="flex flex-col items-center gap-3">
          <input 
            type="file" 
            accept="image/*" 
            capture="environment"
            className="hidden" 
            ref={fileInputRef}
            onChange={handlePhotoUpload}
          />

          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`w-full h-64 rounded-[2.5rem] border-4 transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group shadow-[0_10px_0_rgba(26,15,10,0.05)] ${
              userPhoto ? "border-[#1A0F0A] bg-white" : "border-dashed border-stone-200 bg-stone-100 hover:border-[#1A0F0A]"
            }`}
          >
            {userPhoto ? (
              <img src={userPhoto} alt="Your coffee" className="w-full h-full object-cover animate-in fade-in duration-500" />
            ) : initialImage ? (
              <>
                <img src={initialImage} alt="Database coffee" className="w-full h-full object-contain p-8 opacity-40 group-hover:opacity-20 transition-opacity" />
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white/90 backdrop-blur-md p-4 rounded-full shadow-xl mb-3 border-2 border-[#1A0F0A]">
                    <Camera size={32} className="text-[#1A0F0A]" />
                  </div>
                  <span className="font-black text-[#1A0F0A] uppercase tracking-widest text-[10px]">Utiliser ma propre photo</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-stone-400 group-hover:text-[#1A0F0A] transition-colors p-6">
                <div className="bg-white p-5 rounded-3xl border-2 border-[#1A0F0A]/5 shadow-sm mb-4">
                  <ImagePlus size={40} className="text-stone-300 group-hover:text-[#1A0F0A] transition-colors" />
                </div>
                <span className="font-black uppercase tracking-widest text-[10px] mb-1">Prendre un cliché</span>
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-tighter">Immortalisez vos grains</span>
              </div>
            )}

            {userPhoto && (
              <div className="absolute bottom-4 right-4 bg-[#1A0F0A] text-[#EBE2D4] p-3 rounded-2xl shadow-xl animate-in zoom-in border-2 border-[#EBE2D4]">
                <Camera size={20} />
              </div>
            )}
          </div>
        </div>

        {/* Product Identity */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#1A0F0A]/40 pl-1">Nom du Café</label>
            <input 
              type="text" 
              value={coffeeName}
              onChange={(e) => setCoffeeName(e.target.value)}
              placeholder="Ex: Yirgacheffe Grains" 
              className="w-full bg-white border-3 border-[#1A0F0A] rounded-2xl py-4 px-5 focus:outline-none focus:translate-y-[-2px] focus:translate-x-[-2px] text-sm shadow-[0_4px_0_#1A0F0A] transition-all font-bold"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#1A0F0A]/40 pl-1">Torréfacteur / Marque</label>
            <input 
              type="text" 
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Ex: Terres de Café" 
              className="w-full bg-white border-3 border-[#1A0F0A] rounded-2xl py-4 px-5 focus:outline-none focus:translate-y-[-2px] focus:translate-x-[-2px] text-sm shadow-[0_4px_0_#1A0F0A] transition-all font-bold"
            />
          </div>
        </div>

        {/* Main Rating */}
        <div className="flex flex-col items-center gap-3 py-4 bg-white rounded-[2rem] border-3 border-[#1A0F0A] shadow-[0_6px_0_#1A0F0A]">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1A0F0A]/60">Note Globale</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button 
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none hover:scale-110 transition-transform active:scale-90"
              >
                <Star 
                  size={40} 
                  strokeWidth={2.5}
                  className={star <= rating ? "fill-[#B44222] text-[#1A0F0A]" : "text-stone-200 fill-stone-50"} 
                />
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Criteria */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RatingSlider label="Intensité" icon={<Zap size={14} className="text-[#B44222]" />} value={intensity} onChange={setIntensity} low="Léger" high="Puissant" />
          <RatingSlider label="Acidité" icon={<Thermometer size={14} className="text-blue-500" />} value={acidity} onChange={setAcidity} low="Douce" high="Vive" />
          <RatingSlider label="Corps" icon={<Bean size={14} className="text-amber-800" />} value={body} onChange={setBody} low="Fluide" high="Onctueux" />
          <RatingSlider label="Arôme" icon={<Wind size={14} className="text-purple-500" />} value={aroma} onChange={setAroma} low="Discret" high="Explosif" />
        </div>

        {/* Flavor Tags */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-end pl-1 pr-1">
             <label className="text-[10px] font-black uppercase tracking-widest text-[#1A0F0A]">Profil Aromatique</label>
             <span className="text-[9px] font-bold text-stone-400 uppercase">Max 3</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {ALL_TAGS.map(tag => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border-2 ${
                    isSelected 
                      ? "bg-[#1A0F0A] border-[#1A0F0A] text-[#EBE2D4] shadow-md -translate-y-0.5" 
                      : "bg-white border-[#1A0F0A]/10 text-[#1A0F0A]/60 hover:border-[#1A0F0A]/30"
                  }`}
                >
                  {tag}
                </button>
              )
            })}
          </div>
        </div>

        {/* Review Text */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-[#1A0F0A]/40 pl-1">Notes de dégustation</label>
          <textarea 
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Décrivez votre expérience..." 
            className="w-full bg-white border-3 border-[#1A0F0A] rounded-2xl py-4 px-5 focus:outline-none focus:translate-y-[-2px] focus:translate-x-[-2px] text-sm shadow-[0_4px_0_#1A0F0A] transition-all font-bold min-h-[140px]"
          />
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-[#1A0F0A] text-[#EBE2D4] font-black py-5 rounded-[2rem] shadow-[0_10px_0_rgba(26,15,10,1)] hover:translate-y-1 hover:shadow-[0_6px_0_rgba(26,15,10,1)] active:translate-y-2 active:shadow-none transition-all flex items-center justify-center h-16 uppercase tracking-[0.2em] text-xs"
        >
          {isSubmitting ? (
             <Loader2 className="animate-spin" size={20} />
          ) : (
             "Publier l'Archive"
          )}
        </button>

      </form>
    </div>
  );
}

export default function RateCoffeePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#EBE2D4]">
        <Loader2 className="animate-spin text-[#1A0F0A] mb-2" size={40} />
        <p className="text-[#1A0F0A]/40 font-black uppercase tracking-widest text-[10px] animate-pulse">Chargement de l'atelier...</p>
      </div>
    }>
      <RateCoffeeForm />
    </Suspense>
  );
}
