-- Vue pour calculer le profil aromatique moyen d'un barista
CREATE OR REPLACE VIEW public.user_taste_profiles AS
SELECT 
    user_id,
    COUNT(id) as total_tastings,
    AVG(rating_intensity) as avg_intensity,
    AVG(rating_acidity) as avg_acidity,
    AVG(rating_body) as avg_body,
    AVG(rating_aroma) as avg_aroma
FROM 
    public.tastings
GROUP BY 
    user_id;

-- RLS pour la vue
ALTER VIEW public.user_taste_profiles SET (security_invoker = on);
