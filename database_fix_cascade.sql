-- 1. Assurer la cascade de suppression pour les LIKES
ALTER TABLE public.likes 
DROP CONSTRAINT IF EXISTS likes_tasting_id_fkey,
ADD CONSTRAINT likes_tasting_id_fkey 
  FOREIGN KEY (tasting_id) 
  REFERENCES tastings(id) 
  ON DELETE CASCADE;

-- 2. Assurer la cascade de suppression pour les FOLLOWS (Profil supprimé)
ALTER TABLE public.follows 
DROP CONSTRAINT IF EXISTS follows_follower_id_fkey,
ADD CONSTRAINT follows_follower_id_fkey 
  FOREIGN KEY (follower_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;

ALTER TABLE public.follows 
DROP CONSTRAINT IF EXISTS follows_following_id_fkey,
ADD CONSTRAINT follows_following_id_fkey 
  FOREIGN KEY (following_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;
