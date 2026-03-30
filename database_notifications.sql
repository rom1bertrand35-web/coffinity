-- 1. TABLE DES NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- Le destinataire
    actor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- Celui qui fait l'action
    type TEXT NOT NULL, -- 'like', 'follow', 'comment'
    tasting_id BIGINT REFERENCES public.tastings(id) ON DELETE CASCADE, -- Optionnel (pour like/comment)
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- 2. TRIGGER POUR CRÉER LES NOTIFICATIONS AUTOMATIQUEMENT
CREATE OR REPLACE FUNCTION public.handle_new_notification()
RETURNS TRIGGER AS $$
DECLARE
    target_user_id UUID;
BEGIN
    -- GESTION DES LIKES
    IF (TG_TABLE_NAME = 'likes') THEN
        SELECT user_id INTO target_user_id FROM tastings WHERE id = NEW.tasting_id;
        -- On ne se notifie pas soi-même
        IF (target_user_id != NEW.user_id) THEN
            INSERT INTO public.notifications (user_id, actor_id, type, tasting_id)
            VALUES (target_user_id, NEW.user_id, 'like', NEW.tasting_id);
        END IF;

    -- GESTION DES FOLLOWS
    ELSIF (TG_TABLE_NAME = 'follows') THEN
        INSERT INTO public.notifications (user_id, actor_id, type)
        VALUES (NEW.following_id, NEW.follower_id, 'follow');

    -- GESTION DES COMMENTAIRES
    ELSIF (TG_TABLE_NAME = 'comments') THEN
        SELECT user_id INTO target_user_id FROM tastings WHERE id = NEW.tasting_id;
        IF (target_user_id != NEW.user_id) THEN
            INSERT INTO public.notifications (user_id, actor_id, type, tasting_id)
            VALUES (target_user_id, NEW.user_id, 'comment', NEW.tasting_id);
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Installation des triggers de notification
DROP TRIGGER IF EXISTS on_like_notification ON likes;
CREATE TRIGGER on_like_notification AFTER INSERT ON likes FOR EACH ROW EXECUTE FUNCTION public.handle_new_notification();

DROP TRIGGER IF EXISTS on_follow_notification ON follows;
CREATE TRIGGER on_follow_notification AFTER INSERT ON follows FOR EACH ROW EXECUTE FUNCTION public.handle_new_notification();

DROP TRIGGER IF EXISTS on_comment_notification ON comments;
CREATE TRIGGER on_comment_notification AFTER INSERT ON comments FOR EACH ROW EXECUTE FUNCTION public.handle_new_notification();
