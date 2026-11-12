"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { logAdminEvent } from "@/lib/audit";

async function signOutAndLog(action: "logout" | "idle_logout") {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) await logAdminEvent(action, { email: user.email, userId: user.id });
  await supabase.auth.signOut();
}

export async function logoutAction() {
  await signOutAndLog("logout");
  redirect("/admin/login");
}

/** 일정 시간 조작이 없으면 IdleLogout이 호출한다. */
export async function idleLogoutAction() {
  await signOutAndLog("idle_logout");
  redirect("/admin/login?reason=idle");
}
