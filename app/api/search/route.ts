import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const PAGE_SIZE = 10;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const page = parseInt(searchParams.get('page') || '1');

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

    // 0. Get user profile for personalization
    const { data: { user } } = await supabase.auth.getUser();
    let baristaType = null;
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('barista_type').eq('id', user.id).maybeSingle();
      baristaType = profile?.barista_type;
    }

    // 1. Construction de la requête Supabase
    let dbQuery = supabase
      .from('coffees')
      .select('name, brand, image_url, id, url, category', { count: 'exact' });

    // IMPORTANT: On ne veut QUE des cafés avec photo
    dbQuery = dbQuery.not('image_url', 'is', null).neq('image_url', '');

    // Filtrage par catégorie
    if (category && category !== 'All') {
      dbQuery = dbQuery.eq('category', category);
    }

    // Filtrage par texte
    if (query && query.length >= 2 && query.toLowerCase() !== 'café' && query.toLowerCase() !== 'coffee') {
      const cleanQuery = query.replace(/[']/g, '%');
      dbQuery = dbQuery.or(`name.ilike.%${cleanQuery}%,brand.ilike.%${cleanQuery}%`);
      dbQuery = dbQuery.order('brand', { ascending: true });
    } else {
      // Personnalisation : On boost les catégories qui matchent le type de barista
      if (baristaType === 'espresso_purist') {
        dbQuery = dbQuery.order('category', { ascending: true }); // Boost 'Grains'
      } else if (baristaType === 'capsule_explorer') {
        dbQuery = dbQuery.order('category', { ascending: false }); // Boost 'Capsules'
      } else {
        dbQuery = dbQuery.order('created_at', { ascending: false });
      }
    }

    // Pagination
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    
    const { data: dbCoffees, error: dbError, count } = await dbQuery.range(from, to);

    let premiumProducts = dbCoffees?.map(c => ({
      id: c.id,
      name: c.name,
      brand: c.brand || '',
      image_url: c.image_url || '',
      url: c.url || '',
      category: c.category,
      source: 'premium'
    })) || [];

    // 2. FALLBACK OpenFoodFacts
    let allProducts = [...premiumProducts];
    
    if (allProducts.length < PAGE_SIZE && page === 1 && query.length >= 2) {
      try {
        const offUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&tagtype_0=categories&tag_contains_0=contains&tag_0=coffee&search_simple=1&action=process&json=1&page_size=20&fields=code,product_name,brands,image_url,categories`;
        const response = await fetch(offUrl);
        const data = await response.json();
        
        const offProducts = (data.products || [])
          .filter((p: any) => {
             if (!p.product_name || !p.image_url) return false;
             const name = p.product_name.toLowerCase();
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

        allProducts = [...allProducts, ...offProducts].slice(0, PAGE_SIZE);
      } catch (e) {}
    }

    // 3. ENRICHISSEMENT
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

        return { ...product, avg_rating: parseFloat(avgRating.toFixed(1)), reviews_count: statsData.length, last_comments: lastComments };
      }
      return { ...product, avg_rating: null, reviews_count: 0, last_comments: [] };
    }));

    return NextResponse.json({ 
      products: enrichedProducts,
      hasMore: (count || 0) > to
    });

  } catch (error) {
    return NextResponse.json({ products: [], error: 'Search failed' }, { status: 500 });
  }
}
