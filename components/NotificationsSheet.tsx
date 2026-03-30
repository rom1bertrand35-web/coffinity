"use client";

import { useState, useEffect } from "react";
import { Drawer } from "vaul";
import { Bell, X, Heart, UserPlus, MessageCircle, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import CoffeeAvatar from "@/components/CoffeeAvatar";
import { useRouter } from "next/navigation";
import { hapticFeedback } from "@/utils/haptics";

interface NotificationsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
}

export default function NotificationsSheet({ isOpen, onClose, userId }: NotificationsSheetProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isOpen && userId) {
      loadNotifications();
      markAllAsRead();
    }
  }, [isOpen, userId]);

  const loadNotifications = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("notifications")
      .select(`
        *,
        actor:actor_id (
          username,
          avatar_config
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30);

    if (!error && data) {
      setNotifications(data);
    }
    setIsLoading(false);
  };

  const markAllAsRead = async () => {
    if (!userId) return;
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);
  };

  const handleNotificationClick = (notif: any) => {
    hapticFeedback(5);
    onClose();
    if (notif.type === 'follow') {
      router.push(`/profile/${notif.actor_id}`);
    } else if (notif.tasting_id) {
      router.push(`/tasting/${notif.tasting_id}`);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart size={14} className="fill-red-500 text-red-500" />;
      case 'follow': return <UserPlus size={14} className="text-blue-500" />;
      case 'comment': return <MessageCircle size={14} className="text-[#B44222]" />;
      default: return <Bell size={14} />;
    }
  };

  const getMessage = (type: string) => {
    switch (type) {
      case 'like': return "a aimé ta dégustation";
      case 'follow': return "a commencé à te suivre";
      case 'comment': return "a commenté ton archive";
      default: return "t'a envoyé un signal";
    }
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-sm" />
        <Drawer.Content className="bg-[#EBE2D4] flex flex-col rounded-t-[3rem] h-[80%] fixed bottom-0 left-0 right-0 z-[100] outline-none border-t-4 border-[#1A0F0A]">
          <div className="p-6 text-[#1A0F0A] flex-1 flex flex-col overflow-hidden relative">
            <div className="mx-auto w-16 h-2 flex-shrink-0 rounded-full bg-[#1A0F0A] opacity-20 mb-8" />
            
            <div className="flex justify-between items-center mb-10 px-2">
              <Drawer.Title className="text-4xl font-serif text-[#1A0F0A] flex items-center gap-4 font-black italic tracking-tighter uppercase">
                <Bell size={32} strokeWidth={3} className="-rotate-12" /> Alertes
              </Drawer.Title>
              <button onClick={onClose} className="p-3 bg-[#1A0F0A] text-[#EBE2D4] rounded-full border-2 border-[#1A0F0A] shadow-[0_4px_0_rgba(0,0,0,0.2)]">
                <X size={20} strokeWidth={3} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-2 space-y-4 pb-8">
              {isLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#1A0F0A]/20" size={40} /></div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-24 bg-white/30 rounded-[2.5rem] border-3 border-dashed border-[#1A0F0A]/10">
                  <Bell className="mx-auto text-[#1A0F0A]/10 mb-4" size={60} />
                  <p className="font-extrabold text-[#1A0F0A] text-xl">Rien à signaler...</p>
                  <p className="text-xs font-bold opacity-40 uppercase tracking-widest mt-2">La tribu est calme pour l'instant</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <button 
                    key={notif.id} 
                    onClick={() => handleNotificationClick(notif)}
                    className={`w-full bg-white p-5 rounded-[2rem] border-3 flex items-center gap-4 text-left transition-all ${notif.is_read ? 'border-[#1A0F0A]/10 opacity-80' : 'border-[#1A0F0A] shadow-[0_6px_0_#1A0F0A] -translate-y-0.5'}`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#1A0F0A]">
                        <CoffeeAvatar config={notif.actor?.avatar_config || {}} size={48} noBackground />
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-white border-2 border-[#1A0F0A] p-1.5 rounded-full shadow-sm">
                        {getIcon(notif.type)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-[#1A0F0A] uppercase tracking-tighter truncate">
                        {notif.actor?.username || "Anonyme"}
                      </p>
                      <p className="text-[11px] font-bold text-[#1A0F0A]/60 leading-tight">
                        {getMessage(notif.type)}
                      </p>
                    </div>

                    <ArrowRight size={16} className="text-[#1A0F0A]/20" />
                  </button>
                ))
              )}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
