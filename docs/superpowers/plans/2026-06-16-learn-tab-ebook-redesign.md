# 배우기(/learn) 탭 개편 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/learn` 페이지의 "단계별 학습"을 전자책 리더(목차 사이드바+본문)로, "스킬 갤러리"를 태그 다중필터(AND)+상위8개+펼치기로 바꾼다. 강조색은 차분한 틸 `#4f9aa1`.

**Architecture:** 신규 클라이언트 컴포넌트 2개(`LessonReader`, `SkillsGallery`)를 만들고, 기존 `/learn/page.tsx`의 해당 두 섹션만 교체한다. 그 외 기존 컴포넌트(`ResourceAccordion`, `LearnBrowser`, 코스 페이지 등)는 **절대 수정하지 않는다**. 기존 공용 UI(`@/components/ui/Markdown`)와 타입 상수(`LEVEL_*`)는 수정 없이 import만 한다.

**Tech Stack:** Next.js 16.2.4, React 19.2.4, Tailwind CSS v4 (arbitrary values + `@theme` CSS vars), react-markdown(기존 Markdown 컴포넌트 경유).

---

## 절대 제약 (사용자 명시: "기존 코드와 다른 컴포넌트는 절대 건드리지 말 것")

- **신규 파일 2개**만 생성: `src/components/learn/LessonReader.tsx`, `src/components/learn/SkillsGallery.tsx`
- **기존 파일은 `src/app/learn/page.tsx` 하나만** 수정(두 섹션 교체 + 그로 인해 생긴 orphan import 정리).
- 다음은 **열어보지도/수정도 하지 않음:** `ResourceAccordion.tsx`, `LearnBrowser.tsx`(파일 그대로 둠, import만 끊김), `src/app/learn/[slug]/page.tsx`, 그 외 모든 컴포넌트, `globals.css`, `package.json`, `tsconfig.json`.
- 읽기 전용 재사용(수정 금지): `@/components/ui/Markdown`, `@/components/ui/Reveal`, `@/lib/repositories/types`.
- 색감: 네온 단색 채움/제목 네온/글로우 금지. 강조색 `#4f9aa1`은 활성 책갈피·현재 점·작은 라벨·진행바·활성 태그칩에만(얇게).

## 검증 방식 (이 저장소엔 테스트 러너가 없음)

`package.json` scripts는 `dev/build/start`뿐이고 jest/vitest/testing-library가 없다. 사용자 제약("기존 코드 미변경", "단순함 우선")상 **테스트 프레임워크를 새로 추가하지 않는다.** 대신 각 작업의 게이트는:

1. **`npx tsc --noEmit`** — 타입 에러 0 (주 게이트, env 불필요)
2. 통합 후 **`npm run build`** 시도 — 코드 오류 없는지 확인(Supabase env 없으면 데이터 단계에서 실패할 수 있는데, 그건 코드 결함 아님 → 컴파일/타입/번들 단계까지 통과하면 OK로 간주하고 로그로 구분)
3. 최종 **수동 확인**: `npm run dev` 후 `http://localhost:3000/learn` 육안 확인(사용자).

> Next.js 커스텀 빌드 주의(루트 AGENTS.md): Next 고유 API가 필요해지면 `node_modules/next/dist/docs/`를 먼저 확인. 단, 본 작업은 표준 React 클라이언트 컴포넌트(`"use client"` + useState/useMemo)라 별도 Next API는 쓰지 않는다.

## File Structure

```
생성:
  src/components/learn/SkillsGallery.tsx   — 태그 다중필터(AND) + 상위8개 + 펼치기. 카드 마크업은 기존과 동일.
  src/components/learn/LessonReader.tsx    — 목차 사이드바(토글) + 본문(페이지) + ◀▶ 넘김. 본문 렌더 자체 구현(내부 PromptBlock 포함).
수정(1개):
  src/app/learn/page.tsx                   — LEARNING PATH/SKILLS GALLERY 섹션 내용만 신규 컴포넌트로 교체.
```

---

## Task 1: SkillsGallery 컴포넌트

**Files:**
- Create: `src/components/learn/SkillsGallery.tsx`

**맥락:** 현재 `/learn/page.tsx`의 SKILLS GALLERY 섹션은 `gallery` 배열을 카드 그리드로 그대로 출력하고 태그는 표시만 한다(필터 없음). 이 컴포넌트는 같은 카드 모양을 유지하되 ① 태그 다중선택(AND) 필터, ② 상위 8개만 노출 후 "펼치기"로 나머지 표시를 추가한다. `gallery`는 `ResourceRow[]`(kind=gallery, 게시됨)로 부모가 주입한다.

