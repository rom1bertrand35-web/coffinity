const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const beansAffiliationData = [
  // LUGAT (MaxiCoffee Stars)
  { 
    name: 'Mélange Gourmet - Grains', 
    brand: 'Lugat', 
    image_url: 'https://p.maxicoffee.com/media/catalog/product/c/a/cafes-lugat-melange-gourmet-grains-250g.jpg', 
    url: 'https://www.maxicoffee.com/cafe-en-grain-lugat-melange-gourmet-5kg-p-132002.html', 
    category: 'Grains' 
  },
  { 
    name: 'Tasty Selection - Grains', 
    brand: 'Lugat', 
    image_url: 'https://p.maxicoffee.com/media/catalog/product/c/a/cafes-lugat-coffee-beans-tasty-selection-250g.jpg', 
    url: 'https://www.maxicoffee.com/en-eu/cafes-lugat-coffee-beans-tasty-selection-250g-p-16990.html', 
    category: 'Grains' 
  },
  { 
    name: 'Intenso Blend - Grains', 
    brand: 'Lugat', 
    image_url: 'https://p.maxicoffee.com/media/catalog/product/c/a/cafes-lugat-blend-italien-grains-250g.jpg', 
    url: 'https://www.maxicoffee.com/cafe-en-grain-cafes-lugat-blend-italien-250g-p-531.html', 
    category: 'Grains' 
  },
  { 
    name: 'Pacific Blend - Grains', 
    brand: 'Lugat', 
    image_url: 'https://p.maxicoffee.com/media/catalog/product/c/a/cafe-grains-blend-pacifique-12x250g-cafes-lugat.jpg', 
    url: 'https://www.maxicoffee.com/cafe-grains-blend-pacifique-12x250g-cafes-lugat-p-57788.html', 
    category: 'Grains' 
  },

  // LAVAZZA (Amazon/MaxiCoffee Best Sellers)
  { 
    name: 'Tierra Selection - Grains 1kg', 
    brand: 'Lavazza', 
    image_url: 'https://m.media-amazon.com/images/I/81SDMFC0._AC_SL1500_.jpg', 
    url: 'https://www.amazon.fr/Lavazza-Espresso-Tierra-Grains-1000g/dp/B000SDMFC0', 
    category: 'Grains' 
  },
  { 
    name: 'Aroma Più - Grains 1kg', 
    brand: 'Lavazza', 
    image_url: 'https://m.media-amazon.com/images/I/71R84WFKZ._AC_SL1500_.jpg', 
    url: 'https://www.amazon.fr/Lavazza-Aroma-Pi%C3%B9-Grains-1KG/dp/B07R84WFKZ', 
    category: 'Grains' 
  },
  { 
    name: 'Barista Perfetto - Grains 1kg', 
    brand: 'Lavazza', 
    image_url: 'https://m.media-amazon.com/images/I/81V86PEY._AC_SL1500_.jpg', 
    url: 'https://www.amazon.fr/LAVAZZA-Espresso-Barista-Perfetto-Intensit%C3%A9/dp/B002V86PEY', 
    category: 'Grains' 
  },
  { 
    name: 'Espresso Italiano Classico - Grains', 
    brand: 'Lavazza', 
    image_url: 'https://p.maxicoffee.com/media/catalog/product/l/a/lavazza-espresso-italiano-classico-coffee-beans-1kg.jpg', 
    url: 'https://www.maxicoffee.com/en-gb/lavazza-espresso-italiano-classico-coffee-beans-1kg-p-218533.html', 
    category: 'Grains' 
  },

  // PELLINI (MaxiCoffee Classic)
  { 
    name: 'Pellini Top Originale - Grains', 
    brand: 'Pellini', 
    image_url: 'https://p.maxicoffee.com/media/catalog/product/p/e/pellini-top-originale-coffee-beans-arabica-1kg.jpg', 
    url: 'https://www.maxicoffee.com/en-gb/pellini-top-originale-coffee-beans-arabica-1kg-p-2607.html', 
    category: 'Grains' 
  },

  // ILLY
  { 
    name: 'Classico Whole Bean - 500g', 
    brand: 'Illy', 
    image_url: 'https://m.media-amazon.com/images/I/71D6RTTM4K._AC_SL1500_.jpg', 
    url: 'https://www.amazon.fr/illy-CLASSICO-Arabica-dOranger-Arri%C3%A8re-go%C3%BBt/dp/B0D6RTTM4K', 
    category: 'Grains' 
  },

  // L'OR
  { 
    name: 'Absolu Sublime - Grains 1kg', 
    brand: 'L\'OR', 
    image_url: 'https://m.media-amazon.com/images/I/71uV4p7-99L._AC_SL1500_.jpg', 
    url: 'https://amazon.fr/LOR-4056337-Absolu-Sublime-Grains/dp/B07SNT8VCH', 
    category: 'Grains' 
  }
];

async function seed() {
  console.log(`Starting beans affiliation seed of ${beansAffiliationData.length} items...`);
  
  for (const coffee of beansAffiliationData) {
    // We update if exists to ensure URLs and images are fresh for affiliation
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
      const { error } = await supabase.from('coffees').update(coffee).eq('id', existing.id);
      if (error) console.error(`Error updating ${coffee.name}:`, error.message);
      else console.log(`Updated: ${coffee.name} (Refreshed for affiliation)`);
    }
  }
  
  console.log('Beans affiliation seed completed.');
}

seed();
