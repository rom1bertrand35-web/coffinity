-- MISE À JOUR DU SYSTÈME DE GRADES FUN (XP BASED)
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS trigger AS $$
BEGIN
    IF (NEW.points < 100) THEN
        NEW.level := 'Grain Vert 🌱';
    ELSIF (NEW.points < 300) THEN
        NEW.level := 'Jus de Chaussette 🧦';
    ELSIF (NEW.points < 700) THEN
        NEW.level := 'Stagiaire Perco 🧼';
    ELSIF (NEW.points < 1500) THEN
        NEW.level := 'Apprenti Mousse 🥛';
    ELSIF (NEW.points < 3000) THEN
        NEW.level := 'Barista du Dimanche ☕';
    ELSIF (NEW.points < 6000) THEN
        NEW.level := 'Torréfacteur de Garage 🔥';
    ELSIF (NEW.points < 12000) THEN
        NEW.level := 'Maître de la Crema ✨';
    ELSIF (NEW.points < 25000) THEN
        NEW.level := 'Sommelier du Grain 🕵️';
    ELSIF (NEW.points < 50000) THEN
        NEW.level := 'Empereur de l''Expresso 👑';
    ELSE
        NEW.level := 'Dieu de la Caféine ⚡';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ré-attacher le trigger s'il n'existe pas déjà sur les bonnes colonnes
DROP TRIGGER IF EXISTS on_points_update ON public.profiles;
CREATE TRIGGER on_points_update
BEFORE UPDATE OF points ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_user_level();

-- Mise à jour immédiate de tous les profils existants pour appliquer les nouveaux noms
UPDATE public.profiles SET updated_at = now();
