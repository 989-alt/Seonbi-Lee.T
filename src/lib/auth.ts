import { createSupabaseServerClient } from "@/lib/supabase/server";

type ServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

/** 2단계 인증을 등록했는데 아직 이번 세션에서 통과하지 않았으면 true */
export async function needsMfa(supabase: ServerClient): Promise<boolean> {
  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error || !data) return false;
  return data.nextLevel === "aal2" && data.currentLevel !== "aal2";
}

/**
 * Returns the current user if authenticated, listed in admin_users,
 * and (when a 2FA factor is enrolled) verified with 2FA in this session.
 * Returns null otherwise.
 */
export async function getAdminUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;
  if (await needsMfa(supabase)) return null;

  const { data } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) return null;
  return user;
}
