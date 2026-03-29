const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function seed() {
  const now = new Date();
  const onejan = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil((((now.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
  
  const { data: coffees } = await supabase.from('coffees').select('id, name').limit(3);
  if (!coffees || coffees.length < 3) {
    console.error('Not enough coffees in DB to seed weekly selection.');
    return;
  }

  const selection = {
    week_number: week,
    year: now.getFullYear(),
    title: 'Les Perles du Printemps',
    description: 'Baristo a parcouru les hautes terres pour vous dénicher trois crus d\'exception. Cette semaine, on mise sur la clarté aromatique et les notes de fleurs blanches.',
    coffee_ids: coffees.map(c => c.id),
    origins: [
      { name: 'Éthiopie', x: 55, y: 55 },
      { name: 'Colombie', x: 25, y: 65 },
      { name: 'Panama', x: 20, y: 58 }
    ],
    baristo_tips: 'Utilisez une eau filtrée à 92°C pour ces crus. Une extraction lente en V60 révélera toute la complexité du terroir éthiopien.'
  };

  const { error } = await supabase
    .from('weekly_selections')
    .upsert(selection, { onConflict: 'week_number,year' });

  if (error) console.error('Error seeding weekly selection:', error.message);
  else console.log('✅ Weekly selection with Baristo details seeded.');
}

seed();
