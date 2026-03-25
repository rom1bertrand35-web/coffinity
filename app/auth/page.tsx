"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Coffee, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { loginWithServerAction } from "./actions";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        // --- CONNEXION via SERVER ACTION ---
        // Cela force le cookie à être écrit par le serveur, ce qui est beaucoup
        // plus fiable sur mobile en développement local (http://192.168.x.x)
        const result = await loginWithServerAction(email, password);
        
        if (!result.success) {
          setError(result.error || "Échec de la connexion. Veuillez vérifier vos identifiants.");
        } else {
          console.log("Login successful via server action!");
          // Redirection si succès
          router.push("/");
          router.refresh();
        }
        
      } else {
        // --- INSCRIPTION (Reste côté client pour l'instant) ---
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username,
            }
          }
        });
        
        if (error) throw error;
        
        if (data.user && data.user.identities && data.user.identities.length === 0) {
           setError("Cet email est déjà utilisé.");
        } else {
           setMessage("Inscription réussie ! Vous pouvez maintenant vous connecter.");
           setIsLogin(true); // Bascule sur la vue login
        }
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de l'authentification.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col items-center justify-center p-6 pb-24">
      {/* Cacher la barre de navigation sur cette page via CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        nav { display: none !important; }
      `}} />

      <div className="w-full max-w-sm flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-500">
        
        <div className="w-20 h-20 bg-[var(--color-primary)] rounded-full flex items-center justify-center mb-6 shadow-lg shadow-[var(--color-primary)]/20">
          <Coffee size={40} className="text-white" />
        </div>
        
        <h1 className="text-4xl font-bold text-[var(--color-primary)] mb-2 tracking-tight">Coffinity</h1>
        <p className="text-gray-500 text-center mb-6">
          {isLogin ? "Welcome back, brewer." : "Join the coffee lovers community."}
        </p>

        {error && (
          <div className="w-full p-3 mb-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl">
            {error}
          </div>
        )}
        
        {message && (
          <div className="w-full p-3 mb-4 text-sm text-green-600 bg-green-50 border border-green-200 rounded-xl">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          {!isLogin && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 pl-1">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="coffeelover99" 
                className="w-full bg-white border border-[var(--color-border)] rounded-2xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm shadow-sm transition-all"
                required={!isLogin}
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 pl-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hello@coffinity.app" 
              className="w-full bg-white border border-[var(--color-border)] rounded-2xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm shadow-sm transition-all"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5 mb-2 relative">
            <div className="flex justify-between items-center pl-1 pr-1">
              <label className="text-sm font-medium text-gray-700">Password</label>
              {isLogin && (
                <button type="button" className="text-xs text-[var(--color-accent)] font-semibold hover:underline">
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-white border border-[var(--color-border)] rounded-2xl py-4 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm shadow-sm transition-all"
                required
                minLength={6}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[var(--color-primary)] text-white font-bold py-4 rounded-2xl shadow-[0_8px_20px_rgb(64,53,40,0.2)] hover:scale-[1.02] transition-transform mt-2 disabled:opacity-70 disabled:hover:scale-100 flex justify-center items-center h-14"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              isLogin ? "Sign In" : "Create Account"
            )}
          </button>
        </form>

        <div className="mt-8 text-sm text-gray-500">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setMessage(null);
            }} 
            className="ml-2 font-bold text-[var(--color-accent)] hover:underline underline-offset-4"
          >
            {isLogin ? "Sign Up" : "Log In"}
          </button>
        </div>

      </div>
    </div>
  );
}
