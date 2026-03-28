"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowLeft, Coffee, TrendingUp } from "lucide-react";

export default function SearchCoffeePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce the search to avoid spamming the API
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        searchCoffee(query);
      } else {
        setResults([]);
      }
    }, 400); // Réduit à 400ms pour plus de réactivité

    return () => clearTimeout(timer);
  }, [query]);

  const searchCoffee = async (searchTerm: string) => {
    setIsLoading(true);
    try {
      // On retire le biais "grains" qui peut être trop restrictif
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      
      setResults(data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectCoffee = (product: any) => {
    router.push(`/scan/rate?name=${encodeURIComponent(product.name)}&brand=${encodeURIComponent(product.brand || '')}&image=${encodeURIComponent(product.image_url || '')}`);
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col p-4 pb-24">
      <style dangerouslySetInnerHTML={{__html: `nav { display: none !important; }`}} />

      <header className="flex items-center gap-4 py-4 mb-2">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for coffee beans or brands..." 
            className="w-full bg-white border border-[var(--color-border)] rounded-full py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm shadow-sm"
          />
        </div>
      </header>

      {/* Zone de suggestions en direct */}
      <div className="flex-1 flex flex-col mt-2">
        {query.length < 2 && (
          <div className="text-center mt-10">
            <Coffee className="mx-auto text-gray-300 mb-3" size={48} />
            <h3 className="font-bold text-gray-700">Find your next brew</h3>
            <p className="text-sm text-gray-500 mt-1 px-4">Search our global database. We prioritize whole coffee beans.</p>
          </div>
        )}

        {isLoading && query.length >= 2 && (
          <div className="flex justify-center p-8 mt-4">
             <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {!isLoading && query.length >= 2 && results.length === 0 && (
          <div className="text-center p-8 text-gray-500 bg-white rounded-2xl border border-[var(--color-border)] mt-4">
            No coffee beans found for "{query}". <br/>
            <button 
              onClick={() => router.push('/scan/rate')}
              className="mt-4 text-[var(--color-primary)] font-bold hover:underline"
            >
              Add it manually
            </button>
          </div>
        )}

        {!isLoading && results.length > 0 && (
          <div className="flex flex-col gap-2 mt-2 bg-white rounded-3xl p-2 border border-[var(--color-border)] shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="px-3 py-2 flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
               <TrendingUp size={14} />
               Popular matches
            </div>
            {results.map((product, idx) => (
              <button 
                key={idx}
                onClick={() => selectCoffee(product)}
                className="flex items-center gap-4 bg-transparent p-3 rounded-2xl text-left hover:bg-gray-50 transition-colors"
              >
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-12 h-12 object-contain rounded-lg bg-stone-100 p-1" />
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Coffee size={20} className="text-gray-400" />
                  </div>
                )}
                <div className="flex-1 border-b border-gray-50 pb-2">
                  <h3 className="font-bold text-sm leading-tight text-gray-900 line-clamp-1">{product.name}</h3>
                  {product.brand && <p className="text-xs text-gray-500 mt-0.5">{product.brand}</p>}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
