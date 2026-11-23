"use client";

import { animate } from "motion";
import { useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState, type KeyboardEvent, type PointerEvent, type MouseEvent } from "react";
import { CARD_BACK, cardById } from "@/data/fortune/tarot-cards";
import { cryptoRng, drawReversed, ORDERED_IDS, shuffle } from "@/lib/fortune/tarot/deck";
import { fanPlaces, hitCard, spreadOffset, tableMetrics } from "@/lib/fortune/tarot/layout";
import { blockedQuestion, readCards, scrub, spreadById, SPREADS, TOPICS, type SpreadId, type TopicId } from "@/lib/fortune/tarot/reading";
import { initialTarot, tarotReducer } from "@/lib/fortune/tarot/state";
import { CardFace } from "./CardFace";
import { TarotResult } from "./TarotResult";

type Target = { x: number; y: number; rotate: number; scale: number; z: number };
type MoveOptions = Parameters<typeof animate>[2];

/** 섞기 궤도: 세 겹의 반지름 비율, 도는 각도, 단계별 시간(초) */
const RINGS = [1, 0.7, 0.4];
const TURN = Math.PI * 1.5;
const STEPS = 28;
const LIFT = 0.9;
const ORBIT = 2.8;
const GATHER = 1.5;

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function TarotRoom() {
  const [topic, setTopic] = useState<TopicId>("today");
  const [spread, setSpread] = useState<SpreadId>("three");
  const [question, setQuestion] = useState("");
  const [warn, setWarn] = useState<string | null>(null);
  const [allowReversed, setAllowReversed] = useState(true);
  const [calmPref, setCalmPref] = useState<boolean | null>(null);
  const [systemCalm, setSystemCalm] = useState(false);
  const calm = calmPref ?? systemCalm;

  const positions = spreadById(spread).positions;
  const [state, dispatch] = useReducer(tarotReducer, positions.length, initialTarot);
  const { phase, deckOrder, selected, revealed, reversedById } = state;

  const [hover, setHover] = useState<string | null>(null);
  const [width, setWidth] = useState(0);
  const layerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const cards = useRef(new Map<string, HTMLButtonElement>());
  const last = useRef(new Map<string, string>());
  const prevWidth = useRef(0);
  const armed = useRef(false);
  const wheelRef = useRef<HTMLDivElement>(null);
  const wheelTurn = useRef(0);
  const lastPos = useRef({ row: 0, col: 0 });
  const shuffleBtn = useRef<HTMLButtonElement>(null);
  const revealBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setSystemCalm(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  useLayoutEffect(() => {
    const el = layerRef.current!;
    const ro = new ResizeObserver(([e]) => setWidth(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const m = useMemo(() => tableMetrics(width || 1200, positions.length), [width, positions.length]);
  const places = useMemo(() => fanPlaces(deckOrder, selected, m), [deckOrder, selected, m]);
  const fanOpen = phase !== "READY_STACK" && phase !== "SHUFFLING";
  const live = phase === "READY_FAN" && selected.length < positions.length;
  const full = selected.length === positions.length;
  const order = useMemo(() => deckOrder.filter((id) => !selected.includes(id)), [deckOrder, selected]);
  const near = order.find((id) => places.get(id)?.row === lastPos.current.row && places.get(id)?.col === lastPos.current.col);
  const tabStop = hover ?? near ?? order[0];

  const move = useCallback((id: string, t: Target, opts: MoveOptions) => {
    const el = cards.current.get(id);
    if (!el) return;
    const key = `${Math.round(t.x)},${Math.round(t.y)},${t.rotate.toFixed(1)},${t.scale.toFixed(2)}`;
    el.style.zIndex = String(t.z);
    if (last.current.get(id) === key) return;
    last.current.set(id, key);
    animate(el, { x: t.x - m.cardW / 2, y: t.y - m.cardH / 2, rotate: t.rotate, scale: t.scale }, opts);
  }, [m]);

  /** 단계·선택·호버가 바뀔 때마다 78장의 목표 위치를 다시 계산해 움직인다 */
  useLayoutEffect(() => {
    if (!width || phase === "SHUFFLING") return;
    const jump = calm || prevWidth.current !== width;
    if (prevWidth.current !== width) last.current.clear();
    prevWidth.current = width;
    const hoverPlace = live && hover ? places.get(hover) : undefined;

    deckOrder.forEach((id, i) => {
      const slot = selected.indexOf(id);
      if (slot >= 0) {
        const s = m.slots[slot];
        const flying = phase === "SELECTING" && slot === selected.length - 1;
        move(id, { x: s.x, y: s.y, rotate: 0, scale: m.slotW / m.cardW, z: flying ? 2000 : 500 + slot }, jump ? { duration: 0 } : { duration: 0.68, x: { duration: 0.68, ease: [0.45, 0, 0.15, 1] }, y: { duration: 0.68, ease: [0.3, -0.35, 0.25, 1] } });
        return;
      }
      if (!fanOpen) {
        move(id, { x: m.stack.x, y: m.stack.y - i * 0.28, rotate: 0, scale: 1.15, z: i }, { duration: jump ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] });
        return;
      }
      const p = places.get(id)!;
      if (phase === "SPREADING") {
        move(id, { x: p.x, y: p.y, rotate: p.rot, scale: 1, z: p.z }, jump ? { duration: 0 } : { duration: 0.9, delay: p.col * 0.028 + (p.row * 0.5) / (m.rows - 1), ease: [0.16, 1, 0.3, 1] });
        return;
      }
      const lifted = id === hover && live;
      move(
        id,
        lifted
          ? { x: p.x, y: p.y - m.lift, rotate: p.rot, scale: 1.04, z: 1000 }
          : { x: p.x + spreadOffset(p, hoverPlace), y: p.y, rotate: p.rot, scale: 1, z: p.z },
        jump ? { duration: 0 } : { duration: phase === "SELECTING" ? 0.45 : 0.17, ease: [0.16, 1, 0.3, 1] },
      );
    });
  }, [calm, deckOrder, fanOpen, hover, live, m, move, phase, places, selected, width]);

  // 단계 자동 진행
  useEffect(() => {
    if (phase === "SPREADING") {
      const t = setTimeout(() => dispatch({ type: "fanReady" }), calm ? 0 : 2200);
      return () => clearTimeout(t);
    }
    if (phase === "SELECTING") {
      const t = setTimeout(() => dispatch({ type: "landed" }), calm ? 0 : 700);
      return () => clearTimeout(t);
    }
    if (phase === "REVEALING") {
      const t = setTimeout(() => dispatch({ type: "flip" }), calm ? 0 : revealed === 0 ? 400 : 1050);
      return () => clearTimeout(t);
    }
  }, [phase, revealed, calm]);

  // 눌렀던 버튼이 사라지는 단계마다 초점을 다음 할 일로 옮긴다. phase만 보므로 동작 줄이기를 바꿔도 다시 스크롤하지 않는다
  useEffect(() => {
    const at = document.activeElement;
    const lost = !at || at === document.body || (at instanceof HTMLElement && at.dataset.slot !== undefined);
    if (phase === "READY_FAN" && lost) {
      if (full) revealBtn.current?.focus({ preventScroll: true });
      else cards.current.get(tabStop)?.focus({ preventScroll: true });
    }
    if (phase === "RESULTS") {
      const t = setTimeout(() => {
        document.getElementById("result-title")?.focus({ preventScroll: true });
        resultRef.current?.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "start" });
      }, calm ? 0 : 1000);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  /** 덱을 둘로 갈라 교차로 합치기 세 번. 화면의 순서와 데이터 순서를 같게 맞춘다 */
  /**
   * 섞기 의식: 덱이 세 겹 궤도로 흩어져 천구처럼 돌다가 새 순서로 다시 모인다.
   * 화면에서 모이는 순서와 데이터 순서(next)를 같게 맞춘다.
   */
  const doShuffle = async () => {
    if (phase !== "READY_STACK") return;
    const blocked = blockedQuestion(question);
    setWarn(blocked);
    if (blocked) return;
    showTable();
    const next = shuffle(ORDERED_IDS, cryptoRng);
    const before = deckOrder;
    dispatch({ type: "shuffle", deckOrder: next, reversedById: drawReversed(next, cryptoRng, allowReversed) });
    if (!calm) {
      const { x: cx, y: cy } = m.stack;
      const rx = Math.min(m.width * 0.4, 460);
      const ry = Math.min(m.height * 0.36, 230);
      const el = (id: string) => cards.current.get(id);
      const at = (ring: number, a: number) => ({ x: cx + Math.cos(a) * rx * RINGS[ring] - m.cardW / 2, y: cy + Math.sin(a) * ry * RINGS[ring] - m.cardH / 2, rotate: (a * 180) / Math.PI + 90 });
      const start = (i: number) => (Math.floor(i / 3) / 26) * Math.PI * 2 - Math.PI / 2;
      wheelTurn.current += 300;
      if (wheelRef.current) animate(wheelRef.current, { rotate: wheelTurn.current }, { duration: LIFT + ORBIT + GATHER, ease: [0.45, 0, 0.2, 1] });

      // 1. 떠오르기
      before.forEach((id, i) => {
        const e = el(id);
        if (!e) return;
        e.style.zIndex = String((i % 3) * 100 + Math.floor(i / 3));
        animate(e, { ...at(i % 3, start(i)), scale: 0.92 }, { duration: LIFT, delay: (i % 3) * 0.1 + Math.floor(i / 3) * 0.012, ease: [0.16, 1, 0.3, 1] });
      });
      await wait((LIFT + 0.5) * 1000);
      // 2. 세 겹이 서로 반대로 돈다. 가속·감속은 각도에 넣고 구간은 등속으로 잇는다
      const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
      before.forEach((id, i) => {
        const e = el(id);
        if (!e) return;
        const dir = i % 3 === 1 ? -1 : 1;
        const frames = Array.from({ length: STEPS + 1 }, (_, j) => at(i % 3, start(i) + dir * TURN * ease(j / STEPS)));
        animate(e, { x: frames.map((f) => f.x), y: frames.map((f) => f.y), rotate: frames.map((f) => f.rotate) }, { duration: ORBIT, ease: "linear" });
      });
      await wait(ORBIT * 1000);
      // 3. 새 순서로 모이기
      next.forEach((id, i) => {
        const e = el(id);
        if (!e) return;
        const k = before.indexOf(id);
        const end = at(k % 3, start(k) + (k % 3 === 1 ? -1 : 1) * TURN).rotate;
        e.style.zIndex = String(i);
        animate(e, { x: cx - m.cardW / 2, y: cy - i * 0.28 - m.cardH / 2, rotate: Math.round(end / 360) * 360, scale: 1.15 }, { duration: 0.7, delay: i * 0.008, ease: [0.5, 0, 0.15, 1] });
      });
      await wait(GATHER * 1000);
      for (const id of next) { const e = el(id); if (e) animate(e, { rotate: 0 }, { duration: 0 }); }
      last.current.clear();
    }
    dispatch({ type: "shuffled" });
  };

  const showTable = () => tableRef.current?.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "start" });

  const reset = useCallback((need: number) => {
    setHover(null);
    last.current.clear();
    lastPos.current = { row: 0, col: 0 };
    dispatch({ type: "reset", need });
  }, []);

  const again = () => {
    reset(positions.length);
    showTable();
    requestAnimationFrame(() => shuffleBtn.current?.focus({ preventScroll: true }));
  };

  const pickSpread = (id: SpreadId) => {
    setSpread(id);
    reset(spreadById(id).positions.length);
  };

  const select = (id: string) => {
    if (!live) return;
    setHover(null);
    dispatch({ type: "select", id });
  };

  const hit = (e: PointerEvent | MouseEvent) => {
    const r = layerRef.current!.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    // 떠오른 카드 위에 있으면 그 카드를 유지해 깜빡임을 막는다
    if (hover) {
      const p = places.get(hover);
      if (p && Math.abs(px - p.x) < m.gapX / 2 && py < p.y + m.cardH * 0.1 && py > p.y - m.lift - m.cardH / 2) return hover;
    }
    return hitCard(px, py, places, m);
  };
  const onMove = (e: PointerEvent) => { if (live && e.target === layerRef.current) setHover(hit(e)); };
  const onDown = (e: PointerEvent) => {
    if (!live || e.target !== layerRef.current) return;
    const id = hit(e);
    armed.current = e.pointerType === "mouse" || (id !== null && id === hover);
    if (id) setHover(id);
  };
  const onClick = (e: MouseEvent) => {
    if (!live || e.target !== layerRef.current) return;
    const id = hit(e);
    if (id && armed.current) select(id);
  };

  const onKey = (e: KeyboardEvent) => {
    if (!fanOpen || full) return;
    if (e.key === "Escape") { setHover(null); (document.activeElement as HTMLElement | null)?.blur(); return; }
    const d = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0] }[e.key];
    if (!d) return;
    e.preventDefault();
    if (!live) return;
    const from = (hover && places.get(hover)) || lastPos.current;
    const rowIds = (row: number) => deckOrder.filter((id) => places.get(id)?.row === row);
    const row = Math.min(m.rows - 1, Math.max(0, from.row + d[0]));
    const ids = rowIds(row);
    const col = Math.min(ids.length - 1, Math.max(0, from.col + d[1]));
    const id = ids[col];
    lastPos.current = { row, col };
    cards.current.get(id)?.focus();
  };

  const step = !state.shuffled ? 0 : !fanOpen ? 1 : full ? 3 : 2;
  const guide =
    phase === "SHUFFLING" ? "78장을 섞는 중이에요" :
    phase === "SPREADING" ? "카드를 펼치는 중이에요" :
    phase === "REVEALING" ? "카드를 한 장씩 열어요" :
    phase === "RESULTS" ? "모든 카드가 열렸어요" :
    !state.shuffled ? "질문을 떠올리며 카드를 섞어 주세요" :
    !fanOpen ? "다 섞였어요. 이제 펼쳐 볼까요?" :
    full ? "다 골랐어요. 카드를 열어 보세요" :
    `‘${positions[selected.length]}’ 자리에 놓을 카드를 골라 주세요`;
  const reading = phase === "RESULTS" ? readCards(selected, reversedById, spread, topic) : null;
  const locked = phase !== "READY_STACK" || state.shuffled;

  return (
    <div className="fx-wrap" id="tarot-room" style={{ scrollMarginTop: 84 }}>
      <section aria-labelledby="topic-title" className="mt-8">
        <h2 id="topic-title" className="fx-h2">무엇이 궁금한가요?</h2>
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="주제">
          {TOPICS.map((t) => (
            <button key={t.id} type="button" aria-pressed={topic === t.id} onClick={() => setTopic(t.id)} title={t.hint} className={`min-h-[46px] cursor-pointer rounded-full border px-5 text-[15px] font-bold transition-colors ${topic === t.id ? "border-mint bg-mint text-night-deep" : "border-[#8b7dcc] bg-[#1e1739] text-[#f3f1f8] hover:border-mint"}`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.1fr]">
          <div className="fx-field">
            <label htmlFor="tarot-q">마음속 질문 (적지 않아도 돼요)</label>
            <input id="tarot-q" className="fx-input" maxLength={120} autoComplete="off" disabled={locked} value={question} onChange={(e) => { setQuestion(e.target.value); setWarn(null); }} placeholder="예) 새 업무를 어떤 마음으로 시작하면 좋을까?" aria-describedby="tarot-q-help" aria-invalid={!!warn} />
            <p id="tarot-q-help" className="m-0 text-[13px] text-lilac">이름이나 학생 정보는 적지 마세요. 질문은 AI 풀이를 누를 때만 전송되고 저장하지 않아요.</p>
            {warn && <p role="alert" className="m-0 rounded-[10px] bg-[#4a2036] px-3 py-2 text-[14px] leading-[1.6] text-[#ffd7dd]">{warn}</p>}
          </div>
          <fieldset className="m-0 border-0 p-0">
            <legend className="fx-legend mb-[6px] p-0">배열법</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {SPREADS.map((s) => (
                <button key={s.id} type="button" aria-pressed={spread === s.id} disabled={["SHUFFLING", "SPREADING", "SELECTING", "REVEALING"].includes(phase)} onClick={() => pickSpread(s.id)} className={`min-h-[64px] cursor-pointer rounded-[12px] border px-3 py-2 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${spread === s.id ? "border-mint bg-[#1d3140]" : "border-[#4a3f80] bg-[#1e1739] hover:border-[#8b7dcc]"}`}>
                  <span className="block text-[14.5px] font-bold text-white">{s.name}</span>
                  <span className="text-[12.5px] text-lilac">{s.desc}</span>
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      </section>

      <section ref={tableRef} aria-labelledby="table-title" className="fx-table mt-8" style={{ scrollMarginTop: 84 }}>
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-[#4a3f80] bg-[#1b1530]/80 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 id="table-title" className="fx-h3" aria-live="polite">{guide}</h2>
            <ol className="m-0 mt-2 flex list-none flex-wrap gap-x-4 gap-y-1 p-0 text-[13px]" aria-label="진행 단계">
              {["섞기", "펼치기", `${positions.length}장 고르기`, "열어 보기"].map((l, i) => (
                <li key={l} aria-current={i === step ? "step" : undefined} className={i === step ? "font-bold text-mint" : i < step ? "text-[#e8c77a]" : "text-lilac"}>{i + 1}. {l}</li>
              ))}
            </ol>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!fanOpen && (
              <button ref={shuffleBtn} type="button" className={`fx-btn ${state.shuffled ? "fx-btn-line" : "fx-btn-main"}`} aria-disabled={phase !== "READY_STACK"} onClick={doShuffle}>{state.shuffled ? "다시 섞기" : "카드 78장 섞기"}</button>
            )}
            {!fanOpen && state.shuffled && <button type="button" className="fx-btn fx-btn-main" disabled={phase !== "READY_STACK"} onClick={() => dispatch({ type: "spread" })}>펼치기</button>}
            {fanOpen && phase !== "RESULTS" && <button ref={revealBtn} type="button" className="fx-btn fx-btn-main" disabled={phase !== "READY_FAN" || !full} onClick={() => dispatch({ type: "reveal" })}>카드 열기</button>}
            {fanOpen && <button type="button" className="fx-btn fx-btn-line" disabled={["SPREADING", "SELECTING", "REVEALING"].includes(phase)} onClick={again}>새로 섞기</button>}
          </div>
        </div>

        <div
          ref={layerRef}
          className="fx-layer"
          data-live={live}
          data-phase={phase}
          data-calm={calm}
          style={{ height: m.height }}
          onPointerMove={onMove}
          onPointerDown={onDown}
          onPointerLeave={(e) => { if (e.pointerType === "mouse") setHover(null); }}
          onClick={onClick}
          onKeyDown={onKey}
          role="group"
          aria-label={`타로 카드 ${order.length}장. 방향키로 옮기고 엔터로 고르세요`}
        >
          <div ref={wheelRef} className="fx-astro" aria-hidden style={{ left: m.stack.x, top: m.stack.y, width: m.wheel, height: m.wheel }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="fx-wheel" src="/fortune/tarot/zodiac-wheel.webp" alt="" draggable={false} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="fx-ring" src="/fortune/tarot/star-ring.webp" alt="" draggable={false} />
          </div>
          {positions.map((p, i) => (
            <div key={p} className="fx-slot pointer-events-none" data-next={live && i === selected.length} data-filled={i < selected.length} style={{ left: m.slots[i].x - m.slotW / 2, top: m.slots[i].y - m.slotH / 2, width: m.slotW, height: m.slotH }}>
              <span className="fx-slot-label">{p}</span>
            </div>
          ))}
          {deckOrder.map((id) => {
            const slot = selected.indexOf(id);
            const open = slot >= 0 && slot < revealed;
            const n = order.indexOf(id) + 1;
            return (
              <button
                key={id}
                type="button"
                ref={(el) => { if (el) cards.current.set(id, el); else cards.current.delete(id); }}
                className="fx-card"
                data-tarot-card={id}
                data-hover={live && hover === id}
                data-open={open}
                data-slot={slot >= 0 ? slot : undefined}
                style={{ width: m.cardW, height: m.cardH, visibility: width ? "visible" : "hidden" }}
                tabIndex={live && id === tabStop ? 0 : -1}
                aria-hidden={!live && slot < 0 ? true : undefined}
                aria-label={open ? `${positions[slot]}: ${cardById(id).nameKo}${reversedById[id] ? " 역방향" : ""}` : slot >= 0 ? `${positions[slot]} 자리 카드, 아직 뒷면` : `78장 카드 중 ${n}번째 위치`}
                onFocus={(e) => { if (live && slot < 0 && e.currentTarget.matches(":focus-visible")) setHover(id); }}
                onClick={() => { if (slot < 0) select(id); }}
              >
                <span className="fx-flip">
                  <span className="fx-side fx-back">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={CARD_BACK} alt="" draggable={false} />
                  </span>
                  {slot >= 0 && full && <span className="fx-side fx-front"><CardFace card={cardById(id)} reversed={!!reversedById[id]} /></span>}
                </span>
              </button>
            );
          })}
          {live && hover && (
            <div className="absolute left-0 right-0 z-[1500] flex justify-center" style={{ top: m.slots[0].y - m.slotH / 2 - 50 }}>
              <button type="button" className="fx-btn fx-btn-main [@media(hover:hover)]:hidden" style={{ minHeight: 44 }} onClick={() => select(hover)}>이 카드 고르기</button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-t border-[#4a3f80] bg-[#1b1530]/80 px-4 py-2 sm:px-6">
          <p className="m-0 text-[14px] text-lilac">남은 카드 <strong className="text-white tabular-nums" data-remaining>{order.length}</strong> / 78, 고른 카드 <strong className="text-mint tabular-nums">{selected.length}</strong> / {positions.length}</p>
          <div className="flex flex-wrap gap-x-5">
            <label className="fx-check"><input type="checkbox" checked={allowReversed} disabled={locked} onChange={(e) => setAllowReversed(e.target.checked)} />뒤집힌 카드 포함</label>
            <label className="fx-check"><input type="checkbox" checked={calm} onChange={(e) => setCalmPref(e.target.checked)} />동작 줄이기</label>
          </div>
        </div>
      </section>

      <div ref={resultRef} style={{ scrollMarginTop: 90 }}>
        {reading && <TarotResult reading={reading} topic={topic} question={scrub(question)} onAgain={again} onNewQuestion={() => { reset(positions.length); requestAnimationFrame(() => document.getElementById("tarot-q")?.focus()); }} onSpread={(id) => { pickSpread(id); showTable(); }} current={spread} />}
      </div>
    </div>
  );
}
