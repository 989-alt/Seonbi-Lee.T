/** 카드 중심 좌표(테이블 왼쪽 위 기준 px)와 회전각 */
export type Place = { x: number; y: number; rot: number; z: number; row: number; col: number };

export type TableMetrics = {
  width: number;
  height: number;
  cardW: number;
  cardH: number;
  rows: number;
  perRow: number;
  gapX: number;
  rowGap: number;
  sag: number;
  topPad: number;
  lift: number;
  slotW: number;
  slotH: number;
  slots: { x: number; y: number }[];
  stack: { x: number; y: number };
  /** 뒤에 깔리는 황도 원반의 지름 */
  wheel: number;
};

export const MAX_ROT = 11;
const RATIO = 12 / 7;

/** 데스크톱은 26장×3층, 좁은 화면은 손가락으로 고를 수 있게 13장×6층. 어느 쪽이든 78장 모두 한 화면에 놓인다 */
export function tableMetrics(width: number, slotCount: number): TableMetrics {
  const narrow = width < 640;
  const rows = narrow ? 6 : 3;
  const perRow = 78 / rows;
  const pad = narrow ? 6 : 16;
  const cardW = narrow ? 46 : Math.min(72, Math.max(46, width / 18));
  const cardH = Math.round(cardW * RATIO);
  const usable = Math.min(width - pad * 2, 1300);
  const gapX = Math.min(48, (usable - cardW * 1.2) / (perRow - 1));
  const rowGap = narrow ? 48 : Math.round(cardH * 0.7);
  const half = (gapX * (perRow - 1)) / 2;
  // 포물선 끝 기울기가 MAX_ROT를 넘지 않는 처짐
  const sag = Math.min(58, (half * Math.tan((MAX_ROT * Math.PI) / 180)) / 2);
  // 고를 카드는 살짝만 고개를 내민다
  const lift = narrow ? 14 : 18;
  const topPad = lift + 14;
  const fanH = topPad + cardH + rowGap * (rows - 1) + sag;

  const cols = narrow ? (slotCount > 4 ? 5 : slotCount) : slotCount;
  const slotGap = narrow ? 8 : slotCount > 5 ? 18 : 44;
  const slotW = Math.floor(Math.min(slotCount > 5 ? 96 : 118, (usable - slotGap * (cols - 1)) / cols));
  const slotH = Math.round(slotW * RATIO);
  const slotTop = fanH + (narrow ? 44 : 52);
  const label = 30;
  const slots = Array.from({ length: slotCount }, (_, i) => {
    const r = Math.floor(i / cols);
    const inRow = Math.min(cols, slotCount - r * cols);
    const rowW = inRow * slotW + (inRow - 1) * slotGap;
    return { x: width / 2 - rowW / 2 + (i % cols) * (slotW + slotGap) + slotW / 2, y: slotTop + r * (slotH + label + 10) + slotH / 2 };
  });
  const slotRows = Math.ceil(slotCount / cols);
  const height = slotTop + slotRows * (slotH + label + 10) + 12;
  return { width, height, cardW, cardH, rows, perRow, gapX, rowGap, sag, topPad, lift, slotW, slotH, slots, stack: { x: width / 2, y: Math.round(height * 0.46) }, wheel: Math.round(Math.min(width * 0.96, height * 0.9, 640)) };
}

/** 남은 카드의 자리. 층은 유지하고 빈 자리를 메워 가운데로 모은다 */
export function fanPlaces(deckOrder: readonly string[], selected: readonly string[], m: TableMetrics): Map<string, Place> {
  const out = new Map<string, Place>();
  for (let row = 0; row < m.rows; row++) {
    const ids = deckOrder.slice(row * m.perRow, (row + 1) * m.perRow).filter((id) => !selected.includes(id));
    const half = (m.gapX * (m.perRow - 1)) / 2;
    ids.forEach((id, col) => {
      const dx = (col - (ids.length - 1) / 2) * m.gapX;
      const t = half ? dx / half : 0;
      out.set(id, {
        x: m.width / 2 + dx,
        y: m.topPad + m.cardH / 2 + row * m.rowGap + m.sag * t * t,
        rot: MAX_ROT * t,
        z: row * 100 + col,
        row, col,
      });
    });
  }
  return out;
}

/** 포인터 아래에서 실제로 맨 위에 보이는 카드. 회전을 되돌려 카드 사각형 안인지 본다 */
export function hitCard(px: number, py: number, places: Map<string, Place>, m: TableMetrics): string | null {
  let best: string | null = null;
  let bestZ = -1;
  for (const [id, p] of places) {
    if (p.z <= bestZ) continue;
    const a = (-p.rot * Math.PI) / 180;
    const dx = px - p.x;
    const dy = py - p.y;
    const lx = dx * Math.cos(a) - dy * Math.sin(a);
    const ly = dx * Math.sin(a) + dy * Math.cos(a);
    if (Math.abs(lx) <= m.cardW / 2 && Math.abs(ly) <= m.cardH / 2) {
      best = id;
      bestZ = p.z;
    }
  }
  return best;
}

/** 호버한 카드 좌우 4장이 옆으로 살짝 비켜나는 거리 */
export function spreadOffset(p: Place, hover: Place | undefined): number {
  if (!hover || p.row !== hover.row) return 0;
  const d = p.col - hover.col;
  const n = Math.abs(d);
  return n === 0 || n > 4 ? 0 : Math.sign(d) * [0, 14, 10, 6, 3][n];
}
