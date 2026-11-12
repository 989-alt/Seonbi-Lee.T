import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the auth session cookie on every request that matches
 * the proxy matcher. Without this, expired access tokens won't be
 * refreshed in Server Components.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Required to refresh token. Don't remove.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  if (!pathname.startsWith("/admin")) return response;

  const isMfaPage = pathname === "/admin/login/mfa";
  const isLoginPage = pathname === "/admin/login";
  const isAdminArea = !pathname.startsWith("/admin/login");

  // 2단계 인증을 등록했는데 이번 세션에서 아직 통과하지 않은 상태
  let mfaPending = false;
  if (user) {
    const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    mfaPending = data?.nextLevel === "aal2" && data.currentLevel !== "aal2";
  }

  const go = (path: string, keepRedirect?: string) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    url.search = "";
    if (keepRedirect) url.searchParams.set("redirect", keepRedirect);
    const res = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  };

  if (!user) {
    if (isAdminArea) return go("/admin/login", pathname);
    if (isMfaPage) return go("/admin/login");
    return response;
  }

  if (mfaPending) {
    if (isMfaPage) return response;
    return go("/admin/login/mfa", isAdminArea ? pathname : request.nextUrl.searchParams.get("redirect") ?? undefined);
  }

  if (isLoginPage || isMfaPage) return go("/admin");

  return response;
}
