"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, ScanLine, User } from "lucide-react";
import { hapticFeedback } from "@/utils/haptics";

export default function NavigationBar() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-6 px-4 pointer-events-none">
      <nav className="w-full max-w-md bg-white/80 dark:bg-stone-900/80 backdrop-blur-lg border border-[var(--color-border)] rounded-[2rem] px-6 py-4 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.08)] pointer-events-auto">
        <NavItem href="/" icon={<Home size={24} />} isActive={pathname === "/"} label="Feed" onClick={() => hapticFeedback(5)} />
        <NavItem href="/discover" icon={<Compass size={24} />} isActive={pathname === "/discover"} label="Discover" onClick={() => hapticFeedback(5)} />
        
        {/* Scan Button (Prominent) */}
        <Link 
          href="/scan" 
          onClick={() => hapticFeedback([10, 50, 10])}
          className="relative -top-6 bg-[var(--color-primary)] text-white p-4 rounded-full shadow-[0_8px_20px_rgb(64,53,40,0.4)] flex items-center justify-center hover:scale-105 transition-transform"
        >
          <ScanLine size={32} />
        </Link>
        
        <NavItem href="/profile" icon={<User size={24} />} isActive={pathname === "/profile"} label="Profile" onClick={() => hapticFeedback(5)} />
      </nav>
    </div>
  );
}

function NavItem({ href, icon, isActive, label, onClick }: { href: string; icon: React.ReactNode; isActive: boolean; label: string; onClick?: () => void }) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-colors ${isActive ? "text-[var(--color-primary)]" : "text-gray-400 hover:text-gray-600"}`}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}
