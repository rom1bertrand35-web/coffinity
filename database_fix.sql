-- In case the trigger was created before profiles table, or if users were created without profiles:
-- 1. Create missing profiles for existing users
INSERT INTO public.profiles (id, username, avatar_url)
SELECT id, COALESCE(raw_user_meta_data->>'username', 'User_' || substr(id::text, 1, 6)), '☕️'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);