- [ ] **Step 1: 컴포넌트 파일 생성 (전체 코드)**

```tsx
"use client";

import { useMemo, useState } from "react";
import type { ResourceRow } from "@/lib/repositories/types";

const ACCENT = "#4f9aa1";
const INITIAL_VISIBLE = 8;

export function SkillsGallery({ gallery }: { gallery: ResourceRow[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState(false);

  // 모든 태그: 사용 빈도 desc, 동률이면 가나다/알파벳 순
  const allTags = useMemo(() => {
    const counts = new Map<string, number>();
    gallery.forEach((g) =>
      g.tags?.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1))
    );
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([t]) => t);
  }, [gallery]);

  // AND 필터: 선택한 태그를 모두 포함한 항목만
  const filtered = useMemo(() => {
    if (selected.size === 0) return gallery;
    return gallery.filter((g) => {
      const tags = new Set(g.tags ?? []);
      for (const t of selected) if (!tags.has(t)) return false;
      return true;
    });
  }, [gallery, selected]);

  const visible = expanded ? filtered : filtered.slice(0, INITIAL_VISIBLE);
  const hiddenCount = filtered.length - INITIAL_VISIBLE;

  function toggleTag(tag: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
    setExpanded(false);
  }

  function clearTags() {
    setSelected(new Set());
    setExpanded(false);
  }

  if (gallery.length === 0) {
    return (
      <p className="text-on-surface-variant font-[family-name:var(--font-body)] text-sm">
        아직 등록된 스킬이 없습니다.
      </p>
    );
  }

  const activeChip = {
    color: ACCENT,
    borderColor: ACCENT,
    backgroundColor: `color-mix(in srgb, ${ACCENT} 12%, transparent)`,
  } as const;

  return (
    <div>
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            type="button"
            onClick={clearTags}
            aria-pressed={selected.size === 0}
            className={`font-[family-name:var(--font-label)] uppercase tracking-wider text-[11px] px-3 py-1.5 border transition-colors ${
              selected.size === 0 ? "" : "text-on-surface-variant border-outline-variant/30 hover:border-outline"
            }`}
            style={selected.size === 0 ? activeChip : undefined}
          >
            전체
          </button>
          {allTags.map((t) => {
            const on = selected.has(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => toggleTag(t)}
                aria-pressed={on}
                className={`font-[family-name:var(--font-label)] uppercase tracking-wider text-[11px] px-3 py-1.5 border transition-colors ${
                  on ? "" : "text-on-surface-variant border-outline-variant/30 hover:border-outline"
                }`}
                style={on ? activeChip : undefined}
              >
                #{t}{on ? " ✕" : ""}
              </button>
            );
          })}
        </div>
      )}

      <div className="font-[family-name:var(--font-label)] text-[10px] text-outline tracking-widest uppercase mb-6">
        표시 {visible.length} / 전체 {gallery.length}
        {selected.size > 0 ? ` · 필터 ${selected.size}개 (모두 포함)` : ""}
      </div>

      {filtered.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visible.map((g) => {
              const url = g.links?.[0]?.url ?? "#";
              return (
                <a
                  key={g.id}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-surface-container-low border-t-2 border-secondary p-6 hover:bg-surface-container-high transition-colors"
                >
                  <h3 className="font-[family-name:var(--font-headline)] text-lg font-bold text-on-surface mb-2">
                    {g.title}
                  </h3>
                  <p className="text-on-surface-variant text-sm">{g.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {g.tags?.map((t) => {
                      const on = selected.has(t);
                      return (
                        <span
                          key={t}
                          className="font-[family-name:var(--font-label)] text-[10px] uppercase tracking-wider text-outline border border-outline-variant/30 px-2 py-0.5"
                          style={on ? { color: ACCENT, borderColor: ACCENT } : undefined}
                        >
                          #{t}
                        </span>
                      );
                    })}
                  </div>
                </a>
              );
            })}
          </div>

          {filtered.length > INITIAL_VISIBLE && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              className="mt-4 w-full flex items-center justify-center gap-2 font-[family-name:var(--font-label)] text-xs tracking-widest uppercase py-4 border border-dashed transition-opacity hover:opacity-80"
              style={{ color: ACCENT, borderColor: `color-mix(in srgb, ${ACCENT} 45%, var(--color-outline-variant))` }}
            >
              {expanded ? "접기 ▲" : `펼치기 ▾ · ${hiddenCount}개 더 보기`}
            </button>
          )}
        </>
      ) : (
        <p className="text-on-surface-variant font-[family-name:var(--font-body)] py-8 text-sm">
          이 조건에 해당하는 스킬이 없습니다.
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 0 (이 파일 관련 에러 없음).

- [ ] **Step 3: 커밋**

```bash
git add src/components/learn/SkillsGallery.tsx
git commit -m "feat(learn): SkillsGallery — 태그 다중필터(AND) + 상위8개 + 펼치기"
```

---

## Task 2: LessonReader 컴포넌트

**Files:**
- Create: `src/components/learn/LessonReader.tsx`

**맥락:** 현재 `/learn`의 학습 경로는 `LearnBrowser`→`ResourceAccordion`(레벨 탭 + 태그 필터 + 한 개씩 토글 아코디언)이다. 이를 전자책 리더로 교체한다. 책 매핑: **챕터=레벨**(`LEVEL_ORDER` 중 데이터 있는 것만, `LEVEL_LABEL`/`LEVEL_TAG` 재사용), **페이지=레슨**. 좌측 목차(챕터 토글, 기본 접힘·현재 챕터만 펼침), 우측 본문(제목·설명·body_md·링크·프롬프트). 하단 ◀▶는 전 레벨 레슨을 `LEVEL_ORDER` 순으로 평탄화한 전체 시퀀스를 따라가며(챕터 경계 넘으면 그 챕터 자동 펼침), `02/05` 카운터·진행바는 현재 챕터 내 위치. 본문 렌더는 **자체 구현**하며 `@/components/ui/Markdown`만 수정 없이 사용. 프롬프트 복사 블록은 같은 파일 내 비공개 `PromptBlock`으로 작성(기존 ResourceAccordion과 중복은 제약상 수용).

- [ ] **Step 1: 컴포넌트 파일 생성 (전체 코드)**

```tsx
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

  if (levels.length === 0 || !currentId) {
    return (
      <p className="text-on-surface-variant font-[family-name:var(--font-body)]">
        아직 공개된 학습 자료가 없습니다.
      </p>
    );
  }

  const current = flat.find((l) => l.id === currentId) ?? flat[0];
  const currentLevel = current.level as ResourceLevel;
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
      <style>{`@keyframes lr-page-in{from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:none}}`}</style>

      <div className="grid grid-cols-1 md:grid-cols-[248px_1fr] border border-outline-variant/30">
        {/* SIDEBAR / TOC */}
        <aside className="border-b md:border-b-0 md:border-r border-outline-variant/30 py-4">
          <div className="font-[family-name:var(--font-label)] text-[10px] tracking-[0.25em] uppercase text-outline px-4 pb-3">
            // 목차 · INDEX
          </div>
          <nav>
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
                              aria-current={isCur ? "true" : undefined}
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
```

- [ ] **Step 2: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 0. (특히 `current.level as ResourceLevel`, `Set<ResourceLevel>` 초기화, `current.links.map`/`current.prompts.map`가 guard 뒤에서만 호출됨을 확인.)

- [ ] **Step 3: 커밋**

```bash
git add src/components/learn/LessonReader.tsx
git commit -m "feat(learn): LessonReader — 목차 사이드바 + 본문 전자책 리더(차분한 틸 강조)"
```

---

## Task 3: /learn 페이지 통합

**Files:**
- Modify: `src/app/learn/page.tsx`

**맥락:** 부모 페이지(서버 컴포넌트)에서 데이터(`lessons`, `gallery`)를 그대로 받아 신규 컴포넌트에 넘긴다. 섹션 헤더/관리자 버튼/HERO/COURSES/ARTICLES는 **그대로 둔다.** 바꾸는 건 ① LearnBrowser import → 신규 2개 import, ② LEARNING PATH 섹션의 `<LearnBrowser>` → `<LessonReader>`, ③ SKILLS GALLERY 섹션의 카드 그리드 조건부 블록 → `<SkillsGallery>`.

- [ ] **Step 1: import 교체**

기존 (line 3):
```tsx
import { LearnBrowser } from "@/components/learn/LearnBrowser";
```
변경 후:
```tsx
import { LessonReader } from "@/components/learn/LessonReader";
import { SkillsGallery } from "@/components/learn/SkillsGallery";
```

- [ ] **Step 2: LEARNING PATH 섹션 본문 교체**

기존:
```tsx
        <Reveal>
          <LearnBrowser lessons={lessons} />
        </Reveal>
