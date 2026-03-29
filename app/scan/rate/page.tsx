"use client";

import { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Star, ArrowLeft, Camera, ImagePlus, Loader2 } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col p-4 pb-24">
      <style dangerouslySetInnerHTML={{__html: `nav { display: none !important; }`}} />

      <header className="flex items-center gap-4 py-4 mb-4">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Rate this Coffee</h1>
      </header>

      {error && (
        <div className="w-full p-3 mb-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4">

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
            className={`w-full h-64 rounded-[2.5rem] border-4 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group shadow-inner ${
              userPhoto ? "border-[var(--color-primary)] bg-white" : "border-stone-200 bg-stone-100 hover:border-[var(--color-primary)]"
            }`}
          >
            {userPhoto ? (
              <img src={userPhoto} alt="Your coffee" className="w-full h-full object-cover animate-in fade-in duration-500" />
            ) : initialImage ? (
              <>
                <img src={initialImage} alt="Database coffee" className="w-full h-full object-contain p-8 opacity-40 group-hover:opacity-20 transition-opacity" />
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white/90 backdrop-blur-md p-4 rounded-full shadow-xl mb-3">
                    <Camera size={32} className="text-[var(--color-primary)]" />
                  </div>
                  <span className="font-black text-[var(--color-primary)] uppercase tracking-widest text-xs">Prendre ma propre photo</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-stone-400 group-hover:text-[var(--color-primary)] transition-colors p-6">
                <div className="bg-white p-5 rounded-full shadow-sm mb-4">
                  <ImagePlus size={40} className="text-stone-300 group-hover:text-[var(--color-primary)] transition-colors" />
                </div>
                <span className="font-black uppercase tracking-widest text-xs mb-1">Ajouter une photo</span>
                <span className="text-[10px] font-bold text-stone-400">Montrez-nous vos grains ou votre tasse !</span>
              </div>
            )}

            {userPhoto && (
              <div className="absolute bottom-4 right-4 bg-[var(--color-primary)] text-white p-3 rounded-2xl shadow-xl animate-in zoom-in">
                <Camera size={20} />
              </div>
            )}
          </div>
        </div>
        {/* Détails du produit (si on a scanné) */}
        {(initialName || initialBrand) && (
          <div className="flex flex-col items-center text-center px-4">
               <h2 className="font-bold text-2xl leading-tight text-[var(--color-primary)]">{coffeeName}</h2>
               <p className="text-sm font-medium text-gray-500 uppercase tracking-widest mt-1">{brand}</p>
          </div>
        )}

        {/* Si c'est un ajout manuel */}
        {(!initialName && !initialBrand) && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 pl-1">Coffee Name *</label>
              <input 
                type="text" 
                value={coffeeName}
                onChange={(e) => setCoffeeName(e.target.value)}
                placeholder="e.g. Kenya Yirgacheffe Beans" 
                className="w-full bg-white border border-[var(--color-border)] rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm shadow-sm"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 pl-1">Roaster / Brand</label>
              <input 
                type="text" 
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. L'Arbre à Café" 
                className="w-full bg-white border border-[var(--color-border)] rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm shadow-sm"
              />
            </div>
          </div>
        )}

        <div className="flex flex-col items-center gap-2 py-2">
          <label className="text-sm font-medium text-gray-500">Your Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button 
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none hover:scale-110 transition-transform"
              >
                <Star 
                  size={44} 
                  className={star <= rating ? "fill-[var(--color-accent)] text-[var(--color-accent)] drop-shadow-sm" : "text-gray-200"} 
                />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-end pl-1 pr-1">
             <label className="text-sm font-medium text-gray-700">Flavor Profile</label>
             <span className="text-xs text-gray-400">Max 3</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {ALL_TAGS.map(tag => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
                    isSelected 
                      ? "bg-[var(--color-secondary)] border-[var(--color-secondary)] text-[var(--color-secondary-foreground)]" 
                      : "bg-white border-[var(--color-border)] text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {tag}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 pl-1">Review</label>
          <textarea 
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="How did you brew it? What are your thoughts?" 
            className="w-full bg-white border border-[var(--color-border)] rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm shadow-sm min-h-[120px] resize-y"
          />
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full mt-2 bg-[var(--color-primary)] text-white font-bold py-4 rounded-2xl shadow-[0_8px_20px_rgb(64,53,40,0.2)] hover:scale-[1.02] transition-transform disabled:opacity-70 flex items-center justify-center h-14"
        >
          {isSubmitting ? (
             <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
             "Publish Tasting"
          )}
        </button>

      </form>
    </div>
  );
}

export default function RateCoffeePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Loader2 className="animate-spin text-[var(--color-primary)] mb-2" size={40} />
        <p className="text-gray-500 animate-pulse">Loading rating form...</p>
      </div>
    }>
      <RateCoffeeForm />
    </Suspense>
  );
}