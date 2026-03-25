const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const mockCoffees = [
    { name: "La Cueva (Colombie)", brand: "L'Arbre à Café", image_url: "https://www.larbreacafe.com/cdn/shop/files/la-cueva-cafe-grains.jpg", category: "Grains", url: "mock_1" },
    { name: "Yirgacheffe (Éthiopie)", brand: "Terres de Café", image_url: "https://www.terresdecafe.com/img/p/7/3/2/8/7328-home_default.jpg", category: "Grains", url: "mock_2" },
    { name: "Bourbon Pointu (La Réunion)", brand: "L'Arbre à Café", image_url: "https://www.larbreacafe.com/cdn/shop/files/bourbon-pointu.jpg", category: "Grains", url: "mock_3" },
    { name: "Honduras Marcala", brand: "Coutume", image_url: "https://www.coutumecafe.com/cdn/shop/files/Honduras-Marcala-Grain.jpg", category: "Grains", url: "mock_4" },
    { name: "Bresil El Paraiso", brand: "KB Coffee Roasters", image_url: "https://kbcoffeeroasters.com/wp-content/uploads/2021/05/Bresil-El-Paraiso.jpg", category: "Grains", url: "mock_5" },
    { name: "Kenya AA Gathiru", brand: "Mokxa", image_url: "https://mokxa.com/wp-content/uploads/2022/03/Kenya-AA-Gathiru.jpg", category: "Grains", url: "mock_6" },
    { name: "Pérou Bobolink", brand: "Lomi", image_url: "https://cafelomi.com/cdn/shop/products/Bobolink.jpg", category: "Grains", url: "mock_7" },
    { name: "Deca Sugarcane", brand: "Coutume", image_url: "https://www.coutumecafe.com/cdn/shop/files/Deca-Sugarcane.jpg", category: "Grains", url: "mock_8" },
    { name: "Costa Rica Tunki", brand: "Terres de Café", image_url: "https://www.terresdecafe.com/img/p/7/3/3/0/7330-home_default.jpg", category: "Grains", url: "mock_9" },
    { name: "House Blend Espresso", brand: "Café Belleville", image_url: "https://cafesbelleville.com/cdn/shop/products/House-Blend-Espresso.jpg", category: "Grains", url: "mock_10" },
    { name: "Ethiopie Guji Highland", brand: "Oven Heaven", image_url: "https://ovenheaven.com/cdn/shop/products/Guji-Highland.png", category: "Grains", url: "mock_11" },
    { name: "Guatemala Finca El Puente", brand: "Hexagone", image_url: "https://hexagone-cafe.com/cdn/shop/products/Finca-El-Puente.jpg", category: "Grains", url: "mock_12" }
];

async function main() {
    console.log(`Insertion de ${mockCoffees.length} cafés de spécialité dans Supabase...`);
    const { data, error } = await supabase
        .from('coffees')
        .upsert(mockCoffees, { onConflict: 'url', ignoreDuplicates: true });
        
    if (error) {
        console.error("Erreur:", error.message);
    } else {
        console.log("✅ Cafés insérés avec succès ! La base de données locale est prête.");
    }
}
main();