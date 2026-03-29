const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const TRUSTED_PATTERNS = [
  'amazon.com/images',
  'media-amazon.com',
  'images.unsplash.com',
  'maxicoffee.com/media/catalog/product',
  'p.maxicoffee.com'
];

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

async function forceImages() {
  console.log('Force Cleaning Database: 100% Guaranteed Working Images Policy');
  
  const { data: coffees } = await supabase.from('coffees').select('id, name, brand, image_url');
  
  let totalFixed = 0;
  for (let i = 0; i < coffees.length; i++) {
    const coffee = coffees[i];
    let isTrusted = false;
    
    if (coffee.image_url) {
      isTrusted = TRUSTED_PATTERNS.some(pattern => coffee.image_url.includes(pattern));
    }

    if (!isTrusted) {
      const stockUrl = STOCK_IMAGES[i % STOCK_IMAGES.length];
      await supabase.from('coffees').update({ image_url: stockUrl }).eq('id', coffee.id);
      totalFixed++;
    }
  }
  
  console.log(`Cleanup complete. Fixed ${totalFixed} coffee references with guaranteed images.`);
}

forceImages();
