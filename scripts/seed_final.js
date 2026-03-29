const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const coffeeData = [
  // NESPRESSO (Popular Pods)
  { name: 'Ispirazione Italiana Arpeggio', brand: 'Nespresso', image_url: 'https://www.nespresso.com/shared_res/mos/free_html/fr/ispirazione-italiana/arpeggio.png', category: 'Capsules' },
  { name: 'Ispirazione Italiana Roma', brand: 'Nespresso', image_url: 'https://www.nespresso.com/shared_res/mos/free_html/fr/ispirazione-italiana/roma.png', category: 'Capsules' },
  { name: 'Ispirazione Italiana Kazaar', brand: 'Nespresso', image_url: 'https://www.nespresso.com/shared_res/mos/free_html/fr/ispirazione-italiana/kazaar.png', category: 'Capsules' },
  { name: 'Volluto', brand: 'Nespresso', image_url: 'https://www.nespresso.com/shared_res/mos/free_html/fr/ispirazione-italiana/volluto.png', category: 'Capsules' },
  { name: 'Linizio Lungo', brand: 'Nespresso', image_url: 'https://www.nespresso.com/shared_res/mos/free_html/fr/ispirazione-italiana/linizio.png', category: 'Capsules' },
  
  // BELLEVILLE BRÛLERIE (Specialty Paris)
  { name: 'La French - Grains', brand: 'Belleville Brûlerie', image_url: 'https://cafesbelleville.com/cdn/shop/products/LaFrench_1024x1024.jpg', category: 'Grains' },
  { name: 'Château Belleville - Grains', brand: 'Belleville Brûlerie', image_url: 'https://cafesbelleville.com/cdn/shop/products/ChateauBelleville_1024x1024.jpg', category: 'Grains' },
  { name: 'Mistral - Grains', brand: 'Belleville Brûlerie', image_url: 'https://cafesbelleville.com/cdn/shop/products/Mistral_1024x1024.jpg', category: 'Grains' },
  { name: 'Assemblage Filtre - Moulu', brand: 'Belleville Brûlerie', image_url: 'https://cafesbelleville.com/cdn/shop/products/Filtre_1024x1024.jpg', category: 'Moulu' },

  // CARTE NOIRE (More variety)
  { name: 'Carte Noire L\'Absolu - Grains', brand: 'Carte Noire', image_url: 'https://m.media-amazon.com/images/I/81S8fWp7N5L._AC_SL1500_.jpg', category: 'Grains' },
  { name: 'Carte Noire BIO - Moulu', brand: 'Carte Noire', image_url: 'https://m.media-amazon.com/images/I/71uV4p7-99L._AC_SL1500_.jpg', category: 'Moulu' },
  { name: 'Carte Noire Arabica Exclusif - Grains', brand: 'Carte Noire', image_url: 'https://m.media-amazon.com/images/I/81xG-Y3V4cL._AC_SL1500_.jpg', category: 'Grains' },

  // MALONGO (More variety)
  { name: 'Malongo Petit Déjeuner - Moulu', brand: 'Malongo', image_url: 'https://m.media-amazon.com/images/I/71S9W7S7iNL._AC_SL1500_.jpg', category: 'Moulu' },
  { name: 'Malongo Colombie - Capsules 1,2,3 Spresso', brand: 'Malongo', image_url: 'https://m.media-amazon.com/images/I/81vYV0i9T5L._AC_SL1500_.jpg', category: 'Capsules' },
  { name: 'Malongo Italissimo - Grains', brand: 'Malongo', image_url: 'https://m.media-amazon.com/images/I/81N9W7S7iNL._AC_SL1500_.jpg', category: 'Grains' },

  // GREEN LION COFFEE (Organic)
  { name: 'Inca Blend - Grains', brand: 'Green Lion Coffee', image_url: 'https://p.maxicoffee.com/media/catalog/product/g/r/green-lion-coffee-cafe-grains-inca-blend-1kg.jpg', category: 'Grains' },
  { name: 'Savanah Blend - Grains', brand: 'Green Lion Coffee', image_url: 'https://p.maxicoffee.com/media/catalog/product/g/r/green-lion-coffee-cafe-grains-savanah-blend-1kg.jpg', category: 'Grains' },
  { name: 'Original Organic - Moulu', brand: 'Green Lion Coffee', image_url: 'https://p.maxicoffee.com/media/catalog/product/g/r/green-lion-coffee-ground-coffee-loriginal-1kg.jpg', category: 'Moulu' },

  // PELTzer (Alsace)
  { name: 'Mélange Maison Peltzer - Grains', brand: 'Café Peltzer', image_url: 'https://www.cafes-peltzer.fr/img/cms/Visuels/Maison.jpg', category: 'Grains' },
  { name: 'Espresso Bar - Grains', brand: 'Café Peltzer', image_url: 'https://www.cafes-peltzer.fr/img/cms/Visuels/Espresso.jpg', category: 'Grains' },

  // SPECIALTY ROASTERS VARIOUS
  { name: 'Bresil El Paraiso - Grains', brand: 'KB Coffee Roasters', image_url: 'https://www.kbcoffeeroasters.com/img/cms/Visuels/Bresil.jpg', category: 'Grains' },
  { name: 'Ethiopie Yirgacheffe - Grains', brand: 'Coutume', image_url: 'https://www.coutumecafe.com/img/cms/Visuels/Ethiopie.jpg', category: 'Grains' },
  { name: 'Honduras Caballero - Grains', brand: 'L\'Arbre à Café', image_url: 'https://www.larbreacafe.com/img/cms/Visuels/Honduras.jpg', category: 'Grains' },
  { name: 'Kenya Karimikui - Grains', brand: 'Terres de Café', image_url: 'https://www.terresdecafe.com/img/cms/Visuels/Kenya.jpg', category: 'Grains' }
];

async function seed() {
  console.log(`Starting final seed of ${coffeeData.length} items...`);
  
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
  
  console.log('Final seed completed.');
}

seed();
