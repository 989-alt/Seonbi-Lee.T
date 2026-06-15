"use client";

import { useState } from "react";
import type { ResourceRow } from "@/lib/repositories/types";

const ACCENT_BORDER: Record<string, string> = {
  primary: "border-primary",
  secondary: "border-secondary",
  tertiary: "border-tertiary",
};
const ACCENT_TEXT: Record<string, string> = {
  primary: "text-primary",
  secondary: "text-secondary",
  tertiary: "text-tertiary",
};
const ACCENT_BG_SOFT: Record<string, string> = {
  primary: "bg-primary/10",
  secondary: "bg-secondary/10",
  tertiary: "bg-tertiary/10",
};

export function ResourceAccordion({ resources }: { resources: ResourceRow[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4">
      {resources.map((r) => {
        const open = openId === r.id;
        const accent = ACCENT_TEXT[r.accent] ?? ACCENT_TEXT.primary;
        const border = ACCENT_BORDER[r.accent] ?? ACCENT_BORDER.primary;
        const linkCount = r.links?.length ?? 0;
        const promptCount = r.prompts?.length ?? 0;

        return (
          <div
            key={r.id}
            className={`bg-surface-container-low border-l-2 ${border} ${
              open ? "bg-surface-container-high" : "hover:bg-surface-container-high"
            } transition-colors`}
          >
            <button
              type="button"
              onClick={() => setOpenId(open ? null : r.id)}
              aria-expanded={open}
              aria-controls={`res-panel-${r.id}`}
              className="w-full text-left px-5 md:px-7 py-5 flex items-start justify-between gap-4 min-h-[44px]"
            >
              <div className="flex-grow">
                <h2
                  className={`font-[family-name:var(--font-headline)] text-xl md:text-2xl font-bold ${accent}`}
                >
                  {r.title}
                </h2>
                {r.description && (
                  <p className="mt-2 font-[family-name:var(--font-body)] text-on-surface-variant text-sm md:text-base leading-relaxed">
                    {r.description}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {linkCount > 0 && (
                    <span className="font-[family-name:var(--font-label)] text-[10px] tracking-widest uppercase text-outline border border-outline/30 px-2 py-0.5">
                      링크 {linkCount}
                    </span>
                  )}
                  {promptCount > 0 && (
                    <span className="font-[family-name:var(--font-label)] text-[10px] tracking-widest uppercase text-outline border border-outline/30 px-2 py-0.5">
                      프롬프트 {promptCount}
                    </span>
                  )}
                  {r.tags?.map((t) => (
                    <span
                      key={t}
                      className="font-[family-name:var(--font-label)] text-[10px] tracking-wider uppercase text-outline"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
              <span
                className={`shrink-0 font-[family-name:var(--font-label)] text-[11px] tracking-widest uppercase ${accent} flex items-center gap-2 mt-1`}
              >
                {open ? "닫기" : "보기"}
                <span
                  aria-hidden="true"
                  className={`inline-block transition-transform duration-200 ${
                    open ? "rotate-180" : ""
                  }`}
                >
                  ▾
                </span>
              </span>
            </button>

            {open && (
              <div
                id={`res-panel-${r.id}`}
                className="px-5 md:px-7 pb-7 pt-1 space-y-6"
              >
                {linkCount > 0 && (
                  <div className="space-y-3">
                    <div className="font-[family-name:var(--font-label)] text-[10px] text-outline tracking-[0.25em] uppercase">
                      // LINKS
                    </div>
                    <div className="flex flex-col gap-2">
                      {r.links.map((l, i) => (
                        <a
                          key={i}
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center justify-between gap-3 bg-surface-container-highest px-4 py-3 border border-outline-variant/20 hover:border-outline/50 transition-colors"
                        >
                          <span className="font-[family-name:var(--font-body)] text-on-surface text-sm md:text-base">
                            {l.label}
                          </span>
                          <span
                            className={`shrink-0 font-[family-name:var(--font-label)] text-[10px] tracking-widest uppercase ${accent}`}
                          >
                            {l.kind === "download" ? "다운로드 ↓" : "열기 ↗"}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {promptCount > 0 && (
                  <div className="space-y-3">
                    <div className="font-[family-name:var(--font-label)] text-[10px] text-outline tracking-[0.25em] uppercase">
                      // PROMPTS
                    </div>
                    <div className="flex flex-col gap-4">
                      {r.prompts.map((p, i) => (
                        <PromptBlock
                          key={i}
                          label={p.label}
                          text={p.text}
                          accentText={accent}
                          accentSoft={ACCENT_BG_SOFT[r.accent] ?? ACCENT_BG_SOFT.primary}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {linkCount === 0 && promptCount === 0 && (
                  <p className="font-[family-name:var(--font-body)] text-on-surface-variant text-sm">
                    등록된 링크·프롬프트가 없습니다.
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PromptBlock({
  label,
  text,
  accentText,
  accentSoft,
}: {
  label: string;
  text: string;
  accentText: string;
  accentSoft: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="bg-surface-container-highest border border-outline-variant/20">
      <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-outline-variant/20">
        <span
          className={`font-[family-name:var(--font-label)] text-[11px] tracking-widest uppercase ${accentText} ${accentSoft} px-2 py-0.5`}
        >
          {label || "PROMPT"}
        </span>
        <button
          type="button"
          onClick={copy}
          className={`font-[family-name:var(--font-label)] text-[10px] tracking-widest uppercase ${accentText} border border-current px-3 py-1 hover:opacity-80 transition-opacity min-h-[32px]`}
        >
          {copied ? "복사됨 ✓" : "복사"}
        </button>
      </div>
      <pre className="px-4 py-4 overflow-x-auto text-on-surface font-mono text-xs md:text-sm leading-relaxed whitespace-pre-wrap break-words">
        {text}
      </pre>
    </div>
  );
}
