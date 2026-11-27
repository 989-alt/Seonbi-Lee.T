import { TAROT_CARDS } from "@/data/fortune/tarot-cards";
import { hashSeed } from "@/lib/fortune/saju/luck";

export type Rng = () => number;

/** 브라우저 암호학 난수 0 이상 1 미만 */
export const cryptoRng: Rng = () => crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher–Yates */
export function shuffle<T>(list: readonly T[], rng: Rng): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export const ORDERED_IDS = TAROT_CARDS.map((c) => c.id);
export const REVERSED_RATE = 0.3;

/** 역방향은 섞을 때 카드마다 정해지고 뽑은 뒤에는 바뀌지 않는다 */
export function drawReversed(ids: readonly string[], rng: Rng, allow: boolean): Record<string, boolean> {
  return Object.fromEntries(ids.map((id) => [id, allow && rng() < REVERSED_RATE]));
}

/** 오늘의 카드: 같은 기기 ID + 같은 날짜면 같은 카드(메이저 22장, 정방향) */
export function dailyCardId(deviceId: string, day: string): string {
  return ORDERED_IDS[Math.floor(mulberry32(hashSeed(`${deviceId}|${day}`))() * 22)];
}
