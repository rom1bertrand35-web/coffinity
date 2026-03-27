const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const rawData = fs.readFileSync(path.resolve(__dirname, '../2026-03-25_maxicoffee_google_results.json'));
    const searchResults = JSON.parse(rawData);

    const coffees = [];
    
    searchResults.forEach(page => {
        if (page.organicResults) {
            page.organicResults.forEach(result => {
                // Filter for product pages (-p-)
                if (result.url.includes('-p-')) {
                    let name = result.title.replace(' | MaxiCoffee', '').replace(' - MaxiCoffee', '').trim();
                    
                    // Basic brand extraction logic
                    // Often "Café en grain [Brand] ..." or "... - [Brand]"
                    let brand = "Unknown";
                    const brandMatch = name.match(/Café en grain ([\w\s]+?)(?=\s[A-Z]|\s\d|$)/);
                    if (brandMatch) {
                        brand = brandMatch[1].trim();
                    }

                    // Heuristics for images: Google Search Scraper doesn't always give thumbnails in organicResults
                    // but we can try to guess or just use a placeholder for now
                    const image_url = result.thumbnail || "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=2070&auto=format&fit=crop";

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

    if (coffees.length > 0) {
        const { data, error } = await supabase
            .from('coffees')
            .upsert(coffees, { onConflict: 'url', ignoreDuplicates: true });

        if (error) {
            console.error('Error inserting into Supabase:', error.message);
        } else {
            console.log(`Successfully added ${coffees.length} coffees to the database.`);
        }
    }
}

main();
