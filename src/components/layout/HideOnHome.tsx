"use client";

import { usePathname } from "next/navigation";

/** 홈(런처)과 앱 실행 화면(/play)은 자체 상단 바를 쓰므로 공용 머리·바닥을 숨긴다 */
export function HideOnHome({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return path === "/" || path.startsWith("/play/") ? null : <>{children}</>;
}
