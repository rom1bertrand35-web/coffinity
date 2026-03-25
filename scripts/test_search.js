const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSearch() {
    const query = 'arbre';
    console.log(`Testing search for: "${query}"`);
    
    const { data, error } = await supabase
      .from('coffees')
      .select('name, brand')
      .or(`name.ilike.%${query}%,brand.ilike.%${query}%`);
      
    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Results:", data);
    }
}

testSearch();
