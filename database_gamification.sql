-- 1. TRIGGER POUR LES NIVEAUX AUTOMATIQUES (LEVEL UP)
create or replace function update_user_level()
returns trigger as $$
begin
  if (new.points < 100) then
    new.level := 'Débutant';
  elsif (new.points < 500) then
    new.level := 'Amateur';
  elsif (new.points < 1000) then
    new.level := 'Passionné';
  elsif (new.points < 2500) then
    new.level := 'Expert';
  else
    new.level := 'Maître Coffee';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger on_points_change
  before update of points on profiles
  for each row execute procedure update_user_level();

-- 2. RÉCOMPENSER LES LIKES (Gagner des points quand on est liké)
create or replace function handle_points_for_likes()
returns trigger as $$
declare
  post_author_id uuid;
begin
  -- Trouver l'auteur du post qui a reçu le like
  select user_id into post_author_id from tastings where id = new.tasting_id;

  if (TG_OP = 'INSERT') then
    -- Gagner 5 points quand on reçoit un like
    update profiles set points = points + 5 where id = post_author_id;
  elsif (TG_OP = 'DELETE') then
    -- Perdre 5 points si le like est retiré
    update profiles set points = points - 5 where id = post_author_id;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger on_receive_like_points
  after insert or delete on likes
  for each row execute procedure handle_points_for_likes();

-- 3. RÉCOMPENSER LES FOLLOWS (Gagner des points quand on suit quelqu'un)
create or replace function handle_points_for_following()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    -- Gagner 10 points quand on suit quelqu'un (une seule fois par personne)
    update profiles set points = points + 10 where id = new.follower_id;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger on_follow_points
  after insert on follows
  for each row execute procedure handle_points_for_following();
