import { supabase } from './supabase';

/**
 * Awards Beans (Points) to a user for an action.
 * Standardizes on the 'points' column in Supabase profiles.
 */
export async function awardBeans(userId: string, amount: number) {
  if (!userId || amount <= 0) return;

  try {
    // We use a manual update for now as we don't have a stored procedure 'increment'
    // but we use the existing 'points' column which is already in the DB.
    
    // 1. Fetch current points
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('points')
      .eq('id', userId)
      .single();

    if (fetchError || !profile) {
      console.error("Failed to fetch points:", fetchError);
      return;
    }

    const currentPoints = profile.points || 0;

    // 2. Update points
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ points: currentPoints + amount })
      .eq('id', userId);

    if (updateError) {
      console.error("Failed to update points:", updateError);
    } else {
      console.log(`✅ Successfully awarded ${amount} Beans to user ${userId}`);
    }
  } catch (err) {
    console.error("Economy error:", err);
  }
}
