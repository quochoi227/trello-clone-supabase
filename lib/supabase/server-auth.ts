import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

type AuthSuccess = {
  success: true;
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: User;
};

type AuthFailure = {
  success: false;
  error: string;
};

export async function getServerClientAndUser(): Promise<AuthSuccess | AuthFailure> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      success: false,
      error: "You must be logged in",
    };
  }

  return { supabase, user, success: true };
}