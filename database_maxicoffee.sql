-- Create a new table to store our scraped global coffee database
create table coffees (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  brand text,
  image_url text,
  url text unique, -- to prevent scraping duplicates
  category text, -- e.g., 'Grains', 'Moulu'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table coffees enable row level security;

-- Everyone can read the coffee database
create policy "Coffees are viewable by everyone."
  on coffees for select
  using ( true );
