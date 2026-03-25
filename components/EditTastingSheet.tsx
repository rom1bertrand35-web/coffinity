"use client";

import { useState, useRef, useEffect } from "react";
import { Drawer } from "vaul";
import { Star, Camera, ImagePlus, X, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { usePoints } from "@/components/PointsFeedback";

interface EditTastingSheetProps {
  tasting: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function EditTastingSheet({ tasting, isOpen, onClose, onUpdate }: EditTastingSheetProps) {
  const { showPoints } = usePoints();
  const [coffeeName, setCoffeeName] = useState("");
  const [brand, setBrand] = useState("");
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ALL_TAGS = ["Fruity", "Floral", "Chocolate", "Nutty", "Acidic", "Bitter", "Sweet", "Spicy", "Caramel"];

  // Initialize form with tasting data
  useEffect(() => {
    if (tasting && isOpen) {
      setCoffeeName(tasting.coffee_name || "");
      setBrand(tasting.brand || "");
      setRating(tasting.rating || 0);
      setReview(tasting.review || "");
      setSelectedTags(tasting.tags || []);
      setUserPhoto(tasting.image_url || null);
    }
  }, [tasting, isOpen]);

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
      const modRes = await fetch('/api/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: textToModerate, 
          type: 'review',
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

      // 2. Update Supabase
      const { error: updateError } = await supabase
        .from('tastings')
        .update({
          coffee_name: coffeeName,
          brand: brand,
          rating: rating,
          tags: selectedTags,
          review: review,
          image_url: userPhoto,
        })
        .eq('id', tasting.id);

      if (updateError) throw updateError;

      showPoints(5, "Editor ! Your tasting has been updated.");
      onUpdate();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to update your review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Drawer.Content className="bg-stone-50 flex flex-col rounded-t-[2.5rem] h-[92%] mt-24 fixed bottom-0 left-0 right-0 z-50 outline-none">
          <div className="p-4 bg-white rounded-t-[2.5rem] flex-1 overflow-y-auto">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-stone-200 mb-6" />
            
            <div className="flex justify-between items-center mb-6 px-2">
              <Drawer.Title className="text-xl font-black text-stone-800 uppercase tracking-tight">
                Modifier ma dégustation
              </Drawer.Title>
              <button onClick={onClose} className="p-2 bg-stone-100 rounded-full text-stone-400 hover:text-stone-600">
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="mx-2 p-3 mb-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6 px-2 pb-10">
              
              {/* Photo Area */}
              <div className="flex flex-col items-center gap-3">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                />
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-40 bg-stone-100 rounded-3xl border-2 border-dashed border-stone-300 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group hover:border-[var(--color-primary)] transition-colors"
                >
                  {userPhoto ? (
                    <img src={userPhoto} alt="Your coffee" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <ImagePlus size={32} className="mb-2" />
                      <span className="font-semibold text-sm">Add a photo</span>
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full">
                    <Camera size={14} />
                  </div>
                </div>
              </div>

              {/* Fields */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest pl-1">Nom du café</label>
                  <input 
                    type="text" 
                    value={coffeeName}
                    onChange={(e) => setCoffeeName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest pl-1">Marque / Torréfacteur</label>
                  <input 
                    type="text" 
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm"
                  />
                </div>
              </div>

              {/* Rating */}
              <div className="flex flex-col items-center gap-2 py-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Note</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-transform active:scale-90"
                    >
                      <Star 
                        size={36} 
                        className={star <= rating ? "fill-amber-400 text-amber-400" : "text-stone-200"} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-end pl-1 pr-1">
                   <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Profil aromatique</label>
                   <span className="text-[10px] text-stone-400 font-bold">MAX 3</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ALL_TAGS.map(tag => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                          isSelected 
                            ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-md scale-105" 
                            : "bg-white border-stone-200 text-stone-500 hover:border-stone-300"
                        }`}
                      >
                        {tag}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Review */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-widest pl-1">Votre avis</label>
                <textarea 
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm min-h-[100px] resize-none"
                />
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-[var(--color-primary)] text-white font-black uppercase tracking-widest py-4 rounded-2xl shadow-lg hover:opacity-90 transition-all disabled:opacity-70 flex items-center justify-center h-14"
              >
                {isSubmitting ? (
                   <Loader2 className="animate-spin" size={20} />
                ) : (
                   "Enregistrer"
                )}
              </button>

            </form>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
