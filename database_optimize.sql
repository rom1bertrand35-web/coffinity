-- 1. Index pour les recherches rapides par utilisateur (Profils et Feed)
CREATE INDEX IF NOT EXISTS idx_tastings_user_id ON public.tastings(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_tasting_id ON public.likes(tasting_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);

-- 2. Index pour la recherche globale de cafés (Page Discover)
CREATE INDEX IF NOT EXISTS idx_coffees_name_trgm ON public.coffees USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_coffees_brand ON public.coffees(brand);

-- 3. Sécurité : On s'assure que les statistiques sont rapides à calculer
-- On pourrait ajouter des tables de stats agrégées plus tard pour le scale massif.
