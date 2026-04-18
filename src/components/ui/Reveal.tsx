"use client";

import { useReveal } from "@/hooks/useReveal";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number; // seconds
  className?: string;
  direction?: "up" | "left" | "right";
}

export function Reveal({
  children,
  delay = 0,
  className = "",
  direction = "up",
}: RevealProps) {
  const { ref, visible } = useReveal<HTMLDivElement>();

  const hidden =
    direction === "up"
      ? "translate-y-8 opacity-0"
      : direction === "left"
      ? "-translate-x-8 opacity-0"
      : "translate-x-8 opacity-0";

  return (
    <div
      ref={ref}
      style={{ transitionDelay: visible ? `${delay}s` : "0s" }}
      className={`transition-all duration-700 ease-out ${
        visible ? "translate-x-0 translate-y-0 opacity-100" : hidden
      } ${className}`}
    >
      {children}
    </div>
  );
}
