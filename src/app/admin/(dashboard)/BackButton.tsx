"use client";

import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="font-[family-name:var(--font-label)] text-xs text-on-surface-variant hover:text-primary tracking-widest uppercase"
    >
      ← 뒤로 가기
    </button>
  );
}
