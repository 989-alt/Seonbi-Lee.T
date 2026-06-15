export function slugify(input: string): string {
  return (input ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

export function fallbackSlug(prefix = "item"): string {
  return `${prefix}-${Date.now().toString(36)}`;
}

/** Returns a unique slug. `exists` must report whether a candidate is already taken. */
export async function uniqueSlug(
  base: string,
  exists: (candidate: string) => Promise<boolean>,
  prefix = "item",
): Promise<string> {
  const root = slugify(base) || fallbackSlug(prefix);
  if (!(await exists(root))) return root;
  for (let i = 2; i <= 50; i++) {
    const candidate = `${root}-${i}`;
    if (!(await exists(candidate))) return candidate;
  }
  return `${root}-${Date.now().toString(36)}`;
}
