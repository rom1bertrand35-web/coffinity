const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const STOCK_IMAGES = [
  'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1580915411954-282cb1b0d780?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1497933322675-45c39c7f6a21?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1506372023823-741c83b836fe?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1442550528053-c431ecb55509?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?q=80&w=800&auto=format&fit=crop'
];

async function sanitizeImages() {
  console.log('Sanitizing coffee database images...');
  
  const { data: coffees } = await supabase.from('coffees').select('id, name, brand, image_url');
  
  let updatedCount = 0;
  for (const coffee of coffees) {
    let needsUpdate = false;
    let newUrl = coffee.image_url;

    // Check for problematic domains or missing URLs
    if (!newUrl || 
        newUrl.includes('terresdecafe.com') || 
        newUrl.includes('larbreacafe.com') || 
        newUrl.includes('coutumecafe.com') || 
        newUrl.includes('kbcoffeeroasters.com') || 
        newUrl.includes('mokxa.com') || 
        newUrl.includes('cafelomi.com') ||
        newUrl.includes('cafes-peltzer.fr') ||
        newUrl.includes('cafemokxa.com') ||
        newUrl.includes('cafesbelleville.com')) {
      
      needsUpdate = true;
      // Assign a deterministic but varied stock image
      const index = Math.abs(JSON.stringify(coffee).length % STOCK_IMAGES.length);
      newUrl = STOCK_IMAGES[index];
    }

    if (needsUpdate) {
      await supabase.from('coffees').update({ image_url: newUrl }).eq('id', coffee.id);
      updatedCount++;
    }
  }
  
  console.log(`Successfully sanitized ${updatedCount} images with high-quality fallbacks.`);
}

sanitizeImages();
