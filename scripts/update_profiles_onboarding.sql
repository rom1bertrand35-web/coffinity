ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS barista_type text; ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{}'::jsonb;
