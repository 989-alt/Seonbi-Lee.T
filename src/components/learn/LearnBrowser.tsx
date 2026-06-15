"use client";

import { useMemo, useState } from "react";
import { ResourceAccordion } from "@/components/resources/ResourceAccordion";
import type { ResourceRow, ResourceLevel } from "@/lib/repositories/types";
import { LEVEL_LABEL, LEVEL_ORDER, LEVEL_TAG } from "@/lib/repositories/types";

export function LearnBrowser({ lessons }: { lessons: ResourceRow[] }) {
  // 데이터가 있는 레벨만 탭으로 노출
  const levels = useMemo(
    () => LEVEL_ORDER.filter((lv) => lessons.some((l) => l.level === lv)),
    [lessons]
  );
  const [level, setLevel] = useState<ResourceLevel | null>(levels[0] ?? null);
  const [topic, setTopic] = useState<string>("all");

  const topics = useMemo(() => {
    const set = new Set<string>();
    lessons.filter((l) => l.level === level).forEach((l) =>
      l.tags?.forEach((t) => set.add(t))
    );
    return Array.from(set);
  }, [lessons, level]);

  const filtered = lessons.filter(
    (l) => l.level === level && (topic === "all" || l.tags?.includes(topic))
  );

  if (levels.length === 0) {
    return (
      <p className="text-on-surface-variant font-[family-name:var(--font-body)]">
        아직 공개된 학습 자료가 없습니다.
      </p>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap border border-outline-variant/30 mb-6">
        {levels.map((lv) => {
          const active = lv === level;
          return (
            <button
              key={lv}
              type="button"
              onClick={() => {
                setLevel(lv);
                setTopic("all");
              }}
              aria-selected={active}
              className={`flex-1 min-w-[120px] text-left px-4 py-4 border-r border-outline-variant/30 last:border-r-0 font-[family-name:var(--font-label)] uppercase tracking-widest text-xs transition-colors ${
                active
                  ? "bg-surface-container-high text-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="block text-[10px] text-outline mb-1.5">
                {LEVEL_TAG[lv]}
              </span>
              {LEVEL_LABEL[lv]}
            </button>
          );
        })}
      </div>

      {topics.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {["all", ...topics].map((t) => {
            const active = t === topic;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTopic(t)}
                className={`font-[family-name:var(--font-label)] uppercase tracking-wider text-[11px] px-3 py-1.5 border transition-colors ${
                  active
                    ? "bg-primary text-on-primary border-primary"
                    : "text-on-surface-variant border-outline-variant/30 hover:border-primary hover:text-primary"
                }`}
              >
                {t === "all" ? "전체" : `#${t}`}
              </button>
            );
          })}
        </div>
      )}

      {filtered.length > 0 ? (
        <ResourceAccordion resources={filtered} />
      ) : (
        <p className="text-on-surface-variant font-[family-name:var(--font-body)] py-8">
          이 조건에 해당하는 자료가 없습니다.
        </p>
      )}
    </div>
  );
}
