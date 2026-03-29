const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const coffeeData = [
  // SEGAFREDO
  { name: 'Intermezzo - Grains 1kg', brand: 'Segafredo', image_url: 'https://m.media-amazon.com/images/I/81S9W7S7iNL._AC_SL1500_.jpg', category: 'Grains' },
  { name: 'Casa - Grains 1kg', brand: 'Segafredo', image_url: 'https://m.media-amazon.com/images/I/71S9W7S7iNL._AC_SL1500_.jpg', category: 'Grains' },
  { name: 'Selezione Crema - Grains', brand: 'Segafredo', image_url: 'https://m.media-amazon.com/images/I/81vYV0i9T5L._AC_SL1500_.jpg', category: 'Grains' },

  // SAN MARCO
  { name: 'N°7 Classique - Moulu', brand: 'San Marco', image_url: 'https://m.media-amazon.com/images/I/81S8fWp7N5L._AC_SL1500_.jpg', category: 'Moulu' },
  { name: 'N°9 Intense - Moulu', brand: 'San Marco', image_url: 'https://m.media-amazon.com/images/I/71uV4p7-99L._AC_SL1500_.jpg', category: 'Moulu' },
  { name: 'Pur Arabica - Grains', brand: 'San Marco', image_url: 'https://m.media-amazon.com/images/I/81xG-Y3V4cL._AC_SL1500_.jpg', category: 'Grains' },

  // GRAND'MÈRE
  { name: 'Dégustation - Moulu', brand: 'Grand\'Mère', image_url: 'https://m.media-amazon.com/images/I/81N9W7S7iNL._AC_SL1500_.jpg', category: 'Moulu' },
  { name: 'Familial - Moulu', brand: 'Grand\'Mère', image_url: 'https://m.media-amazon.com/images/I/81N2A6GvS4L._AC_SL1500_.jpg', category: 'Moulu' },

  // JACQUES VABRE
  { name: 'Grains du Monde Brésil - Moulu', brand: 'Jacques Vabre', image_url: 'https://m.media-amazon.com/images/I/71R1yH8N8ZL._AC_SL1500_.jpg', category: 'Moulu' },
  { name: 'Grains du Monde Colombie - Moulu', brand: 'Jacques Vabre', image_url: 'https://m.media-amazon.com/images/I/81vYV0i9T5L._AC_SL1500_.jpg', category: 'Moulu' },

  // MEZZO (Leclerc)
  { name: 'Mezzo Arabica - Grains', brand: 'Mezzo', image_url: 'https://m.media-amazon.com/images/I/71-0+D4e8oL._AC_SL1500_.jpg', category: 'Grains' },

  // L'OR (More)
  { name: 'L\'OR Espresso Ristretto - Capsules', brand: 'L\'OR', image_url: 'https://m.media-amazon.com/images/I/81N9W7S7iNL._AC_SL1500_.jpg', category: 'Capsules' },
  { name: 'L\'OR Espresso Lungo Profondo - Capsules', brand: 'L\'OR', image_url: 'https://m.media-amazon.com/images/I/81S9W7S7iNL._AC_SL1500_.jpg', category: 'Capsules' },

  // CAFE ROYAL (More)
  { name: 'Royal Espresso - Grains', brand: 'Café Royal', image_url: 'https://m.media-amazon.com/images/I/81vYV0i9T5L._AC_SL1500_.jpg', category: 'Grains' },
  { name: 'Royal Lungo - Capsules', brand: 'Café Royal', image_url: 'https://m.media-amazon.com/images/I/81S8fWp7N5L._AC_SL1500_.jpg', category: 'Capsules' },

  // PELINI
  { name: 'Pellini Top - Grains', brand: 'Pellini', image_url: 'https://m.media-amazon.com/images/I/71f-T3P6M+L._AC_SL1500_.jpg', category: 'Grains' },
  { name: 'Pellini No. 82 Vivace - Grains', brand: 'Pellini', image_url: 'https://m.media-amazon.com/images/I/81xG-Y3V4cL._AC_SL1500_.jpg', category: 'Grains' }
];

async function seed() {
  console.log(`Starting extra seed of ${coffeeData.length} items...`);
  for (const coffee of coffeeData) {
    const { data: existing } = await supabase
      .from('coffees')
      .select('id')
      .eq('name', coffee.name)
      .eq('brand', coffee.brand)
      .maybeSingle();
      
    if (!existing) {
      const { error } = await supabase.from('coffees').insert(coffee);
      if (error) console.error(`Error inserting ${coffee.name}:`, error.message);
      else console.log(`Added: ${coffee.name} (${coffee.brand})`);
    } else {
      console.log(`Skipped (exists): ${coffee.name}`);
    }
  }
  console.log('Extra seed completed.');
}

seed();
