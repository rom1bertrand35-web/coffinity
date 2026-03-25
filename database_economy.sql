-- 1. Ajout de la monnaie et de l'inventaire
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS coins integer DEFAULT 100,
ADD COLUMN IF NOT EXISTS inventory text[] DEFAULT '{short,none,tshirt,smile}';

-- 2. Mise à jour des récompenses (XP + Argent)
CREATE OR REPLACE FUNCTION handle_rewards_on_action()
RETURNS trigger AS $$
DECLARE
  author_id uuid;
BEGIN
  -- Cas : Nouvelle dégustation (Review)
  IF (TG_TABLE_NAME = 'tastings' AND TG_OP = 'INSERT') THEN
    UPDATE profiles SET 
      points = points + 20, -- XP
      coins = coins + 50    -- Argent (Bonus pour partage)
    WHERE id = NEW.user_id;
  
  -- Cas : Nouveau Like (L'auteur du post gagne)
  ELSIF (TG_TABLE_NAME = 'likes' AND TG_OP = 'INSERT') THEN
    SELECT user_id INTO author_id FROM tastings WHERE id = NEW.tasting_id;
    UPDATE profiles SET 
      points = points + 5,
      coins = coins + 10
    WHERE id = author_id;

  -- Cas : Nouveau Follower (On gagne des XP pour l'influence)
  ELSIF (TG_TABLE_NAME = 'follows' AND TG_OP = 'INSERT') THEN
    UPDATE profiles SET points = points + 10 WHERE id = NEW.follower_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Réinitialisation des triggers pour plus de propreté
DROP TRIGGER IF EXISTS on_tasting_reward ON tastings;
CREATE TRIGGER on_tasting_reward AFTER INSERT ON tastings FOR EACH ROW EXECUTE PROCEDURE handle_rewards_on_action();

DROP TRIGGER IF EXISTS on_like_reward ON likes;
CREATE TRIGGER on_like_reward AFTER INSERT ON likes FOR EACH ROW EXECUTE PROCEDURE handle_rewards_on_action();

DROP TRIGGER IF EXISTS on_follow_reward ON follows;
CREATE TRIGGER on_follow_reward AFTER INSERT ON follows FOR EACH ROW EXECUTE PROCEDURE handle_rewards_on_action();
