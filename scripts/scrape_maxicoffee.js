const { PlaywrightCrawler, Dataset } = require('crawlee');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// Setup Supabase Client using Service Role Key (to bypass RLS for inserts)
// Make sure to add NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY to your .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const crawler = new PlaywrightCrawler({
    async requestHandler({ request, page, enqueueLinks, log }) {
        log.info(`Scraping list page: ${request.url}`);

        // Wait for the product grid to load by waiting for network idle
        await page.waitForLoadState('networkidle');

        // Extract products (Maxicoffee usually uses article or .product-item)
        const products = await page.$$eval('article, .product-list-item, .vtex-product-summary-2-x-container', (items) => {
            return items.map((item) => {
                // Heuristics for Brand
                const brandEl = item.querySelector('.brand, .vtex-product-summary-2-x-brandName, [itemprop="brand"]');
                const brand = brandEl ? brandEl.textContent.trim() : '';

                // Heuristics for Name
                const nameEl = item.querySelector('.name, .vtex-product-summary-2-x-productNameContainer, h2, h3');
                const name = nameEl ? nameEl.textContent.trim() : '';

                // Heuristics for Image
                const imgEl = item.querySelector('img');
                let image_url = '';
                if (imgEl) {
                    image_url = imgEl.getAttribute('data-src') || imgEl.getAttribute('src') || '';
                }
                
                // Heuristics for link
                const linkEl = item.querySelector('a');
                const url = linkEl ? linkEl.href : '';

                return {
                    name,
                    brand,
                    image_url,
                    url,
                    category: 'Grains'
                };
            }).filter(p => p.name !== '' && p.url !== ''); // Remove empty ones
        });

        log.info(`Found ${products.length} coffees on this page.`);

        // 1. Save to local JSON dataset (for backup/verification)
        await Dataset.pushData(products);

        // 2. Insert into Supabase (Upsert to avoid duplicates based on URL)
        if (products.length > 0) {
            const { data, error } = await supabase
                .from('coffees')
                .upsert(products, { onConflict: 'url', ignoreDuplicates: true });
                
            if (error) {
                log.error(`Error inserting into Supabase: ${error.message}`);
            } else {
                log.info(`Successfully pushed new products to Supabase.`);
            }
        }

        // Handle pagination (go to next page)
        // Find the 'Next' arrow or specific page numbers
        await enqueueLinks({
            selector: '.pagination-next a', // Adjust this selector to Maxicoffee's pagination next button
            label: 'LIST',
        });
    },
    // Prevent infinite loops if pagination goes crazy
    maxRequestsPerCrawl: 5, 
});

async function main() {
    console.log('Starting MaxiCoffee Scraper...');
    
    // Check for keys
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error("Missing Supabase keys in .env.local! Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.");
        return;
    }

    await crawler.run([
        { url: 'https://www.maxicoffee.com/cafe-en-grain-c-28_56.html', label: 'LIST' }
    ]);
    console.log('Scraping finished.');
}

main();