import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ArrowLeft, Star, Zap, Thermometer, Bean, Wind, Quote, Calendar, User, ShieldCheck } from "lucide-react";
import Link from "next/link";
import CoffeeAvatar from "@/components/CoffeeAvatar";

export default async function TastingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from('tastings')
    .select(`
      *,
      profiles:user_id (*)
    `)
    .eq('id', id)
    .single();

  if (error || !post) {
    notFound();
  }

  const CriteriaBar = ({ label, icon, value, color }: any) => (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-black text-[10px] uppercase tracking-widest text-[#1A0F0A]">{label}</span>
        </div>
        <span className="font-black text-xs text-[#1A0F0A]">{value}/5</span>
      </div>
      <div className="w-full h-4 bg-white border-2 border-[#1A0F0A] rounded-full overflow-hidden shadow-[2px_2px_0_#1A0F0A]">
        <div 
          className="h-full transition-all duration-1000 ease-out" 
          style={{ 
            width: `${(value / 5) * 100}%`,
            backgroundColor: color 
          }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#EBE2D4] pb-32 animate-in fade-in duration-700">
      {/* Header Mural */}
      <header className="bg-[#EBE2D4] border-b-4 border-[#1A0F0A] px-6 py-6 flex items-center gap-4 sticky top-0 z-40 shadow-[0_4px_0_rgba(26,15,10,0.1)]">
        <Link href="/" className="p-2 bg-white border-2 border-[#1A0F0A] rounded-full shadow-[2px_2px_0_#1A0F0A] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all">
          <ArrowLeft size={20} strokeWidth={3} />
        </Link>
        <h1 className="text-xl font-black text-[#1A0F0A] tracking-tighter uppercase font-serif italic truncate">Détails du Cru</h1>
      </header>

      <div className="max-w-md mx-auto p-6 space-y-8">
        
        {/* Main Card */}
        <div className="bg-white rounded-[2.5rem] border-4 border-[#1A0F0A] shadow-[8px_8px_0_#1A0F0A] overflow-hidden flex flex-col">
          
          {/* Hero Image */}
          <div className="w-full aspect-square relative bg-stone-100 border-b-4 border-[#1A0F0A]">
            {post.image_url ? (
              <img src={post.image_url} className="w-full h-full object-cover" alt={post.coffee_name} />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-12">
                <img src="/vintage_branch.png" className="opacity-20 mix-blend-multiply" alt="placeholder" />
              </div>
            )}
            {post.is_official && (
              <div className="absolute top-6 right-6 bg-[#B44222] text-white px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest border-2 border-[#1A0F0A] shadow-xl flex items-center gap-2">
                <ShieldCheck size={14} /> Officiel
              </div>
            )}
          </div>

          <div className="p-8 space-y-8">
            {/* Title & Brand */}
            <div className="text-center space-y-2">
              <p className="text-xs font-black text-[#B44222] uppercase tracking-[0.3em]">{post.brand || 'Artisan Inconnu'}</p>
              <h2 className="text-4xl font-serif font-black tracking-tighter italic leading-none">{post.coffee_name}</h2>
              <div className="flex justify-center gap-1.5 mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={24} className={i < post.rating ? "fill-[#B44222] text-[#1A0F0A]" : "text-stone-200 fill-stone-50"} strokeWidth={2.5} />
                ))}
              </div>
            </div>

            {/* Barista Specs (The 4 New Criteria) */}
            <div className="bg-[#EBE2D4]/30 p-6 rounded-[2rem] border-2 border-[#1A0F0A]/5 space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1A0F0A]/40 text-center mb-2">Profil du Barista</h3>
              <div className="grid grid-cols-1 gap-6">
                <CriteriaBar label="Intensité" icon={<Zap size={14} />} value={post.intensity || 3} color="#B44222" />
                <CriteriaBar label="Acidité" icon={<Thermometer size={14} />} value={post.acidity || 3} color="#3B82F6" />
                <CriteriaBar label="Corps" icon={<Bean size={14} />} value={post.body || 3} color="#78350F" />
                <CriteriaBar label="Arôme" icon={<Wind size={14} />} value={post.aroma || 3} color="#8B5CF6" />
              </div>
            </div>

            {/* Review Section */}
            {post.review && (
              <div className="relative pt-4">
                <Quote className="absolute -top-2 -left-2 text-[#B44222] opacity-20" size={40} />
                <p className="text-lg font-serif italic leading-relaxed text-[#1A0F0A] pl-8">
                  {post.review}
                </p>
              </div>
            )}

            {/* Author & Date */}
            <div className="pt-8 border-t-2 border-[#1A0F0A]/5 flex items-center justify-between">
              <Link href={`/profile/${post.user_id}`} className="flex items-center gap-4 group">
                <div className="w-14 h-14 rounded-full overflow-hidden group-hover:scale-105 transition-transform flex-shrink-0">
                  <CoffeeAvatar config={post.profiles?.avatar_config || {}} size={56} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase text-[#1A0F0A]/40 leading-none mb-1">Archivé par</p>
                  <p className="font-black text-[#1A0F0A] group-hover:underline text-lg uppercase tracking-tighter">{post.profiles?.username}</p>
                </div>
              </Link>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase text-[#1A0F0A]/40 leading-none mb-1">Le</p>
                <p className="font-bold text-[#1A0F0A] flex items-center gap-1.5 justify-end">
                  <Calendar size={14} />
                  {new Date(post.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button Bottom */}
        <Link 
          href="/"
          className="w-full bg-[#1A0F0A] text-[#EBE2D4] py-5 rounded-full font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:-translate-y-1 shadow-[0_8px_0_rgba(26,15,10,0.3)] transition-all active:translate-y-0 active:shadow-none"
        >
          Retour au Flux <ArrowLeft size={18} strokeWidth={3} />
        </Link>

      </div>
    </div>
  );
}
