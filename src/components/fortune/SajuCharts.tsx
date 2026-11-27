"use client";

import { useState } from "react";
import { EL_INFO, gradeOf } from "@/data/fortune/saju-text";
import { EL_HANJA } from "@/lib/fortune/saju/core";

export const EL_VARS = ["var(--fx-wood)", "var(--fx-fire)", "var(--fx-earth)", "var(--fx-metal)", "var(--fx-water)"];

/** 오행 오각형. 색만으로 구분하지 않도록 글자와 개수를 함께 쓴다 */
export function ElementChart({ counts }: { counts: number[] }) {
  const total = counts.reduce((a, b) => a + b, 0);
  const max = Math.max(3, ...counts);
  const pt = (i: number, r: number) => {
    const a = (-90 + i * 72) * (Math.PI / 180);
    // 서버와 브라우저의 소수 끝자리 차이를 없앤다
    return [150 + Math.cos(a) * r, 140 + Math.sin(a) * r].map((n) => Number(n.toFixed(2)));
  };
  const poly = (f: (i: number) => number) => [0, 1, 2, 3, 4].map((i) => pt(i, f(i)).map((n) => n.toFixed(1)).join(",")).join(" ");
  return (
    <div className="my-auto grid items-center gap-6 sm:grid-cols-[minmax(0,260px)_1fr]">
      <svg viewBox="0 0 300 275" role="img" aria-label={`오행 분포: ${counts.map((c, i) => `${EL_INFO[i].name} ${c}개`).join(", ")}`} className="mx-auto w-full max-w-[280px]">
        {[1, 2, 3].map((k) => <polygon key={k} points={poly(() => (95 * k) / 3)} fill="none" stroke="#4a3f80" strokeWidth={1} />)}
        {[0, 1, 2, 3, 4].map((i) => { const [x, y] = pt(i, 95); return <line key={i} x1={150} y1={140} x2={x} y2={y} stroke="#4a3f80" strokeWidth={1} />; })}
        <g className="fx-radar-fill">
          <polygon points={poly((i) => 8 + (87 * counts[i]) / max)} fill="rgba(91,224,138,0.22)" stroke="#5be08a" strokeWidth={2} strokeLinejoin="round" />
          {counts.map((c, i) => { const [x, y] = pt(i, 8 + (87 * c) / max); return <circle key={i} cx={x} cy={y} r={5} fill={EL_VARS[i]} stroke="#1e1739" strokeWidth={2} />; })}
        </g>
        {counts.map((_, i) => { const [x, y] = pt(i, 119); return <text key={i} x={x} y={y + 6} textAnchor="middle" fontSize={17} fontWeight={700} fill="#f3f1f8">{EL_HANJA[i]}</text>; })}
      </svg>
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {counts.map((c, i) => (
          <li key={i} className="grid grid-cols-[64px_1fr_40px] items-center gap-3 text-[14.5px]">
            <span className="font-bold text-white">{EL_INFO[i].name}({EL_HANJA[i]})</span>
            <span className="h-[10px] overflow-hidden rounded-[4px] bg-[#120e22]">
              <span className="fx-grow block h-full rounded-[4px]" style={{ width: `${(c / total) * 100}%`, background: EL_VARS[i] }} />
            </span>
            <span className="text-right tabular-nums text-lilac">{c}개</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Gauge({ score }: { score: number }) {
  const arc = "M 22 112 A 78 78 0 0 1 178 112";
  return (
    <svg viewBox="0 0 200 128" role="img" aria-label={`오늘 점수 ${score}점, ${gradeOf(score).name}`} className="mx-auto w-full max-w-[230px]">
      <path d={arc} fill="none" stroke="#120e22" strokeWidth={14} strokeLinecap="round" />
      <path key={score} d={arc} pathLength={100} fill="none" stroke="#5be08a" strokeWidth={14} strokeLinecap="round" strokeDasharray={`${score} 100`} />
      <text x={100} y={94} textAnchor="middle" fontSize={44} fontWeight={700} fill="#fff" style={{ fontFamily: "var(--font-pixel)" }}>{score}</text>
      <text x={100} y={120} textAnchor="middle" fontSize={15} fill="#c8c1e2">{gradeOf(score).name}</text>
    </svg>
  );
}

export type FlowPoint = { key: string; label: string; score: number; title: string; detail: string };

/** 대운·월운 흐름 꺾은선. 점을 누르거나 초점을 옮기면 설명이 바뀐다 */
export function FlowChart({ points, now, caption }: { points: FlowPoint[]; now: number; caption: string }) {
  const [sel, setSel] = useState(Math.max(0, now));
  const W = 760, H = 240, L = 44, R = 24, T = 34, B = 40;
  const x = (i: number) => L + (i * (W - L - R)) / (points.length - 1);
  const y = (s: number) => T + ((100 - s) / 80) * (H - T - B);
  const d = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.score).toFixed(1)}`).join(" ");
  const cur = points[sel] ?? points[0];
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_300px] lg:items-center">
      <div className="-mx-1 overflow-x-auto px-1 pb-1 max-sm:[mask-image:linear-gradient(90deg,#000_calc(100%-40px),transparent)]">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full min-w-[720px] sm:min-w-[560px]" role="group" aria-label={caption}>
          {[90, 60, 30].map((s, i) => (
            <g key={s}>
              <line x1={L} x2={W - R} y1={y(s)} y2={y(s)} stroke="#372d66" strokeWidth={1} />
              <text x={L - 10} y={y(s) + 5} textAnchor="end" fontSize={13} fill="#c8c1e2">{["활짝", "잔잔", "쉼"][i]}</text>
            </g>
          ))}
          <path key={d} d={d} pathLength={1} className="fx-draw" fill="none" stroke="#b7a6ff" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
          {points.map((p, i) => (
            <g key={p.key} className="fx-point" role="button" tabIndex={0} aria-pressed={sel === i} aria-label={`${p.title}, ${gradeOf(p.score).name}${i === now ? ", 지금" : ""}`} onClick={() => setSel(i)} onMouseEnter={() => setSel(i)} onFocus={() => setSel(i)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSel(i); } }}>
              <rect x={x(i) - 22} y={T - 26} width={44} height={H - T + 20} fill="transparent" />
              {sel === i && <line x1={x(i)} x2={x(i)} y1={T - 8} y2={H - B} stroke="#5be08a" strokeDasharray="3 4" />}
              <circle cx={x(i)} cy={y(p.score)} r={sel === i ? 8 : 5.5} fill={i === now ? "#5be08a" : "#b7a6ff"} stroke="#1e1739" strokeWidth={2.5} />
              <text x={x(i)} y={H - 14} textAnchor="middle" fontSize={14} fontWeight={i === now ? 700 : 400} fill={i === now ? "#5be08a" : "#e4dff4"}>{p.label}</text>
              {i === now && <text x={x(i)} y={T - 16} textAnchor="middle" fontSize={13} fontWeight={700} fill="#5be08a">지금</text>}
            </g>
          ))}
        </svg>
      </div>
      <div aria-live="polite" className="rounded-[14px] bg-[#120e22] p-5">
        <p className="m-0 font-pixel text-[17px] font-bold text-white">{cur.title}</p>
        <p className="m-0 mt-1 text-[14px] text-mint">흐름 {gradeOf(cur.score).name}</p>
        <p className="fx-body mt-3 text-[14.5px]!">{cur.detail}</p>
      </div>
    </div>
  );
}
