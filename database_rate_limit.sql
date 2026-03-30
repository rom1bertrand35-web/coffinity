-- 1. S'ASSURER QUE LA TABLE PROFILES A UNE DATE DE CRÉATION
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

-- 2. FONCTION DE LIMITATION ANTI-ABUS
CREATE OR REPLACE FUNCTION public.check_tasting_limit()
RETURNS trigger AS $$
DECLARE
    user_created_at timestamp with time zone;
    tastings_today integer;
BEGIN
    -- Récupérer la date de création du profil de l'utilisateur qui insère
    SELECT created_at INTO user_created_at FROM public.profiles WHERE id = NEW.user_id;
    
    -- Règle 1 : Moins d'une heure depuis l'inscription -> ILLIMITÉ
    IF (now() - user_created_at < interval '1 hour') THEN
        RETURN NEW;
    END IF;
    
    -- Règle 2 : Après une heure -> Limite de 2 par 24 heures glissantes
    SELECT count(*) INTO tastings_today 
    FROM public.tastings 
    WHERE user_id = NEW.user_id 
    AND created_at > (now() - interval '24 hours');
    
    IF (tastings_today >= 2) THEN
        RAISE EXCEPTION 'PAUSE CAFÉ ! ☕️ Ta période de découverte illimitée (1h) est terminée. Tu peux désormais archiver 2 cafés par jour maximum pour garder un palais affûté !';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. ATTACHER LE TRIGGER À LA TABLE TASTINGS
DROP TRIGGER IF EXISTS tr_check_tasting_limit ON public.tastings;
CREATE TRIGGER tr_check_tasting_limit
BEFORE INSERT ON public.tastings
FOR EACH ROW EXECUTE FUNCTION public.check_tasting_limit();
