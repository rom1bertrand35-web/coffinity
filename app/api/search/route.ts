import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json({ products: [] });
  }

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() {},
        },
      }
    );

    // 1. Recherche dans notre base "Premium"
    const cleanQuery = query.replace(/[']/g, '%');
    
    // On cherche d'abord les correspondances exactes sur la marque pour les mettre en haut
    const { data: dbCoffees, error: dbError } = await supabase
      .from('coffees')
      .select('name, brand, image_url, id, url')
      .or(`name.ilike.%${cleanQuery}%,brand.ilike.%${cleanQuery}%`)
      .order('brand', { ascending: true }) // Petit hack pour grouper
      .limit(20);

    if (!dbError && dbCoffees && dbCoffees.length >= 10) {
      const formattedProducts = dbCoffees.map(c => ({
        id: c.id,
        name: c.name,
        brand: c.brand || '',
        image_url: c.image_url || '',
        url: c.url || '',
        source: 'premium'
      }));
      return NextResponse.json({ products: formattedProducts });
    }

    // 2. FALLBACK : OpenFoodFacts (seulement si on a peu de résultats premium)
    const searchUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&tagtype_0=categories&tag_contains_0=contains&tag_0=coffee&search_simple=1&action=process&json=1&page_size=20&fields=code,product_name,brands,image_url,categories`;
    
    const response = await fetch(searchUrl, {
      next: { revalidate: 3600 } 
    });
    
    if (!response.ok) {
       throw new Error(`OFF API responded with ${response.status}`);
    }
    
    const data = await response.json();
    const offProducts = (data.products || [])
      .filter((p: any) => {
         if (!p.product_name) return false;
         const cats = (p.categories || "").toLowerCase();
         const name = p.product_name.toLowerCase();
         return cats.includes("coffee") || cats.includes("café") || cats.includes("cafes") || name.includes("coffee") || name.includes("café") || name.includes("cafe");
      })
      .map((p: any) => ({
        id: p.code,
        name: p.product_name,
        brand: p.brands ? p.brands.split(',')[0] : 'Inconnu', 
        image_url: p.image_url || '',
        source: 'off'
      }));

    // Fusionner les résultats Premium existants avec les résultats OFF
    const existingPremium = dbCoffees?.map(c => ({
      id: c.id,
      name: c.name,
      brand: c.brand || '',
      image_url: c.image_url || '',
      url: c.url || '',
      source: 'premium'
    })) || [];

    return NextResponse.json({ products: [...existingPremium, ...offProducts].slice(0, 20) });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ products: [], error: 'Search failed' }, { status: 500 });
  }
}
