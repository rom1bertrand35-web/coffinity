-- 1. EXTENSION DE LA TABLE PROFILES POUR L'ONBOARDING PERSONNALISÉ
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS barista_type text,
ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{}'::jsonb;

-- 2. TABLE POUR LA SÉLECTION SIGNATURE DES CRÉATEURS (Hebdomadaire)
CREATE TABLE IF NOT EXISTS public.weekly_selections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_number INTEGER NOT NULL,
    year INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    coffee_ids UUID[] NOT NULL, -- Liste des IDs des cafés sélectionnés
    image_url TEXT, -- Optionnel, une image pour l'en-tête du post
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Activation RLS pour la lecture publique
ALTER TABLE public.weekly_selections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Selections are viewable by everyone" ON public.weekly_selections;
CREATE POLICY "Selections are viewable by everyone" 
ON public.weekly_selections FOR SELECT USING (true);
