"use client";

import { useReveal } from "@/hooks/useReveal";

interface SkillBarProps {
  name: string;
  value: number;
  accentClass: string;
  textClass: string;
}

export function SkillBar({ name, value, accentClass, textClass }: SkillBarProps) {
  const { ref, visible } = useReveal<HTMLLIElement>();

  return (
    <li ref={ref}>
      <div
        className={`font-[family-name:var(--font-label)] text-xs mb-2 uppercase tracking-widest ${textClass}`}
      >
        {name}
      </div>
      <div
        className="h-[4px] bg-surface-container-highest relative overflow-hidden"
        role="progressbar"
        aria-label={`${name} 숙련도`}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full ${accentClass} transition-[width] duration-[1200ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]`}
          style={{ width: visible ? `${value}%` : "0%" }}
        />
      </div>
    </li>
  );
}
