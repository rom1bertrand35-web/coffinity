const { PlaywrightCrawler, Dataset } = require('crawlee');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const crawler = new PlaywrightCrawler({
    async requestHandler({ request, page, enqueueLinks, log }) {
        log.info(`Scraping: ${request.url}`);
        await page.waitForLoadState('networkidle');

        // Extract products from Terres de Café (they don't block aggressively)
        const products = await page.$$eval('.product-miniature', (items) => {
            return items.map((item) => {
                const nameEl = item.querySelector('.product-title a');
                const name = nameEl ? nameEl.textContent.trim() : '';

                // Brand is always Terres de Café here
                const brand = "Terres de Café";

                const imgEl = item.querySelector('.product-thumbnail img');
                let image_url = '';
                if (imgEl) {
                    image_url = imgEl.getAttribute('data-src') || imgEl.getAttribute('src') || '';
                }
                
                const linkEl = item.querySelector('.product-thumbnail');
                const url = linkEl ? linkEl.href : '';

                return { name, brand, image_url, url, category: 'Grains' };
            }).filter(p => p.name !== '' && p.url !== '');
        });

        log.info(`Found ${products.length} coffees on this page.`);

        if (products.length > 0) {
            const { error } = await supabase.from('coffees').upsert(products, { onConflict: 'url', ignoreDuplicates: true });
            if (error) log.error(`Supabase error: ${error.message}`);
        }

        // Pagination
        await enqueueLinks({ selector: 'a.next', label: 'LIST' });
    },
    maxRequestsPerCrawl: 10, 
});

async function main() {
    console.log('Starting Terres de Café Scraper...');
    await crawler.run([{ url: 'https://www.terresdecafe.com/fr/12-cafes-en-grains', label: 'LIST' }]);
    console.log('Scraping finished.');
}
main();
