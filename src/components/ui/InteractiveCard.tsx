"use client";

import { useRef, type MouseEvent, type ReactNode } from "react";

interface InteractiveCardProps {
  children: ReactNode;
  className?: string;
  as?: "article" | "div";
}

/**
 * Card with a radial gradient that follows the cursor (subtle "spotlight").
 * CSS handles the effect via CSS variables.
 */
export function InteractiveCard({
  children,
  className = "",
  as = "article",
}: InteractiveCardProps) {
  const ref = useRef<HTMLElement>(null);

  const onMouseMove = (e: MouseEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  const Tag = as as "article";
  return (
    <Tag
      ref={ref as React.RefObject<HTMLElement>}
      onMouseMove={onMouseMove}
      className={`card-hover ${className}`}
    >
      {children}
    </Tag>
  );
}
