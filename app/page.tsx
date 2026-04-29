import { createClient } from "@/lib/supabase/server";
import FeedView from "@/components/FeedView";
import LandingPage from "./landing/page";

export const dynamic = "force-dynamic";
export const revalidate = 60; 

export default async function HomePage() {
  const supabase = await createClient();
  
  // 1. Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();

  // 2. If no user, show Landing Page
  if (!user) {
    return <LandingPage />;
  }

  // 3. If authenticated, show Feed View
  return <FeedView currentUserId={user.id} />;
}
