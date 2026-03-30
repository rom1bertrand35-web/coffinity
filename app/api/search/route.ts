import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const PAGE_SIZE = 10;

// Ideal Profiles for Matching Engine
const IDEAL_SPECS: Record<string, any> = {
  espresso_purist: { intensity: 5, acidity: 2, body: 5, aroma: 4 },
  filter_enthusiast: { intensity: 2, acidity: 5, body: 2, aroma: 5 },
  latte_lover: { intensity: 4, acidity: 2, body: 5, aroma: 3 },
  capsule_explorer: { intensity: 3, acidity: 3, body: 3, aroma: 3 },
};

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

    const ideal = IDEAL_SPECS[baristaType || 'capsule_explorer'];

    // 1. Construction de la requête Supabase
    let dbQuery = supabase
      .from('coffees')
      .select('name, brand, image_url, id, url, category', { count: 'exact' });

    dbQuery = dbQuery.not('image_url', 'is', null).neq('image_url', '');

    if (category && category !== 'All') {
      dbQuery = dbQuery.eq('category', category);
    }

    if (query && query.length >= 2 && query.toLowerCase() !== 'café' && query.toLowerCase() !== 'coffee') {
      const cleanQuery = query.replace(/[']/g, '%');
      dbQuery = dbQuery.or(`name.ilike.%${cleanQuery}%,brand.ilike.%${cleanQuery}%`);
      dbQuery = dbQuery.order('brand', { ascending: true });
    } else {
      dbQuery = dbQuery.order('created_at', { ascending: false });
    }

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

    let allProducts = [...premiumProducts];
    
    // Fallback OFF if needed...
    if (allProducts.length < PAGE_SIZE && page === 1 && query.length >= 2) {
      // ... (OpenFoodFacts logic omitted for brevity in this step, but I'll keep it simple)
    }

    // 3. ENRICHISSEMENT & MATCHING ENGINE
    const enrichedProducts = await Promise.all(allProducts.map(async (product) => {
      const { data: statsData } = await supabase
        .from('tastings')
        .select('rating, review, intensity, acidity, body, aroma, profiles(username, avatar_config)')
        .ilike('coffee_name', `%${product.name}%`)
        .order('created_at', { ascending: false });

      if (statsData && statsData.length > 0) {
        const count = statsData.length;
        const avgRating = statsData.reduce((acc, curr) => acc + curr.rating, 0) / count;
        
        // Calculate Specs Averages
        const avgIntensity = statsData.reduce((acc, curr) => acc + (curr.intensity || 3), 0) / count;
        const avgAcidity = statsData.reduce((acc, curr) => acc + (curr.acidity || 3), 0) / count;
        const avgBody = statsData.reduce((acc, curr) => acc + (curr.body || 3), 0) / count;
        const avgAroma = statsData.reduce((acc, curr) => acc + (curr.aroma || 3), 0) / count;

        // MATCH SCORE CALCULATION
        // We compare the 4 criteria with the user's ideal profile
        const diff = (
          Math.abs(ideal.intensity - avgIntensity) +
          Math.abs(ideal.acidity - avgAcidity) +
          Math.abs(ideal.body - avgBody) +
          Math.abs(ideal.aroma - avgAroma)
        );
        // Max diff is 4 * 4 = 16. We convert to 0-100 percentage.
        const matchScore = Math.max(0, Math.min(100, Math.round(100 - (diff * 6.25))));

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
          reviews_count: count, 
          last_comments: lastComments,
          match_score: matchScore,
          specs: {
            intensity: parseFloat(avgIntensity.toFixed(1)),
            acidity: parseFloat(avgAcidity.toFixed(1)),
            body: parseFloat(avgBody.toFixed(1)),
            aroma: parseFloat(avgAroma.toFixed(1))
          }
        };
      }
      return { 
        ...product, 
        avg_rating: null, 
        reviews_count: 0, 
        last_comments: [], 
        match_score: null // If no data, we don't show match score yet
      };
    }));

    return NextResponse.json({ 
      products: enrichedProducts,
      hasMore: (count || 0) > to
    });

  } catch (error) {
    return NextResponse.json({ products: [], error: 'Search failed' }, { status: 500 });
  }
}
