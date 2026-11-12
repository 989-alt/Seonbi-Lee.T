import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

/**
 * Server Component / Server Action / Route Handler client.
 * Uses cookies to track auth session. Respects RLS.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component — cookies can only be set
            // from a Route Handler or Server Action. Safe to ignore.
          }
        },
      },
    }
  );
}

/**
 * Service-role client. BYPASSES RLS.
 * Use only for trusted admin operations (seeding, migrations, Storage writes).
 * NEVER import into client components.
 */
export function createSupabaseAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY 환경변수가 필요합니다.");
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

/**
 * 쿠키를 쓰지 않는 anon 클라이언트. RLS가 그대로 적용되므로 공개 자료만 읽힌다.
 * 요청과 무관해 캐시 함수 안에서도 쓸 수 있다.
 */
export function createSupabasePublicClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
