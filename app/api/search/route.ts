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
    
    const { data: dbCoffees, error: dbError } = await supabase
      .from('coffees')
      .select('name, brand, image_url, id, url')
      .or(`name.ilike.%${cleanQuery}%,brand.ilike.%${cleanQuery}%`)
      .order('brand', { ascending: true })
      .limit(20);

    let allProducts = [];

    if (!dbError && dbCoffees && dbCoffees.length >= 10) {
      allProducts = dbCoffees.map(c => ({
        id: c.id,
        name: c.name,
        brand: c.brand || '',
        image_url: c.image_url || '',
        url: c.url || '',
        source: 'premium'
      }));
    } else {
      // 2. FALLBACK : OpenFoodFacts
      const searchUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&tagtype_0=categories&tag_contains_0=contains&tag_0=coffee&search_simple=1&action=process&json=1&page_size=20&fields=code,product_name,brands,image_url,categories`;
      
      const response = await fetch(searchUrl, { next: { revalidate: 3600 } });
      const data = await response.json();
      
      const offProducts = (data.products || [])
        .filter((p: any) => {
           if (!p.product_name) return false;
           const name = p.product_name.toLowerCase();
           return name.includes("coffee") || name.includes("café") || name.includes("cafe");
        })
        .map((p: any) => ({
          id: p.code,
          name: p.product_name,
          brand: p.brands ? p.brands.split(',')[0] : 'Inconnu', 
          image_url: p.image_url || '',
          source: 'off'
        }));

      const existingPremium = dbCoffees?.map(c => ({
        id: c.id,
        name: c.name,
        brand: c.brand || '',
        image_url: c.image_url || '',
        url: c.url || '',
        source: 'premium'
      })) || [];

      allProducts = [...existingPremium, ...offProducts].slice(0, 20);
    }

    // 3. ENRICHISSEMENT : Note moyenne et derniers commentaires
    // On boucle sur chaque produit pour chercher ses stats dans 'tastings'
    const enrichedProducts = await Promise.all(allProducts.map(async (product) => {
      const { data: statsData } = await supabase
        .from('tastings')
        .select('rating, review, profiles(username, avatar_config)')
        .ilike('coffee_name', `%${product.name}%`)
        .order('created_at', { ascending: false });

      if (statsData && statsData.length > 0) {
        const avgRating = statsData.reduce((acc, curr) => acc + curr.rating, 0) / statsData.length;
        const lastComments = statsData
          .filter(t => t.review) // Uniquement ceux avec un texte
          .slice(0, 5)
          .map(t => ({
            username: t.profiles?.username || 'Anonyme',
            text: t.review,
            rating: t.rating
          }));

        return {
          ...product,
          avg_rating: parseFloat(avgRating.toFixed(1)),
          reviews_count: statsData.length,
          last_comments: lastComments
        };
      }

      return {
        ...product,
        avg_rating: null,
        reviews_count: 0,
        last_comments: []
      };
    }));

    return NextResponse.json({ products: enrichedProducts });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ products: [], error: 'Search failed' }, { status: 500 });
  }
}
