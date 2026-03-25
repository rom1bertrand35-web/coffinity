"use client";

import { useState } from "react";
import { MoreHorizontal, Edit2, Trash2, X, AlertCircle, Loader2 } from "lucide-react";
import { Drawer } from "vaul";
import { supabase } from "@/lib/supabase";
import EditTastingSheet from "./EditTastingSheet";
import { hapticFeedback } from "@/utils/haptics";

interface TastingActionsProps {
  tasting: any;
  onUpdate: () => void;
  onDelete: (id: number) => void;
}

export default function TastingActions({ tasting, onUpdate, onDelete }: TastingActionsProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette dégustation ? Cette action est irréversible.")) {
      return;
    }

    setIsDeleting(true);
    hapticFeedback([20, 50, 20]);
    
    try {
      const { error } = await supabase
        .from('tastings')
        .delete()
        .eq('id', tasting.id);

      if (error) throw error;

      onDelete(tasting.id);
      setIsMenuOpen(false);
    } catch (err) {
      console.error("Erreur suppression:", err);
      alert("Impossible de supprimer la dégustation.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => {
          setIsMenuOpen(true);
          hapticFeedback(5);
        }}
        className="text-stone-400 hover:text-stone-600 transition-colors p-1"
      >
        <MoreHorizontal size={20} />
      </button>

      {/* Menu d'actions Bottom Sheet */}
      <Drawer.Root open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <Drawer.Content className="bg-white flex flex-col rounded-t-[2rem] fixed bottom-0 left-0 right-0 z-50 outline-none">
            <div className="p-4 bg-white rounded-t-[2rem] border-b border-stone-100">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-stone-200 mb-6" />
              
              <div className="flex flex-col gap-2 pb-8">
                <button 
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsEditOpen(true);
                    hapticFeedback(10);
                  }}
                  className="flex items-center gap-4 w-full p-4 hover:bg-stone-50 rounded-2xl transition-colors text-stone-700 font-bold"
                >
                  <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center">
                    <Edit2 size={20} className="text-stone-600" />
                  </div>
                  Modifier la dégustation
                </button>

                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-4 w-full p-4 hover:bg-red-50 rounded-2xl transition-colors text-red-600 font-bold"
                >
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                    {isDeleting ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
                  </div>
                  Supprimer définitivement
                </button>

                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-4 w-full p-4 hover:bg-stone-50 rounded-2xl transition-colors text-stone-400 font-bold mt-2"
                >
                  <div className="w-10 h-10 bg-stone-50 rounded-xl flex items-center justify-center">
                    <X size={20} />
                  </div>
                  Annuler
                </button>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* Sheet de Modification */}
      <EditTastingSheet 
        tasting={tasting}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onUpdate={onUpdate}
      />
    </>
  );
}
