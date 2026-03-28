"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, ScanLine, User } from "lucide-react";
import { hapticFeedback } from "@/utils/haptics";

export default function NavigationBar() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-6 px-4 pointer-events-none">
      <nav className="w-full max-w-md bg-white/50 dark:bg-stone-900/50 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-[2.5rem] px-6 py-4 flex items-center justify-between shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] pointer-events-auto transition-colors duration-500">
        <NavItem href="/" icon={<Home size={24} />} isActive={pathname === "/"} label="Feed" onClick={() => hapticFeedback(5)} />
        <NavItem href="/discover" icon={<Compass size={24} />} isActive={pathname === "/discover"} label="Discover" onClick={() => hapticFeedback(5)} />
        
        {/* Scan Button (Prominent) */}
        <Link 
          href="/scan" 
          onClick={() => hapticFeedback([10, 50, 10])}
          className="relative -top-6 bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-accent)] text-white p-4 rounded-full shadow-[0_10px_30px_hsla(20,80%,50%,0.4)] dark:shadow-[0_10px_30px_hsla(30,70%,60%,0.3)] flex items-center justify-center hover:scale-110 transition-all duration-300 ring-4 ring-[var(--color-background)] group"
        >
          <ScanLine size={32} className="group-hover:rotate-12 transition-transform duration-300" />
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
      className={`flex flex-col items-center gap-1.5 transition-all duration-300 hover:scale-105 ${isActive ? "text-[var(--color-primary)] dark:text-[var(--color-dark-primary)]" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}
