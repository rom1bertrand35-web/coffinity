const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const rawData = fs.readFileSync(path.resolve(__dirname, '../2026-03-25_maxicoffee_google_results.json'));
    const searchResults = JSON.parse(rawData);

    const coffees = [];
    
    searchResults.forEach(page => {
        if (page.organicResults) {
            page.organicResults.forEach(result => {
                // Filter for product pages (-p-) and exclude blogs
                if (result.url.includes('-p-') && !result.url.includes('coffee-spirit')) {
                    let name = result.title.replace(' | MaxiCoffee', '').replace(' - MaxiCoffee', '').trim();
                    
                    // Basic brand extraction logic
                    let brand = "Unknown";
                    const brandMatch = name.match(/Café en grain ([\w\s]+?)(?=\s[A-Z]|\s\d|$)/);
                    if (brandMatch) {
                        brand = brandMatch[1].trim();
                    }

                    // Try to find a real thumbnail
                    let image_url = result.thumbnail;
                    
                    // Fallback to rich snippet if available
                    if (!image_url && result.richSnippet?.top?.detected_extensions?.thumbnail) {
                        image_url = result.richSnippet.top.detected_extensions.thumbnail;
                    }

                    // Final fallback to a high-quality coffee image
                    if (!image_url) {
                        image_url = "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=2070&auto=format&fit=crop";
                    }

                    coffees.push({
                        name: name,
                        brand: brand,
                        url: result.url,
                        image_url: image_url,
                        category: 'Grains'
                    });
                }
            });
        }
    });

    console.log(`Extracted ${coffees.length} products from Google results.`);

    // Filter duplicates in the array based on URL
    const uniqueCoffees = Array.from(new Map(coffees.map(item => [item.url, item])).values());

    if (uniqueCoffees.length > 0) {
        const { data, error } = await supabase
            .from('coffees')
            .upsert(uniqueCoffees, { onConflict: 'url' });

        if (error) {
            console.error('Error inserting into Supabase:', error.message);
        } else {
            console.log(`Successfully updated/added ${uniqueCoffees.length} unique coffees to the database.`);
        }
    }
}

main();
