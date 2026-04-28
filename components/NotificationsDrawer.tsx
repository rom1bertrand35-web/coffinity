"use client";

import { useState, useEffect } from "react";
import { Drawer } from "vaul";
import { Bell, Heart, UserPlus, MessageSquare, Clock, Coffee } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import Image from "next/image";
import Link from "next/link";

interface Notification {
  id: string;
  type: 'like' | 'follow' | 'comment';
  is_read: boolean;
  created_at: string;
  actor: {
    username: string;
    avatar_url: string;
  };
  tasting_id?: number;
}

export default function NotificationsDrawer() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
    
    // Temps réel : Écouter les nouvelles notifications
    const channel = supabase
      .channel("realtime_notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("notifications")
      .select(`
        *,
        actor:actor_id (username, avatar_url)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (data) {
      setNotifications(data as any);
      setUnreadCount(data.filter(n => !n.is_read).length);
    }
  };

  const markAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
    
    setUnreadCount(0);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="w-4 h-4 text-red-500 fill-red-500" />;
      case 'follow': return <UserPlus className="w-4 h-4 text-blue-500" />;
      case 'comment': return <MessageSquare className="w-4 h-4 text-emerald-500" />;
      default: return <Bell className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (open) markAsRead();
    }}>
      <Drawer.Trigger asChild>
        <button className="relative p-2 rounded-full hover:bg-black/5 transition-colors">
          <Bell className="w-6 h-6 text-[#1A0F0A]" strokeWidth={1.5} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B44222] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-[#B44222] text-[10px] text-white items-center justify-center font-bold">
                {unreadCount}
              </span>
            </span>
          )}
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Drawer.Content className="bg-[#EBE2D4] flex flex-col rounded-t-[2rem] h-[80dvh] fixed bottom-0 left-0 right-0 z-50 border-t-4 border-[#1A0F0A]">
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[#1A0F0A]/20 my-4" />
          
          <div className="px-6 pb-4 border-b border-[#1A0F0A]/10">
            <h2 className="text-2xl font-serif font-bold text-[#1A0F0A]">Notifications</h2>
            <p className="text-sm text-[#1A0F0A]/60 font-sans uppercase tracking-widest">Activité de la tribu</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40">
                <Coffee className="w-16 h-16" strokeWidth={1} />
                <p className="font-serif italic text-lg text-[#1A0F0A]">Rien à signaler pour le moment...</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-4 rounded-2xl border-2 border-[#1A0F0A] bg-white transition-all shadow-[4px_4px_0px_0px_rgba(26,15,10,1)] ${
                    !notification.is_read ? 'translate-x-1 -translate-y-1 shadow-[6px_6px_0px_0px_rgba(180,66,34,1)]' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#1A0F0A] flex-shrink-0 bg-[#EBE2D4]">
                      {notification.actor?.avatar_url ? (
                        <Image 
                          src={notification.actor.avatar_url} 
                          alt={notification.actor.username}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Coffee className="w-6 h-6 opacity-20" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getIcon(notification.type)}
                        <span className="text-xs font-sans uppercase font-bold tracking-tighter opacity-50">
                          {notification.type}
                        </span>
                      </div>
                      
                      <p className="text-[#1A0F0A] text-sm leading-snug">
                        <span className="font-bold underline decoration-[#B44222] decoration-2">@{notification.actor?.username || "Barista"}</span>
                        {notification.type === 'like' && " a aimé votre dégustation."}
                        {notification.type === 'follow' && " a commencé à vous suivre."}
                        {notification.type === 'comment' && " a commenté votre cru."}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-2 opacity-40">
                        <Clock className="w-3 h-3" />
                        <span className="text-[10px] font-sans">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: fr })}
                        </span>
                      </div>
                    </div>

                    {notification.tasting_id && (
                       <Link 
                        href={`/tasting/${notification.tasting_id}`}
                        onClick={() => setIsOpen(false)}
                        className="w-12 h-12 rounded-xl bg-[#1A0F0A] flex items-center justify-center flex-shrink-0 hover:bg-[#B44222] transition-colors"
                      >
                        <Coffee className="w-5 h-5 text-white" />
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
