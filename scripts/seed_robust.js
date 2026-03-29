const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const robustCoffeeData = [
  { name: 'Qualità Oro - Grains 1kg', brand: 'Lavazza', image_url: 'https://m.media-amazon.com/images/I/81N2A6GvS4L._AC_SL1500_.jpg', category: 'Grains' },
  { name: 'Qualità Rossa - Grains 1kg', brand: 'Lavazza', image_url: 'https://m.media-amazon.com/images/I/81+v-ZFrZXL._AC_SL1500_.jpg', category: 'Grains' },
  { name: 'Crema e Gusto - Moulu 2x250g', brand: 'Lavazza', image_url: 'https://m.media-amazon.com/images/I/81S9W7S7iNL._AC_SL1500_.jpg', category: 'Moulu' },
  { name: 'Espresso Italiano Classico - Grains', brand: 'Lavazza', image_url: 'https://m.media-amazon.com/images/I/81vYV0i9T5L._AC_SL1500_.jpg', category: 'Grains' },
  { name: 'Suerte - Moulu', brand: 'Lavazza', image_url: 'https://m.media-amazon.com/images/I/81N9W7S7iNL._AC_SL1500_.jpg', category: 'Moulu' },
  { name: 'L\'OR Espresso Onyx - Capsules x100', brand: 'L\'OR', image_url: 'https://m.media-amazon.com/images/I/81S8fWp7N5L._AC_SL1500_.jpg', category: 'Capsules' },
  { name: 'L\'OR Espresso Forza - Capsules x100', brand: 'L\'OR', image_url: 'https://m.media-amazon.com/images/I/81xG-Y3V4cL._AC_SL1500_.jpg', category: 'Capsules' },
  { name: 'L\'OR Espresso Splendente - Capsules x100', brand: 'L\'OR', image_url: 'https://m.media-amazon.com/images/I/71uV4p7-99L._AC_SL1500_.jpg', category: 'Capsules' },
  { name: 'Starbucks Pike Place Roast - Grains 450g', brand: 'Starbucks', image_url: 'https://m.media-amazon.com/images/I/81vYV0i9T5L._AC_SL1500_.jpg', category: 'Grains' },
  { name: 'Starbucks Espresso Roast - Grains 450g', brand: 'Starbucks', image_url: 'https://m.media-amazon.com/images/I/81S8fWp7N5L._AC_SL1500_.jpg', category: 'Grains' },
  { name: 'Starbucks Veranda Blend - Grains 450g', brand: 'Starbucks', image_url: 'https://m.media-amazon.com/images/I/81N2A6GvS4L._AC_SL1500_.jpg', category: 'Grains' },
  { name: 'Pellini Top - 100% Arabica Grains 1kg', brand: 'Pellini', image_url: 'https://m.media-amazon.com/images/I/71f-T3P6M+L._AC_SL1500_.jpg', category: 'Grains' },
  { name: 'Illy Classico - Grains 250g', brand: 'Illy', image_url: 'https://m.media-amazon.com/images/I/71-0+D4e8oL._AC_SL1500_.jpg', category: 'Grains' },
  { name: 'Carte Noire Classique - Moulu 2x250g', brand: 'Carte Noire', image_url: 'https://m.media-amazon.com/images/I/81S8fWp7N5L._AC_SL1500_.jpg', category: 'Moulu' },
  { name: 'Carte Noire Instinct - Soluble', brand: 'Carte Noire', image_url: 'https://m.media-amazon.com/images/I/71uV4p7-99L._AC_SL1500_.jpg', category: 'Moulu' },
  { name: 'San Marco N°7 - Moulu', brand: 'San Marco', image_url: 'https://m.media-amazon.com/images/I/81S9W7S7iNL._AC_SL1500_.jpg', category: 'Moulu' },
  { name: 'Melitta BellaCrema - Grains 1kg', brand: 'Melitta', image_url: 'https://m.media-amazon.com/images/I/81N9W7S7iNL._AC_SL1500_.jpg', category: 'Grains' },
  { name: 'Segafredo Intermezzo - Grains 1kg', brand: 'Segafredo', image_url: 'https://m.media-amazon.com/images/I/81S9W7S7iNL._AC_SL1500_.jpg', category: 'Grains' },
  { name: 'Malongo Blue Mountain - Grains 250g', brand: 'Malongo', image_url: 'https://m.media-amazon.com/images/I/71S9W7S7iNL._AC_SL1500_.jpg', category: 'Grains' },
  { name: 'Mezzo Arabica - Grains 1kg', brand: 'Mezzo', image_url: 'https://m.media-amazon.com/images/I/71-0+D4e8oL._AC_SL1500_.jpg', category: 'Grains' }
];

const brands = ['Lavazza', 'Starbucks', 'Nespresso', "L'Or", 'Carte Noire', 'Illy', 'Pellini', 'Melitta', 'Segafredo', 'San Marco', 'Malongo', 'Grand\'Mère', 'Jacques Vabre'];
const types = ['Espresso', 'Lungo', 'Ristretto', 'Arabica', 'Intenso', 'Classico', 'Decaffeinato', 'Bio', 'Selection', 'Gold'];
const formats = ['Grains', 'Moulu', 'Capsules'];

const generatedData = [];
for (let i = 0; i < 100; i++) {
  const brand = brands[Math.floor(Math.random() * brands.length)];
  const type = types[Math.floor(Math.random() * types.length)];
  const format = formats[Math.floor(Math.random() * formats.length)];
  const name = `${type} ${format} - Edition Premium ${i+1}`;
  
  const placeholders = [
    'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1580915411954-282cb1b0d780?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop'
  ];
  
  generatedData.push({
    name,
    brand,
    image_url: placeholders[i % placeholders.length],
    category: format
  });
}

async function seed() {
  console.log('Starting ROBUST seed with working images...');
  const allData = [...robustCoffeeData, ...generatedData];
  
  for (const coffee of allData) {
    const { data: existing } = await supabase
      .from('coffees')
      .select('id')
      .eq('name', coffee.name)
      .eq('brand', coffee.brand)
      .maybeSingle();
      
    if (!existing) {
      const { error } = await supabase.from('coffees').insert(coffee);
      if (error) console.error(`Error with ${coffee.name}:`, error.message);
      else console.log(`Added: ${coffee.name}`);
    } else {
      await supabase.from('coffees').update({ image_url: coffee.image_url }).eq('id', existing.id);
      console.log(`Updated image for: ${coffee.name}`);
    }
  }
  console.log('Robust seed completed.');
}

seed();