```
변경 후:
```tsx
        <Reveal>
          <LessonReader lessons={lessons} />
        </Reveal>
```

- [ ] **Step 3: SKILLS GALLERY 섹션의 그리드/빈상태 블록 교체**

기존(섹션 안의 이 조건부 전체):
```tsx
          {gallery.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {gallery.map((g) => {
                const url = g.links?.[0]?.url ?? "#";
                return (
                  <a
                    key={g.id}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-surface-container-low border-t-2 border-secondary p-6 hover:bg-surface-container-high transition-colors"
                  >
                    <h3 className="font-[family-name:var(--font-headline)] text-lg font-bold text-on-surface mb-2">
                      {g.title}
                    </h3>
                    <p className="text-on-surface-variant text-sm">{g.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {g.tags?.map((t) => (
                        <span
                          key={t}
                          className="font-[family-name:var(--font-label)] text-[10px] uppercase tracking-wider text-outline border border-outline-variant/30 px-2 py-0.5"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </a>
                );
              })}
            </div>
          ) : (
            <p className="text-on-surface-variant font-[family-name:var(--font-body)] text-sm">
              아직 등록된 스킬이 없습니다.
            </p>
          )}
```
변경 후(이 블록 전체를 한 줄로):
```tsx
          <SkillsGallery gallery={gallery} />
```

> 주의: 섹션을 감싸는 `{(gallery.length > 0 || isAdmin) && ( ... )}` 조건과 헤더/`+ 새 스킬` 버튼은 그대로 둔다. `SkillsGallery`가 빈 상태("아직 등록된 스킬이 없습니다.")를 자체 처리하므로 관리자에게도 정상 표시된다.

- [ ] **Step 4: orphan import 확인**

`LearnBrowser`가 더 이상 page.tsx에서 쓰이지 않으므로 Step 1에서 import를 제거한 상태여야 한다. (파일 `LearnBrowser.tsx` 자체는 삭제/수정하지 않는다.)

- [ ] **Step 5: 타입 체크 + 빌드**

Run: `npx tsc --noEmit`
Expected: 에러 0.

Run: `npm run build`
Expected: 컴파일/타입/번들 단계 통과. (Supabase env 미설정으로 데이터 fetch 단계에서 실패하는 로그가 보이면 코드 결함이 아니라 env 문제이므로 구분해서 보고. 컴파일 에러·타입 에러·번들 에러가 없으면 OK.)

- [ ] **Step 6: 커밋**

```bash
git add src/app/learn/page.tsx
git commit -m "feat(learn): /learn 페이지를 LessonReader/SkillsGallery로 교체"
```

---

## 최종 수동 검증 (사용자)

- `npm run dev` → `http://localhost:3000/learn`
  - 학습 경로: 좌측 목차에서 챕터 토글(▸/▾), 레슨 클릭 시 본문 전환(좌→우 슬라이드), ◀▶로 레슨/챕터 경계 넘김, `02/05` 카운터·진행바 동작.
  - 색: 틸 강조만 보이고 네온 단색 채움/제목 네온/글로우 없음.
  - 스킬 갤러리: 태그 다중 선택(AND)으로 결과 감소, 8개 초과 시 펼치기/접기, 필터 변경 시 8개로 재접힘.
  - 코스 상세(`/learn/[slug]`)·코스 카드·아코디언은 이전과 동일(회귀 없음).

## Self-Review (작성자 점검 결과)

- **Spec coverage:** 색 토큰(§4)→ACCENT 적용 / 학습경로 리더(§5)→Task 2 / 스킬갤러리(§6)→Task 1 / 통합·범위(§7)→Task 3 / 빌드제약(§8)→검증 섹션. 누락 없음.
- **No-touch 제약:** 신규 2파일 + page.tsx만. ResourceAccordion/LearnBrowser/globals.css/package.json 미변경. PromptBlock은 LessonReader 내부에 자체 작성(중복 수용, 명시됨).
- **타입 일관성:** `goTo`/`toggleChapter`/`expanded:Set<ResourceLevel>`/`current.level as ResourceLevel` 명칭·시그니처 일치. 가드(`linkCount>0` 후 `current.links.map`) 정합.
- **테스트 러너 부재:** 의도적으로 프레임워크 미추가, 검증은 tsc+build+수동(명시).
