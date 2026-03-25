-- Ajouter une colonne pour stocker la configuration de l'avatar
alter table public.profiles 
add column if not exists avatar_config jsonb default '{
  "gender": "neutral",
  "hairStyle": "short",
  "hairColor": "#4B2C20",
  "facialHair": "none",
  "facialHairColor": "#4B2C20",
  "clothing": "tshirt",
  "clothingColor": "#E5E7EB",
  "skinColor": "#F3D2B3"
}'::jsonb;

-- Mettre à jour la fonction handle_new_user pour inclure une config par défaut
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url, avatar_config)
  values (
    new.id, 
    new.raw_user_meta_data->>'username', 
    '👤',
    '{
      "gender": "neutral",
      "hairStyle": "short",
      "hairColor": "#4B2C20",
      "facialHair": "none",
      "facialHairColor": "#4B2C20",
      "clothing": "tshirt",
      "clothingColor": "#E5E7EB",
      "skinColor": "#F3D2B3"
    }'::jsonb
  );
  return new;
end;
$$ language plpgsql security definer;
