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
    let dbQuery = supabase
      .from('coffees')
      .select('name, brand, image_url, id, url');

    if (query.toLowerCase() === 'café' || query.toLowerCase() === 'coffee') {
      // Pour une recherche générique (accueil de l'onglet), on montre les plus récents
      dbQuery = dbQuery.order('created_at', { ascending: false });
    } else {
      const cleanQuery = query.replace(/[']/g, '%');
      dbQuery = dbQuery.or(`name.ilike.%${cleanQuery}%,brand.ilike.%${cleanQuery}%`)
                       .order('brand', { ascending: true });
    }
    
    const { data: dbCoffees, error: dbError } = await dbQuery.limit(50);

    let premiumProducts = dbCoffees?.map(c => ({
      id: c.id,
      name: c.name,
      brand: c.brand || '',
      image_url: c.image_url || '',
      url: c.url || '',
      source: 'premium'
    })) || [];

    let allProducts = [...premiumProducts];

    // 2. FALLBACK / COMPLÉMENT : OpenFoodFacts
    // On ne va chercher sur OFF que si on a moins de 50 résultats premium
    if (allProducts.length < 50) {
      try {
        const searchUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&tagtype_0=categories&tag_contains_0=contains&tag_0=coffee&search_simple=1&action=process&json=1&page_size=50&fields=code,product_name,brands,image_url,categories`;
        
        const response = await fetch(searchUrl, { next: { revalidate: 3600 } });
        const data = await response.json();
        
        const offProducts = (data.products || [])
          .filter((p: any) => {
             if (!p.product_name) return false;
             const name = p.product_name.toLowerCase();
             // S'assurer que ce n'est pas déjà dans nos résultats premium (via le nom ou la marque approximative)
             const isDuplicate = premiumProducts.some(pp => pp.name.toLowerCase() === p.product_name.toLowerCase());
             return !isDuplicate && (name.includes("coffee") || name.includes("café") || name.includes("cafe"));
          })
          .map((p: any) => ({
            id: p.code,
            name: p.product_name,
            brand: p.brands ? p.brands.split(',')[0] : 'Inconnu', 
            image_url: p.image_url || '',
            source: 'off'
          }));

        allProducts = [...allProducts, ...offProducts].slice(0, 50);
      } catch (offErr) {
        console.error("OpenFoodFacts search failed:", offErr);
      }
    }

    // 3. ENRICHISSEMENT : Note moyenne et derniers commentaires
    const enrichedProducts = await Promise.all(allProducts.map(async (product) => {
      const { data: statsData } = await supabase
        .from('tastings')
        .select('rating, review, profiles(username, avatar_config)')
        .ilike('coffee_name', `%${product.name}%`)
        .order('created_at', { ascending: false });

      if (statsData && statsData.length > 0) {
        const avgRating = statsData.reduce((acc, curr) => acc + curr.rating, 0) / statsData.length;
        const lastComments = statsData
          .filter(t => t.review)
          .slice(0, 5)
          .map(t => {
            const profile = Array.isArray(t.profiles) ? t.profiles[0] : t.profiles;
            return {
              username: profile?.username || 'Anonyme',
              text: t.review,
              rating: t.rating
            };
          });

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
