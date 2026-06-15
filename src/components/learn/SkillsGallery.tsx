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
