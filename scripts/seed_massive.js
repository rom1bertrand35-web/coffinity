const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const coffeeData = [
  // LUGAT (MaxiCoffee)
  { name: 'Mélange Maison - Grains', brand: 'Lugat', image_url: 'https://p.maxicoffee.com/media/catalog/product/c/a/cafes-lugat-melange-maison-grains-250g.jpg', category: 'Grains' },
  { name: 'Dark Forest - Capsules Nespresso compatibles', brand: 'Lugat', image_url: 'https://p.maxicoffee.com/media/catalog/product/c/a/capsules-nespresso-compatible-cafes-lugat-black-forest-50capsules.jpg', category: 'Capsules' },
  { name: 'Finca Alfaro (Costa Rica) - Moulu', brand: 'Lugat', image_url: 'https://p.maxicoffee.com/media/catalog/product/g/r/ground-coffee-moka-pots-costa-rica-finca-alfaro-250g-cafes-lugat.jpg', category: 'Moulu' },
  { name: 'Mélange Primeur - Moulu', brand: 'Lugat', image_url: 'https://p.maxicoffee.com/media/catalog/product/c/a/cafes-lugat-melange-primeur-ground-coffee-250g.jpg', category: 'Moulu' },
  { name: 'Blue Mountain (Jamaïque) - Grains', brand: 'Lugat', image_url: 'https://p.maxicoffee.com/media/catalog/product/c/a/cafes-lugat-blue-mountain-jamaica-coffee-beans-250g.jpg', category: 'Grains' },
  
  // LAVAZZA
  { name: 'Qualità Oro - Grains 1kg', brand: 'Lavazza', image_url: 'https://m.media-amazon.com/images/I/81N2A6GvS4L._AC_SL1500_.jpg', category: 'Grains' },
  { name: 'Qualità Rossa - Grains 1kg', brand: 'Lavazza', image_url: 'https://m.media-amazon.com/images/I/81+v-ZFrZXL._AC_SL1500_.jpg', category: 'Grains' },
  { name: 'Crema e Gusto - Moulu', brand: 'Lavazza', image_url: 'https://m.media-amazon.com/images/I/81S9W7S7iNL._AC_SL1500_.jpg', category: 'Moulu' },
  { name: 'Super Crema - Grains', brand: 'Lavazza', image_url: 'https://m.media-amazon.com/images/I/71S9W7S7iNL._AC_SL1500_.jpg', category: 'Grains' },
  { name: 'Gran Espresso - Grains', brand: 'Lavazza', image_url: 'https://m.media-amazon.com/images/I/81vYV0i9T5L._AC_SL1500_.jpg', category: 'Grains' },
  
  // L'OR
  { name: 'Espresso Forza - Capsules', brand: 'L\'OR', image_url: 'https://m.media-amazon.com/images/I/81xG-Y3V4cL._AC_SL1500_.jpg', category: 'Capsules' },
  { name: 'Espresso Splendente - Capsules', brand: 'L\'OR', image_url: 'https://m.media-amazon.com/images/I/71uV4p7-99L._AC_SL1500_.jpg', category: 'Capsules' },
  { name: 'Espresso Onyx - Capsules', brand: 'L\'OR', image_url: 'https://m.media-amazon.com/images/I/81S8fWp7N5L._AC_SL1500_.jpg', category: 'Capsules' },
  { name: 'Espresso Supremo - Capsules', brand: 'L\'OR', image_url: 'https://m.media-amazon.com/images/I/81N9W7S7iNL._AC_SL1500_.jpg', category: 'Capsules' },
  
  // ILLY
  { name: 'Classico - Grains', brand: 'Illy', image_url: 'https://m.media-amazon.com/images/I/71-0+D4e8oL._AC_SL1500_.jpg', category: 'Grains' },
  { name: 'Intenso - Grains', brand: 'Illy', image_url: 'https://m.media-amazon.com/images/I/71f-T3P6M+L._AC_SL1500_.jpg', category: 'Grains' },
  { name: 'Forte - Grains', brand: 'Illy', image_url: 'https://m.media-amazon.com/images/I/81vYV0i9T5L._AC_SL1500_.jpg', category: 'Grains' },
  { name: 'Decaffeinato - Grains', brand: 'Illy', image_url: 'https://m.media-amazon.com/images/I/81S9W7S7iNL._AC_SL1500_.jpg', category: 'Grains' },
  
  // STARBUCKS
  { name: 'Pike Place Roast - Grains', brand: 'Starbucks', image_url: 'https://m.media-amazon.com/images/I/81vYV0i9T5L._AC_SL1500_.jpg', category: 'Grains' },
  { name: 'Espresso Roast - Grains', brand: 'Starbucks', image_url: 'https://m.media-amazon.com/images/I/81S8fWp7N5L._AC_SL1500_.jpg', category: 'Grains' },
  { name: 'Veranda Blend - Grains', brand: 'Starbucks', image_url: 'https://m.media-amazon.com/images/I/81N2A6GvS4L._AC_SL1500_.jpg', category: 'Grains' },
  { name: 'Caffè Verona - Grains', brand: 'Starbucks', image_url: 'https://m.media-amazon.com/images/I/71R1yH8N8ZL._AC_SL1500_.jpg', category: 'Grains' },

  // TERRES DE CAFE (Premium Specialty)
  { name: 'Yirgacheffe (Éthiopie)', brand: 'Terres de Café', image_url: 'https://www.terresdecafe.com/img/cms/Visuels%20Porduits/Ethiopie%20Yirgacheffe.jpg', category: 'Grains' },
  { name: 'Hachira (Éthiopie)', brand: 'Terres de Café', image_url: 'https://www.terresdecafe.com/img/cms/Visuels%20Porduits/Hachira.jpg', category: 'Grains' },
  { name: 'The Forest (Éthiopie)', brand: 'Terres de Café', image_url: 'https://www.terresdecafe.com/img/cms/Visuels%20Porduits/The%20Forest.jpg', category: 'Grains' },
  { name: 'Bourbon Rouge (Salvador)', brand: 'Terres de Café', image_url: 'https://www.terresdecafe.com/img/cms/Visuels%20Porduits/Salvador%20Bourbon.jpg', category: 'Grains' },
  { name: 'Geisha (Panama)', brand: 'Terres de Café', image_url: 'https://www.terresdecafe.com/img/cms/Visuels%20Porduits/Geisha.jpg', category: 'Grains' },

  // L'ARBRE A CAFE
  { name: 'La Cueva (Colombie)', brand: 'L\'Arbre à Café', image_url: 'https://www.larbreacafe.com/img/cms/Visuels%20Produits/La%20Cueva.jpg', category: 'Grains' },
  { name: 'Bourbon Pointu (La Réunion)', brand: 'L\'Arbre à Café', image_url: 'https://www.larbreacafe.com/img/cms/Visuels%20Produits/Bourbon%20Pointu.jpg', category: 'Grains' },
  { name: 'Iapar (Brésil)', brand: 'L\'Arbre à Café', image_url: 'https://www.larbreacafe.com/img/cms/Visuels%20Produits/Iapar.jpg', category: 'Grains' },
  { name: 'Sidamo (Éthiopie)', brand: 'L\'Arbre à Café', image_url: 'https://www.larbreacafe.com/img/cms/Visuels%20Produits/Sidamo.jpg', category: 'Grains' },

  // COUTUME
  { name: 'Honduras Marcala', brand: 'Coutume', image_url: 'https://www.coutumecafe.com/img/cms/Visuels%20Produits/Honduras.jpg', category: 'Grains' },
  { name: 'Kenya Nyeri', brand: 'Coutume', image_url: 'https://www.coutumecafe.com/img/cms/Visuels%20Produits/Kenya.jpg', category: 'Grains' },
  { name: 'Guatemala Huehuetenango', brand: 'Coutume', image_url: 'https://www.coutumecafe.com/img/cms/Visuels%20Produits/Guatemala.jpg', category: 'Grains' },

  // MALONGO
  { name: 'Blue Mountain - Grains', brand: 'Malongo', image_url: 'https://m.media-amazon.com/images/I/71S9W7S7iNL._AC_SL1500_.jpg', category: 'Grains' },
  { name: 'La Grande Réserve - Grains', brand: 'Malongo', image_url: 'https://m.media-amazon.com/images/I/81vYV0i9T5L._AC_SL1500_.jpg', category: 'Grains' },
  { name: 'Déca Aqua - Grains', brand: 'Malongo', image_url: 'https://m.media-amazon.com/images/I/81S8fWp7N5L._AC_SL1500_.jpg', category: 'Grains' },

  // BAZZARA
  { name: 'Dodicigrancru - Grains', brand: 'Bazzara', image_url: 'https://p.maxicoffee.com/media/catalog/product/b/a/bazzara-dodicigrancru-grains-1kg.jpg', category: 'Grains' },
  { name: 'Piacerepuro - Grains', brand: 'Bazzara', image_url: 'https://p.maxicoffee.com/media/catalog/product/b/a/bazzara-piacerepuro-grains-1kg.jpg', category: 'Grains' },
  { name: 'Aromapuro - Grains', brand: 'Bazzara', image_url: 'https://p.maxicoffee.com/media/catalog/product/b/a/bazzara-aromapuro-grains-1kg.jpg', category: 'Grains' },

  // CAFÉ MOKXA
  { name: 'Mélange Signé - Grains', brand: 'Café Mokxa', image_url: 'https://www.cafemokxa.com/img/cms/Visuels/Signe.jpg', category: 'Grains' },
  { name: 'Ethiopie Kochere - Grains', brand: 'Café Mokxa', image_url: 'https://www.cafemokxa.com/img/cms/Visuels/Kochere.jpg', category: 'Grains' },
  { name: 'Bresil Fazenda - Grains', brand: 'Café Mokxa', image_url: 'https://www.cafemokxa.com/img/cms/Visuels/Fazenda.jpg', category: 'Grains' }
];

async function seed() {
  console.log(`Starting massive seed of ${coffeeData.length} items...`);
  
  // Use upsert with name/brand uniqueness if we had a unique constraint on those, 
  // but here we use 'url' or just insert. For now let's just insert and rely on logic.
  // Actually, let's use name+brand as a pseudo-unique if possible or just check existence.
  
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
  
  console.log('Massive seed completed.');
}

seed();
