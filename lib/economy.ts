import { supabase } from './supabase';

export async function awardBeans(userId: string, amount: number) {
  if (!userId || amount <= 0) return;

  try {
    // 1. Fetch current beans
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('coins')
      .eq('id', userId)
      .single();

    if (fetchError || !profile) {
      console.error("Failed to fetch beans:", fetchError);
      return;
    }

    const currentCoins = profile.coins || 0;

    // 2. Add new beans
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ coins: currentCoins + amount })
      .eq('id', userId);

    if (updateError) {
      console.error("Failed to update beans:", updateError);
    }
  } catch (err) {
    console.error("Economy error:", err);
  }
}
