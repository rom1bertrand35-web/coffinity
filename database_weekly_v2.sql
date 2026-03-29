-- 1. MISE À JOUR DE LA TABLE WEEKLY_SELECTIONS POUR BARISTO
ALTER TABLE public.weekly_selections 
ADD COLUMN IF NOT EXISTS origins jsonb DEFAULT '[]'::jsonb, -- [{name: "Ethiopie", x: 45, y: 60}, ...]
ADD COLUMN IF NOT EXISTS baristo_tips text;

-- 2. AJOUT D'UNE COLONNE POUR IDENTIFIER LES POSTS OFFICIELS
ALTER TABLE public.tastings
ADD COLUMN IF NOT EXISTS is_official boolean DEFAULT false;
