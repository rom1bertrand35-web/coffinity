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
    // Initialiser Supabase pour chercher dans notre propre base
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() {}, // Mode lecture seule
        },
      }
    );

    // 1. Chercher dans notre table premium "coffees" (Grains de spécialité)
    // On nettoie la requête pour améliorer la recherche (ex: ignorer les apostrophes)
    const cleanQuery = query.replace(/[']/g, '%');
    
    const { data: dbCoffees, error: dbError } = await supabase
      .from('coffees')
      .select('name, brand, image_url, id')
      .or(`name.ilike.%${cleanQuery}%,brand.ilike.%${cleanQuery}%`)
      .limit(15);

    if (!dbError && dbCoffees && dbCoffees.length > 0) {
      // Si on trouve dans notre base, on renvoie tout de suite ces résultats haute qualité
      const formattedProducts = dbCoffees.map(c => ({
        id: c.id,
        name: c.name,
        brand: c.brand || '',
        image: c.image_url || '',
      }));
      return NextResponse.json({ products: formattedProducts });
    }

    // 2. FALLBACK : Si rien n'est trouvé dans notre base, on cherche sur OpenFoodFacts
    const searchUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&tagtype_0=categories&tag_contains_0=contains&tag_0=coffee&search_simple=1&action=process&json=1&page_size=15&fields=code,product_name,brands,image_url,categories`;
    
    const response = await fetch(searchUrl, {
      next: { revalidate: 3600 } 
    });
    
    if (!response.ok) {
       throw new Error(`OFF API responded with ${response.status}`);
    }
    
    const data = await response.json();

    if (data.products && data.products.length > 0) {
      const formattedProducts = data.products
        .filter((p: any) => {
           if (!p.product_name) return false;
           const cats = (p.categories || "").toLowerCase();
           const name = p.product_name.toLowerCase();
           return cats.includes("coffee") || cats.includes("café") || cats.includes("cafes") || name.includes("coffee") || name.includes("café") || name.includes("cafe");
        })
        .map((p: any) => ({
          id: p.code,
          name: p.product_name,
          brand: p.brands ? p.brands.split(',')[0] : '', 
          image: p.image_url || '',
        }));

      return NextResponse.json({ products: formattedProducts });
    }

    return NextResponse.json({ products: [] });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ products: [], error: 'Search failed' }, { status: 500 });
  }
}
