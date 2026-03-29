"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, ScanLine, User } from "lucide-react";
import { hapticFeedback } from "@/utils/haptics";

export default function NavigationBar() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <nav className="w-full max-w-md bg-[var(--color-primary)] text-[var(--color-background)] rounded-t-[3rem] px-8 pt-6 pb-6 flex items-center justify-between pointer-events-auto relative">
        <NavItem href="/" icon={<Home size={26} strokeWidth={1.5} />} isActive={pathname === "/"} label="Feed" onClick={() => hapticFeedback(5)} />
        <NavItem href="/discover" icon={<Compass size={26} strokeWidth={1.5} />} isActive={pathname === "/discover"} label="Discover" onClick={() => hapticFeedback(5)} />
        
        {/* Scan Button (Botanical Square style) */}
        <Link 
          href="/scan" 
          onClick={() => hapticFeedback([10, 50, 10])}
          className="relative -top-6 bg-[var(--color-background)] text-[var(--color-primary)] p-4 rounded-[1.2rem] flex items-center justify-center hover:scale-105 transition-all duration-300 group border-2 border-transparent hover:border-[var(--color-accent)]"
        >
          {/* Petits arcs de cercle décoratifs évoquant l'image de la flèche */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-1 border-t border-[var(--color-background)] rounded-t-full opacity-50"></div>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-1 border-b border-[var(--color-background)] rounded-b-full opacity-50"></div>
          <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-1 h-6 border-l border-[var(--color-background)] rounded-l-full opacity-50"></div>
          <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-1 h-6 border-r border-[var(--color-background)] rounded-r-full opacity-50"></div>
          
          <ScanLine size={28} strokeWidth={1.5} className="group-hover:rotate-12 transition-transform duration-300" />
        </Link>
        
        <NavItem href="/profile" icon={<User size={26} strokeWidth={1.5} />} isActive={pathname === "/profile"} label="Profile" onClick={() => hapticFeedback(5)} />
      </nav>
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
      <span className="text-[10px] uppercase tracking-widest font-bold">{label}</span>
    </Link>
  );
}
