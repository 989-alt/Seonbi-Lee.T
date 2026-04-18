import { type ReactNode } from "react";

interface SectionHeadingProps {
  children: ReactNode;
  accent?: "primary" | "secondary" | "tertiary";
  as?: "h1" | "h2" | "h3";
}

const ACCENT_BG: Record<NonNullable<SectionHeadingProps["accent"]>, string> = {
  primary: "bg-primary",
  secondary: "bg-secondary",
  tertiary: "bg-tertiary",
};

export function SectionHeading({
  children,
  accent = "primary",
  as = "h2",
}: SectionHeadingProps) {
  const Tag = as;
  return (
    <Tag className="font-[family-name:var(--font-headline)] text-2xl tracking-widest uppercase text-on-surface mb-12 flex items-center gap-4">
      <span
        aria-hidden="true"
        className={`w-8 h-[2px] block ${ACCENT_BG[accent]}`}
      />
      {children}
    </Tag>
  );
}
