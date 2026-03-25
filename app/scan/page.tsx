"use client";

import { ScanLine, Search, Hand, Camera, X } from "lucide-react";
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
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

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
        // On vérifie les catégories, le nom du produit, et d'autres mots-clés potentiels
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

  // Gestion du scanner de code-barres
  const startScanning = useCallback(async () => {
    setIsScanning(true);
    setScannedCode(null);
    setProductData(null);
    setError(null);
    
    if (!codeReaderRef.current) {
      codeReaderRef.current = new BrowserMultiFormatReader();
    }

    try {
      const videoInputDevices = await codeReaderRef.current.listVideoInputDevices();
      
      // Essayer de trouver la caméra arrière
      const backCamera = videoInputDevices.find(device => device.label.toLowerCase().includes('back') || device.label.toLowerCase().includes('rear'));
      const deviceId = backCamera ? backCamera.deviceId : videoInputDevices[0]?.deviceId;

      if (deviceId && videoRef.current) {
        codeReaderRef.current.decodeFromVideoDevice(
          deviceId, 
          videoRef.current, 
          (result, err) => {
            if (result) {
              // Code trouvé !
              const barcode = result.getText();
              setScannedCode(barcode);
              
              // Vibration et Son
              if (typeof window !== 'undefined' && 'vibrate' in navigator) {
                navigator.vibrate(100);
              }
              const audio = new Audio('/scan-sound.mp3');
              audio.play().catch(() => {}); // Échec silencieux si bloqué par navigateur

              stopScanning();
              fetchProductFromOFF(barcode);
            }
            if (err && !(err instanceof Exception)) {
              console.error(err);
            }
          }
        );
      } else {
        setError("Aucune caméra trouvée.");
        setIsScanning(false);
      }
    } catch (err) {
      console.error(err);
      setError("Impossible d'accéder à la caméra.");
      setIsScanning(false);
    }
  }, []);

  const stopScanning = useCallback(() => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    setIsScanning(false);
  }, []);

  // Nettoyage à la fermeture du composant
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
         <h1 className="text-xl font-bold absolute left-1/2 -translate-x-1/2">Scan</h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center relative">
        
        {/* Zone Vidéo ou Résultat */}
        {isScanning ? (
          <div className="relative w-full max-w-sm aspect-[3/4] rounded-3xl overflow-hidden bg-black shadow-2xl mb-8">
            <video ref={videoRef} className="w-full h-full object-cover" />
            
            {/* Overlay de scan */}
            <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none">
              <div className="w-full h-full border-2 border-[var(--color-accent)] relative">
                {/* Ligne animée */}
                <div className="absolute top-0 left-0 w-full h-0.5 bg-[var(--color-accent)] shadow-[0_0_10px_var(--color-accent)] animate-[scan_2s_ease-in-out_infinite]"></div>
              </div>
            </div>
            <p className="absolute bottom-4 left-0 right-0 text-center text-sm font-medium text-white/80">Align barcode within the frame</p>
          </div>
        ) : scannedCode ? (
          // Affichage du résultat
          <div className="w-full max-w-sm bg-white text-gray-900 rounded-[2rem] p-6 shadow-xl mb-8 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <ScanLine size={32} />
            </div>
            <p className="text-sm text-gray-500 mb-1">Code: {scannedCode}</p>
            
            {isLoading ? (
              <div className="flex flex-col items-center gap-2 my-6">
                <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-medium animate-pulse">Searching global database...</p>
              </div>
            ) : productData ? (
              <div className="w-full flex flex-col items-center text-center mt-2 border border-gray-100 rounded-xl p-4 bg-stone-50">
                {productData.image_url && (
                  <img src={productData.image_url} alt={productData.product_name} className="h-32 object-contain rounded-md mb-3" />
                )}
                <h2 className="font-bold text-lg leading-tight mb-1">{productData.product_name || "Unknown Coffee"}</h2>
                <p className="text-gray-600 text-sm font-medium">{productData.brands || "Unknown Brand"}</p>
                
                <button 
                  onClick={() => router.push(`/scan/rate?name=${encodeURIComponent(productData.product_name || '')}&brand=${encodeURIComponent(productData.brands || '')}&image=${encodeURIComponent(productData.image_url || '')}`)}
                  className="w-full mt-6 bg-[var(--color-accent)] text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity"
                >
                  Rate this coffee
                </button>
              </div>
            ) : error ? (
              <div className="text-center mt-2">
                <p className="text-red-500 text-sm mb-4 font-medium">{error}</p>
                <button 
                  onClick={() => router.push('/scan/rate')}
                  className="w-full bg-[var(--color-primary)] text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity"
                >
                  Add details manually
                </button>
              </div>
            ) : null}
            
            <button onClick={() => setScannedCode(null)} className="mt-4 text-sm text-gray-400 hover:text-gray-700 underline underline-offset-2">
              Scan another code
            </button>
          </div>
        ) : (
          // État initial (Bouton pour lancer la caméra)
          <div className="text-center mb-12 animate-in fade-in zoom-in-95">
            <button 
              onClick={startScanning}
              className="w-32 h-32 bg-[var(--color-accent)] rounded-full flex items-center justify-center shadow-[0_0_40px_rgb(204,85,0,0.4)] hover:scale-105 transition-all mb-6 mx-auto"
            >
              <Camera size={48} className="text-white" />
            </button>
            <h2 className="text-2xl font-bold mb-2">Ready to taste?</h2>
            <p className="text-white/70">Tap to scan your coffee bag</p>
          </div>
        )}

      </div>

      {/* Boutons alternatifs (seulement si on ne scanne pas) */}
      {!isScanning && !scannedCode && (
        <div className="flex flex-col w-full gap-3 pb-10">
          <button 
            onClick={() => router.push('/scan/search')}
            className="w-full bg-white/10 backdrop-blur-md text-white font-medium py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/20 transition-colors"
          >
            <Search size={18} />
            Search by name
          </button>
          <button 
            onClick={() => router.push('/scan/rate')}
            className="w-full bg-transparent border border-white/20 text-white/80 text-sm py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"
          >
            <Hand size={18} />
            Enter manually
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
