"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, ScanLine, User, Bell } from "lucide-react";
import { hapticFeedback } from "@/utils/haptics";
import NotificationsSheet from "./NotificationsSheet";
import { supabase } from "@/lib/supabase";

export default function NavigationBar() {
  const pathname = usePathname();
  const [isNotifsOpen, setIsNotifsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        fetchUnreadCount(user.id);
        
        // Subscribe to new notifications
        const channel = supabase
          .channel('schema-db-changes')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${user.id}`
            },
            () => {
              fetchUnreadCount(user.id);
              hapticFeedback([10, 30, 10]);
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    }
    getUser();
  }, []);

  const fetchUnreadCount = async (uid: string) => {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', uid)
      .eq('is_read', false);
    
    setUnreadCount(count || 0);
  };

  // Hide on certain pages
  if (pathname === "/profile/avatar") return null;

  const isDiscover = pathname === "/discover";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <nav className={`w-full max-w-md bg-[var(--color-primary)] text-[var(--color-background)] rounded-t-[3rem] px-6 flex items-center justify-between pointer-events-auto relative border-t-[4px] border-[#1A0F0A] shadow-[0_-8px_0_rgba(26,15,10,0.1)] transition-all duration-500 ${isDiscover ? 'pt-4 pb-4 scale-95 origin-bottom opacity-90' : 'pt-6 pb-6'}`}>
        <NavItem href="/" icon={<Home size={isDiscover ? 20 : 24} strokeWidth={2.5} />} isActive={pathname === "/"} label="Feed" onClick={() => hapticFeedback(5)} />
        <NavItem href="/discover" icon={<Compass size={isDiscover ? 20 : 24} strokeWidth={2.5} />} isActive={pathname === "/discover"} label="Explorer" onClick={() => hapticFeedback(5)} />
        
        {/* Scan Button */}
        <Link 
          href="/scan" 
          onClick={() => hapticFeedback([10, 50, 10])}
          className={`relative bg-[var(--color-background)] text-[var(--color-primary)] rounded-[1.2rem] flex items-center justify-center hover:scale-105 transition-all duration-300 group border-2 border-transparent hover:border-[var(--color-accent)] shadow-xl ${isDiscover ? '-top-3 p-3' : '-top-6 p-4'}`}
        >
          <ScanLine size={isDiscover ? 24 : 28} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform duration-300" />
        </Link>
        
        <button 
          onClick={() => { hapticFeedback(10); setIsNotifsOpen(true); setUnreadCount(0); }}
          className={`flex flex-col items-center gap-1.5 transition-all duration-300 hover:scale-105 relative ${isNotifsOpen ? "text-[var(--color-background)] opacity-100" : "text-[var(--color-background)] opacity-40 hover:opacity-80"}`}
        >
          <div className="relative">
            <Bell size={isDiscover ? 20 : 24} strokeWidth={2.5} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#B44222] text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-[var(--color-primary)] animate-in zoom-in duration-300">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <span className="text-[9px] uppercase tracking-widest font-bold">Alertes</span>
        </button>

        <NavItem href="/profile" icon={<User size={24} strokeWidth={2.5} />} isActive={pathname === "/profile"} label="Atelier" onClick={() => hapticFeedback(5)} />
      </nav>

      <NotificationsSheet 
        isOpen={isNotifsOpen} 
        onClose={() => setIsNotifsOpen(false)} 
        userId={userId} 
      />
    </div>
  );
}

function NavItem({ href, icon, isActive, label, onClick }: { href: string; icon: React.ReactNode; isActive: boolean; label: string; onClick?: () => void }) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 transition-all duration-300 hover:scale-105 ${isActive ? "text-[var(--color-background)] opacity-100" : "text-[var(--color-background)] opacity-40 hover:opacity-80"}`}
    >
      {icon}
      <span className="text-[9px] uppercase tracking-widest font-bold">{label}</span>
    </Link>
  );
}
