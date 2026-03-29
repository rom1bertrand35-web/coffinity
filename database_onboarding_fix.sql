-- 1. AJOUT DU FLAG D'ONBOARDING
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_onboarded boolean DEFAULT false;

-- 2. MISE À JOUR DU TRIGGER POUR LES NOUVEAUX UTILISATEURS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, points, has_onboarded)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'username', 
    '☕️', 
    0, -- On donnera les 100 Beans lors de l'onboarding
    false
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
