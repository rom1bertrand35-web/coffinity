-- 1. TABLES DES BADGES
CREATE TABLE IF NOT EXISTS public.badges (
    id TEXT PRIMARY KEY, -- e.g. 'first_archive'
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL, -- Emoji or Lucide icon name
    criteria_type TEXT NOT NULL, -- 'tastings_count', 'followers_count', 'points_count'
    criteria_value INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_badges (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_id TEXT REFERENCES public.badges(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, badge_id)
);

-- 2. INSERTION DES BADGES DE BASE
INSERT INTO public.badges (id, name, description, icon, criteria_type, criteria_value)
VALUES 
    ('first_archive', 'Premier Archiviste', 'A partagé sa première dégustation.', '📖', 'tastings_count', 1),
    ('coffee_critic', 'Critique Gastronomique', 'A posté plus de 10 dégustations.', '🖋️', 'tastings_count', 10),
    ('social_barista', 'Social Barista', 'A atteint le palier des 10 followers.', '🦋', 'followers_count', 10),
    ('bean_rich', 'Riche en Grains', 'A accumulé plus de 500 Beans.', '💰', 'points_count', 500),
    ('master_brewer', 'Maître Brasseur', 'A posté plus de 50 dégustations.', '🏆', 'tastings_count', 50)
ON CONFLICT (id) DO NOTHING;

-- 3. TRIGGER POUR VÉRIFIER LES BADGES AUTOMATIQUEMENT
CREATE OR REPLACE FUNCTION public.check_user_badges()
RETURNS TRIGGER AS $$
BEGIN
    -- VÉRIFICATION TASTINGS COUNT
    IF (TG_TABLE_NAME = 'tastings') THEN
        -- Premier Archiviste
        IF NOT EXISTS (SELECT 1 FROM user_badges WHERE user_id = NEW.user_id AND badge_id = 'first_archive') THEN
            INSERT INTO user_badges (user_id, badge_id) VALUES (NEW.user_id, 'first_archive');
        END IF;
        
        -- Critique (10)
        IF (SELECT count(*) FROM tastings WHERE user_id = NEW.user_id) >= 10 THEN
            IF NOT EXISTS (SELECT 1 FROM user_badges WHERE user_id = NEW.user_id AND badge_id = 'coffee_critic') THEN
                INSERT INTO user_badges (user_id, badge_id) VALUES (NEW.user_id, 'coffee_critic');
            END IF;
        END IF;

    -- VÉRIFICATION FOLLOWERS
    ELSIF (TG_TABLE_NAME = 'profiles') THEN
        -- Social Barista (10)
        IF (NEW.followers_count >= 10) THEN
            IF NOT EXISTS (SELECT 1 FROM user_badges WHERE user_id = NEW.id AND badge_id = 'social_barista') THEN
                INSERT INTO user_badges (user_id, badge_id) VALUES (NEW.id, 'social_barista');
            END IF;
        END IF;
        
        -- Bean Rich (500)
        IF (NEW.points >= 500) THEN
            IF NOT EXISTS (SELECT 1 FROM user_badges WHERE user_id = NEW.id AND badge_id = 'bean_rich') THEN
                INSERT INTO user_badges (user_id, badge_id) VALUES (NEW.id, 'bean_rich');
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Installation des triggers
DROP TRIGGER IF EXISTS on_tasting_badge ON tastings;
CREATE TRIGGER on_tasting_badge AFTER INSERT ON tastings FOR EACH ROW EXECUTE FUNCTION public.check_user_badges();

DROP TRIGGER IF EXISTS on_profile_badge ON profiles;
CREATE TRIGGER on_profile_badge AFTER UPDATE OF followers_count, points ON profiles FOR EACH ROW EXECUTE FUNCTION public.check_user_badges();
