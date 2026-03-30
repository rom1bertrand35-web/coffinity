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

/**
 * Checks if the user is allowed to post a new tasting today.
 * Rule: Unlimited for 1h after creation, then 2 per 24h.
 */
export async function checkTastingLimit(userId: string): Promise<{ 
  allowed: boolean; 
  remaining: number; 
  message?: string;
  isDiscoveryMode: boolean;
}> {
  if (!userId) return { allowed: false, remaining: 0, isDiscoveryMode: false };

  try {
    // 1. Get user creation date
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('created_at')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      // If profile or created_at is missing, we allow by default but warn
      console.warn("Profile not found for limit check, allowing access.");
      return { allowed: true, remaining: 2, isDiscoveryMode: false };
    }

    const createdAt = new Date(profile.created_at);
    const now = new Date();
    const diffHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

    // Discovery Mode: First hour is unlimited
    if (diffHours < 1) {
      return { allowed: true, remaining: 99, isDiscoveryMode: true };
    }

    // 2. Count tastings in the last 24 hours
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    
    const { count, error: countError } = await supabase
      .from('tastings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gt('created_at', twentyFourHoursAgo);

    if (countError) {
      console.error("Limit check count error:", countError);
      return { allowed: true, remaining: 1, isDiscoveryMode: false };
    }

    const dailyCount = count || 0;
    const remaining = Math.max(0, 2 - dailyCount);

    return {
      allowed: remaining > 0,
      remaining,
      isDiscoveryMode: false,
      message: remaining === 0 ? "Pause café ! Limite de 2 archives par jour atteinte." : undefined
    };
  } catch (err) {
    console.error("Tasting limit check error:", err);
    return { allowed: true, remaining: 1, isDiscoveryMode: false };
  }
}
