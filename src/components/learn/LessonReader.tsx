"use client";

import { useMemo, useState } from "react";
import { Markdown } from "@/components/ui/Markdown";
import type { ResourceRow, ResourceLevel } from "@/lib/repositories/types";
import { LEVEL_LABEL, LEVEL_ORDER, LEVEL_TAG } from "@/lib/repositories/types";

const ACCENT = "#4f9aa1";

const pad2 = (n: number) => String(n).padStart(2, "0");

export function LessonReader({ lessons }: { lessons: ResourceRow[] }) {
  const levels = useMemo(
    () => LEVEL_ORDER.filter((lv) => lessons.some((l) => l.level === lv)),
    [lessons]
  );

  const byLevel = useMemo(() => {
    const map = new Map<ResourceLevel, ResourceRow[]>();
    levels.forEach((lv) => map.set(lv, lessons.filter((l) => l.level === lv)));
    return map;
  }, [levels, lessons]);

  const flat = useMemo(
    () => levels.flatMap((lv) => byLevel.get(lv) ?? []),
    [levels, byLevel]
  );

  const [currentId, setCurrentId] = useState<string | null>(flat[0]?.id ?? null);
  const [expanded, setExpanded] = useState<Set<ResourceLevel>>(() => {
    const first = flat[0]?.level;
    return new Set<ResourceLevel>(first ? [first] : []);
  });
  // 기본 접힘: 사용자가 '펼치기'를 눌러 읽기를 선택할 때만 리더(본문) 노출
  const [readerOpen, setReaderOpen] = useState(false);

  if (levels.length === 0 || !currentId) {
    return (
      <p className="text-on-surface-variant font-[family-name:var(--font-body)]">
        아직 공개된 학습 자료가 없습니다.
      </p>
    );
  }

  const current = flat.find((l) => l.id === currentId) ?? flat[0];
  const currentLevel = (current.level ?? levels[0]) as ResourceLevel;
  const chapterLessons = byLevel.get(currentLevel) ?? [];
  const idxInChapter = chapterLessons.findIndex((l) => l.id === current.id);
  const flatIdx = flat.findIndex((l) => l.id === current.id);
  const prev = flatIdx > 0 ? flat[flatIdx - 1] : null;
  const next = flatIdx < flat.length - 1 ? flat[flatIdx + 1] : null;
  const linkCount = current.links?.length ?? 0;
  const promptCount = current.prompts?.length ?? 0;

  function goTo(lesson: ResourceRow) {
    setCurrentId(lesson.id);
    const lv = lesson.level;
    if (lv) {
      setExpanded((prevSet) => {
        if (prevSet.has(lv)) return prevSet;
        const n = new Set(prevSet);
        n.add(lv);
        return n;
      });
    }
  }

  function toggleChapter(lv: ResourceLevel) {
    setExpanded((prevSet) => {
      const n = new Set(prevSet);
      if (n.has(lv)) n.delete(lv);
      else n.add(lv);
      return n;
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setReaderOpen((v) => !v)}
        aria-expanded={readerOpen}
        className={`block w-full text-left bg-surface-container-low border-t-2 p-6 hover:bg-surface-container-high transition-colors ${
          readerOpen ? "mb-6" : ""
        }`}
        style={{ borderTopColor: ACCENT }}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-[family-name:var(--font-headline)] text-lg font-bold text-on-surface mb-2">
              클로드 학습 로드맵
            </h3>
            <p className="text-on-surface-variant text-sm">
              입문부터 심화까지 단계별 학습 자료 {flat.length}개 · 눌러서 {readerOpen ? "접기" : "펼쳐 보기"}
            </p>
          </div>
          <span
            aria-hidden="true"
            className="shrink-0 text-xl transition-transform duration-200"
            style={{ color: ACCENT, transform: readerOpen ? "rotate(180deg)" : "none" }}
          >
            ▾
          </span>
        </div>
      </button>

      {readerOpen && (
        <>
      <style>{`@keyframes lr-page-in{from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:none}}`}</style>

      <div className="grid grid-cols-1 md:grid-cols-[248px_1fr] border border-outline-variant/30">
        {/* SIDEBAR / TOC */}
        <aside className="border-b md:border-b-0 md:border-r border-outline-variant/30 py-4">
          <div className="font-[family-name:var(--font-label)] text-[10px] tracking-[0.25em] uppercase text-outline px-4 pb-3">
            // 목차 · INDEX
          </div>
          <nav aria-label="목차">
            {levels.map((lv) => {
              const isOpen = expanded.has(lv);
              const isCurrentChapter = lv === currentLevel;
              const chLessons = byLevel.get(lv) ?? [];
              return (
                <div key={lv} className="px-2">
                  <button
                    type="button"
                    onClick={() => toggleChapter(lv)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center gap-2 px-2 py-2.5 text-left"
                    style={
                      isCurrentChapter
                        ? {
                            borderLeft: `2px solid ${ACCENT}`,
                            background: `linear-gradient(90deg, color-mix(in srgb, ${ACCENT} 7%, transparent), transparent 80%)`,
                          }
                        : { borderLeft: "2px solid transparent" }
                    }
                  >
                    <span
                      className="font-[family-name:var(--font-label)] text-[9px] tracking-wider"
                      style={{ color: isCurrentChapter ? ACCENT : "var(--color-outline)" }}
                    >
                      {LEVEL_TAG[lv].split(" / ")[0]}
                    </span>
                    <span
                      className={`font-[family-name:var(--font-headline)] text-[13px] font-bold uppercase ${
                        isCurrentChapter ? "text-on-surface" : "text-on-surface-variant"
                      }`}
                    >
                      {LEVEL_LABEL[lv]}
                    </span>
                    <span className="ml-auto text-[10px] text-outline">{isOpen ? "▾" : "▸"}</span>
                  </button>
                  {isOpen && (
                    <ul className="pb-2 pl-4">
                      {chLessons.map((l) => {
                        const isCur = l.id === current.id;
                        return (
                          <li key={l.id}>
                            <button
                              type="button"
                              onClick={() => goTo(l)}
                              aria-current={isCur ? "step" : undefined}
                              className={`w-full text-left flex items-center gap-2.5 px-2.5 py-1.5 text-[12.5px] ${
                                isCur ? "text-on-surface" : "text-on-surface-variant hover:text-on-surface"
                              }`}
                            >
                              <span
                                className="inline-block w-[5px] h-[5px] shrink-0"
                                style={
                                  isCur
                                    ? { background: ACCENT, border: `1px solid ${ACCENT}` }
                                    : { border: "1px solid var(--color-outline)" }
                                }
                              />
                              {l.title}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        {/* READING PANE */}
        <article className="px-5 md:px-8 py-7 overflow-hidden">
          <div key={current.id} style={{ animation: "lr-page-in 0.35s cubic-bezier(0.2,0.8,0.2,1)" }}>
            <div
              className="font-[family-name:var(--font-label)] text-[11px] tracking-[0.22em] uppercase mb-2.5"
              style={{ color: ACCENT }}
            >
              {LEVEL_LABEL[currentLevel]} · 책갈피 {pad2(idxInChapter + 1)} / {pad2(chapterLessons.length)}
            </div>
            <h2 className="font-[family-name:var(--font-headline)] text-2xl md:text-3xl font-bold text-on-surface mb-4 leading-tight">
              {current.title}
            </h2>
            {current.description && (
              <p className="font-[family-name:var(--font-body)] text-on-surface-variant text-sm md:text-base leading-relaxed mb-5">
                {current.description}
              </p>
            )}

            {current.body_md && (
              <div className="mb-6">
                <Markdown>{current.body_md}</Markdown>
              </div>
            )}

            {linkCount > 0 && (
              <div className="space-y-3 mb-6">
                <div className="font-[family-name:var(--font-label)] text-[10px] text-outline tracking-[0.25em] uppercase">
                  // LINKS
                </div>
                <div className="flex flex-col gap-2">
                  {current.links.map((l, i) => (
                    <a
                      key={i}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between gap-3 bg-surface-container-high px-4 py-3 border border-outline-variant/20 hover:border-outline/50 transition-colors"
                    >
                      <span className="font-[family-name:var(--font-body)] text-on-surface text-sm md:text-base">
                        {l.label}
                      </span>
                      <span
                        className="shrink-0 font-[family-name:var(--font-label)] text-[10px] tracking-widest uppercase"
                        style={{ color: ACCENT }}
                      >
                        {l.kind === "download" ? "다운로드 ↓" : "열기 ↗"}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {promptCount > 0 && (
              <div className="space-y-3 mb-6">
                <div className="font-[family-name:var(--font-label)] text-[10px] text-outline tracking-[0.25em] uppercase">
                  // PROMPTS
                </div>
                <div className="flex flex-col gap-4">
                  {current.prompts.map((p, i) => (
                    <PromptBlock key={i} label={p.label} text={p.text} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* PAGER */}
          <div className="flex items-center justify-between gap-4 border-t border-outline-variant/30 mt-2 pt-4">
            <button
              type="button"
              disabled={!prev}
              onClick={() => prev && goTo(prev)}
              className="flex flex-col items-start gap-0.5 disabled:opacity-30 text-left max-w-[40%]"
            >
              <span className="font-[family-name:var(--font-label)] text-[10px] tracking-widest uppercase" style={{ color: ACCENT }}>
                ◀ 이전
              </span>
              {prev && <span className="text-[12px] text-on-surface-variant truncate max-w-full">{prev.title}</span>}
            </button>
            <span className="font-[family-name:var(--font-label)] text-[11px] tracking-widest text-outline shrink-0">
              {pad2(idxInChapter + 1)} / {pad2(chapterLessons.length)}
            </span>
            <button
              type="button"
              disabled={!next}
              onClick={() => next && goTo(next)}
              className="flex flex-col items-end gap-0.5 disabled:opacity-30 text-right max-w-[40%]"
            >
              <span className="font-[family-name:var(--font-label)] text-[10px] tracking-widest uppercase" style={{ color: ACCENT }}>
                다음 ▶
              </span>
              {next && <span className="text-[12px] text-on-surface-variant truncate max-w-full">{next.title}</span>}
            </button>
          </div>
          <div className="h-[2px] bg-outline-variant/30 mt-3">
            <div
              className="h-[2px]"
              style={{ width: `${((idxInChapter + 1) / chapterLessons.length) * 100}%`, background: ACCENT }}
            />
          </div>
        </article>
      </div>
        </>
      )}
    </div>
  );
}

function PromptBlock({ label, text }: { label: string; text: string }) {
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
          className="font-[family-name:var(--font-label)] text-[11px] tracking-widest uppercase px-2 py-0.5"
          style={{ color: ACCENT, backgroundColor: `color-mix(in srgb, ${ACCENT} 12%, transparent)` }}
        >
          {label || "PROMPT"}
        </span>
        <button
          type="button"
          onClick={copy}
          className="font-[family-name:var(--font-label)] text-[10px] tracking-widest uppercase border border-current px-3 py-1 hover:opacity-80 transition-opacity min-h-[32px]"
          style={{ color: ACCENT }}
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
