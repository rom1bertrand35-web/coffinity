"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { Sparkles } from "lucide-react";

type PointsToast = {
  id: string;
  points: number;
  message: string;
};

const PointsContext = createContext({
  showPoints: (points: number, message: string) => {},
});

export const usePoints = () => useContext(PointsContext);

export function PointsProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<PointsToast[]>([]);

  const showPoints = (points: number, message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, points, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  };

  return (
    <PointsContext.Provider value={{ showPoints }}>
      {children}
      <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div 
            key={toast.id}
            className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-6 py-3 rounded-full shadow-lg border-2 border-[var(--color-accent)] animate-in fade-in slide-in-from-top-4 duration-500 fill-mode-forwards"
          >
            <Sparkles className="text-[var(--color-accent)]" size={20} />
            <span className="font-bold">+{toast.points} Points</span>
            <span className="text-xs opacity-80">{toast.message}</span>
          </div>
        ))}
      </div>
    </PointsContext.Provider>
  );
}
