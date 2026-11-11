/** 썸네일 경로 → URL. "/"로 시작하면 사이트 내 정적 파일, 아니면 Supabase Storage 키 */
export function assetUrl(path: string | null, supabaseBase: string | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("/")) return path;
  if (!supabaseBase) return null;
  return `${supabaseBase}/storage/v1/object/public/project-thumbs/${path}`;
}
