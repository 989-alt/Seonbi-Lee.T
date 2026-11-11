import { z } from "zod";

export type TeacherGuide = {
  genre: string;
  players: string | null;
  time: string | null;
  device: string | null;
  curriculum: string | null;
  steps: string[];
  tips: string[];
};

const text = (max: number) => z.string().trim().min(1).max(max);
const opt = (max: number) => text(max).optional().nullable();

const GuideSchema = z.object({
  genre: text(60),
  players: opt(80),
  time: opt(60),
  device: opt(80),
  curriculum: opt(160),
  steps: z.array(text(200)).min(1),
  tips: z.array(text(200)).optional().nullable(),
});

/** projects.guide(jsonb) → 교사용 안내. 형식이 틀리면 null(카드 숨김) */
export function parseGuide(raw: unknown): TeacherGuide | null {
  const r = GuideSchema.safeParse(raw);
  if (!r.success) return null;
  const g = r.data;
  return {
    genre: g.genre,
    players: g.players ?? null,
    time: g.time ?? null,
    device: g.device ?? null,
    curriculum: g.curriculum ?? null,
    steps: g.steps.slice(0, 8),
    tips: (g.tips ?? []).slice(0, 5),
  };
}
