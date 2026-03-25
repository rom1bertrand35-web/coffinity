-- Function to increment user points
create or replace function public.increment_points(user_id_param uuid, points_to_add integer)
returns void as $$
begin
  update public.profiles
  set points = points + points_to_add
  where id = user_id_param;
end;
$$ language plpgsql security definer;
