"use client";

import { ScanLine, Search, Hand, Camera, X, Zap, ZapOff, Coffee } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { BrowserMultiFormatReader, Exception } from '@zxing/library';

// Types pour OpenFoodFacts
interface OFFProduct {
  product_name?: string;
  brands?: string;
  image_url?: string;
  categories?: string;
  countries?: string;
}

export default function ScanPage() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [productData, setProductData] = useState<OFFProduct | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasTorch, setHasTorch] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Fonction pour chercher le produit sur OpenFoodFacts
  const fetchProductFromOFF = async (barcode: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
      const data = await response.json();

      if (data.status === 1 && data.product) {
        const product = data.product;
        // Vérification stricte : est-ce que c'est du café ?
        const categories = (product.categories || "").toLowerCase();
        const productName = (product.product_name || "").toLowerCase();
        const genericName = (product.generic_name || "").toLowerCase();
        
        const isCoffee = 
          categories.includes("coffee") || categories.includes("café") || categories.includes("cafes") ||
          productName.includes("coffee") || productName.includes("café") || productName.includes("cafe") ||
          genericName.includes("coffee") || genericName.includes("café");

        if (isCoffee) {
          setProductData(product);
        } else {
          setError("Oops! This doesn't look like coffee. Please scan a coffee product.");
        }
      } else {
        setError("Product not found. You can add it manually if you are sure it's coffee.");
      }
    } catch (err) {
      console.error("Erreur API OFF:", err);
      setError("Connection error to the database.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;

    try {
      const newTorchState = !isTorchOn;
      await track.applyConstraints({
        advanced: [{ torch: newTorchState } as any]
      });
      setIsTorchOn(newTorchState);
    } catch (err) {
      console.error("Failed to toggle torch:", err);
    }
  };

  // Gestion du scanner de code-barres
  const startScanning = useCallback(async () => {
    setIsScanning(true);
    setScannedCode(null);
    setProductData(null);
    setError(null);
    setHasTorch(false);
    setIsTorchOn(false);
    
    if (!codeReaderRef.current) {
      codeReaderRef.current = new BrowserMultiFormatReader();
    }

    try {
      // Demander la permission et récupérer le flux explicitement pour la torche
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      streamRef.current = stream;

      // Vérifier si la torche est supportée
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as any;
      if (capabilities && capabilities.torch) {
        setHasTorch(true);
      }

      if (videoRef.current) {
        // zxing peut prendre un flux ou un deviceId
        codeReaderRef.current.decodeFromStream(
          stream,
          videoRef.current,
          (result, err) => {
            if (result) {
              const barcode = result.getText();
              setScannedCode(barcode);
              
              if (typeof window !== 'undefined' && 'vibrate' in navigator) {
                navigator.vibrate(100);
              }
              const audio = new Audio('/scan-sound.mp3');
              audio.play().catch(() => {});

              stopScanning();
              fetchProductFromOFF(barcode);
            }
            if (err && !(err instanceof Exception)) {
              // On ignore les exceptions de "non-détection"
            }
          }
        );
      }
    } catch (err: any) {
      console.error("Scan Error:", err);
      if (err.name === 'NotAllowedError') {
        setError("Camera permission denied. Please allow camera access in your settings.");
      } else {
        setError("Impossible d'accéder à la caméra. Vérifiez que vous êtes en HTTPS.");
      }
      setIsScanning(false);
    }
  }, []);

  const stopScanning = useCallback(() => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
    setIsTorchOn(false);
  }, []);

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);


  return (
    <div className="p-4 pt-10 min-h-screen flex flex-col bg-[var(--color-primary)] text-white">
      
      <header className="flex justify-between items-center mb-8 relative z-10">
         {isScanning ? (
           <button onClick={stopScanning} className="p-2 bg-white/20 rounded-full hover:bg-white/30 backdrop-blur-sm">
             <X size={24} />
           </button>
         ) : <div></div>}
         <h1 className="text-xl font-bold absolute left-1/2 -translate-x-1/2 uppercase tracking-widest">Scanner</h1>
         
         {isScanning && hasTorch && (
           <button onClick={toggleTorch} className={`p-2 rounded-full backdrop-blur-sm transition-colors ${isTorchOn ? 'bg-amber-400 text-stone-900' : 'bg-white/20'}`}>
             {isTorchOn ? <Zap size={24} /> : <ZapOff size={24} />}
           </button>
         )}
      </header>

      <div className="flex-1 flex flex-col items-center justify-center relative">
        
        {/* Zone Vidéo ou Résultat */}
        {isScanning ? (
          <div className="relative w-full max-w-sm aspect-[3/4] rounded-[3rem] overflow-hidden bg-black shadow-2xl mb-8 border-4 border-white/10">
            <video ref={videoRef} className="w-full h-full object-cover" />
            
            {/* Overlay de scan */}
            <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none">
              <div className="w-full h-full border-2 border-[var(--color-accent)]/50 relative">
                {/* Ligne animée */}
                <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-accent)] shadow-[0_0_15px_var(--color-accent)] animate-[scan_2s_ease-in-out_infinite]"></div>
              </div>
            </div>
            <p className="absolute bottom-6 left-0 right-0 text-center text-xs font-bold uppercase tracking-wider text-white/60">Alignez le code-barres</p>
          </div>
        ) : scannedCode ? (
          // Affichage du résultat
          <div className="w-full max-w-sm bg-white text-gray-900 rounded-[2.5rem] p-8 shadow-2xl mb-8 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4">
            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6">
              <ScanLine size={40} />
            </div>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Code détecté</p>
            <p className="text-lg font-black text-stone-800 mb-6">{scannedCode}</p>
            
            {isLoading ? (
              <div className="flex flex-col items-center gap-3 my-6">
                <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-bold text-stone-400 animate-pulse">Recherche en cours...</p>
              </div>
            ) : productData ? (
              <div className="w-full flex flex-col items-center text-center mt-2 border border-stone-100 rounded-[2rem] p-6 bg-stone-50">
                <div className="w-32 h-32 bg-white rounded-2xl p-2 shadow-sm mb-4 flex items-center justify-center">
                  {productData.image_url ? (
                    <img src={productData.image_url} alt={productData.product_name} className="max-h-full object-contain" />
                  ) : (
                    <Coffee className="text-stone-200" size={48} />
                  )}
                </div>
                <h2 className="font-black text-xl leading-tight mb-1 text-stone-800">{productData.product_name || "Café Inconnu"}</h2>
                <p className="text-[var(--color-accent)] text-xs font-black uppercase tracking-widest">{productData.brands || "Marque Inconnue"}</p>
                
                <button 
                  onClick={() => router.push(`/scan/rate?name=${encodeURIComponent(productData.product_name || '')}&brand=${encodeURIComponent(productData.brands || '')}&image=${encodeURIComponent(productData.image_url || '')}`)}
                  className="w-full mt-8 bg-[var(--color-primary)] text-white font-black uppercase tracking-widest py-4 rounded-2xl shadow-lg active:scale-95 transition-all"
                >
                  Noter ce café
                </button>
              </div>
            ) : error ? (
              <div className="text-center mt-2 w-full">
                <div className="p-4 bg-red-50 rounded-2xl border border-red-100 mb-6">
                  <p className="text-red-500 text-sm font-bold">{error}</p>
                </div>
                <button 
                  onClick={() => router.push('/scan/rate')}
                  className="w-full bg-stone-800 text-white font-black uppercase tracking-widest py-4 rounded-2xl shadow-lg active:scale-95 transition-all"
                >
                  Saisir manuellement
                </button>
              </div>
            ) : null}
            
            <button onClick={() => setScannedCode(null)} className="mt-6 text-xs font-bold text-stone-400 hover:text-stone-600 uppercase tracking-widest">
              Scanner un autre code
            </button>
          </div>
        ) : (
          // État initial (Bouton pour lancer la caméra)
          <div className="text-center mb-12 animate-in fade-in zoom-in-95">
            <button 
              onClick={startScanning}
              className="w-40 h-40 bg-[var(--color-accent)] rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(204,85,0,0.4)] hover:scale-105 active:scale-90 transition-all mb-8 mx-auto group"
            >
              <Camera size={56} className="text-white group-hover:rotate-12 transition-transform" />
            </button>
            <h2 className="text-3xl font-black mb-3 uppercase tracking-tight">Prêt à goûter ?</h2>
            <p className="text-white/60 font-medium">Scannez le code-barres de votre sachet</p>
          </div>
        )}

      </div>

      {/* Boutons alternatifs (seulement si on ne scanne pas) */}
      {!isScanning && !scannedCode && (
        <div className="flex flex-col w-full gap-4 pb-10 px-4">
          <button 
            onClick={() => router.push('/scan/search')}
            className="w-full bg-white text-[var(--color-primary)] font-black uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"
          >
            <Search size={20} />
            Chercher par nom
          </button>
          <button 
            onClick={() => router.push('/scan/rate')}
            className="w-full bg-transparent border-2 border-white/20 text-white/80 font-bold uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/5 active:scale-95 transition-all"
          >
            <Hand size={20} />
            Saisie manuelle
          </button>
        </div>
      )}

      {/* Ajout d'une animation CSS inline pour la ligne de scan */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
      `}} />
    </div>
  );
}
