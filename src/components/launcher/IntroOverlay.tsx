"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { readIntroSeen, writeIntroSeen } from "@/lib/launcher/introSeen";

type Phase = "idle" | "loading" | "zoom";

const LOGS: [number, string][] = [
  [4, "> 방구석 서버 전원 ON"],
  [24, "> PLAYER 1 확인 · 선생님 입장"],
  [48, "> 게임 카트리지 장착 완료"],
  [70, "> 학급운영 · 학교행정 도구 불러오는 중..."],
  [90, "> 모니터 화면으로 이동합니다"],
];

function safeStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function IntroOverlay() {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [pct, setPct] = useState(0);
  const timers = useRef<number[]>([]);
  const startBtn = useRef<HTMLButtonElement>(null);
  const reduced = useRef(false);

  const clearTimers = () => {
    timers.current.forEach((t) => { window.clearInterval(t); window.clearTimeout(t); });
    timers.current = [];
  };

  const close = useCallback(() => {
    clearTimers();
    writeIntroSeen(safeStorage());
    setOpen(false);
    setPhase("idle");
    setPct(0);
    window.setTimeout(() => document.getElementById("bg-q")?.focus(), 0);
  }, []);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!readIntroSeen(safeStorage())) setOpen(true);
    const replay = () => { clearTimers(); setPhase("idle"); setPct(0); setOpen(true); };
    window.addEventListener("bg:intro", replay);
    return () => { window.removeEventListener("bg:intro", replay); clearTimers(); };
  }, []);

  useEffect(() => {
    const root = document.getElementById("bg-root");
    if (root) root.inert = open;
    if (!open) return;
    startBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  const start = () => {
    clearTimers();
    setPhase("loading");
    setPct(0);
    let p = 0;
    const iv = window.setInterval(() => {
      p = Math.min(100, p + 3 + Math.floor(Math.random() * 4));
      setPct(p);
      if (p >= 100) {
        window.clearInterval(iv);
        if (reduced.current) {
          timers.current.push(window.setTimeout(close, 200));
        } else {
          timers.current.push(window.setTimeout(() => setPhase("zoom"), 250));
          timers.current.push(window.setTimeout(close, 1500));
        }
      }
    }, reduced.current ? 20 : 70);
    timers.current.push(iv);
  };

  if (!open) return null;
  const zoom = phase === "zoom";
  return (
    <div role="dialog" aria-modal="true" aria-label="서버 접속" className="fixed inset-0 z-[100] overflow-hidden bg-[#0b0816] font-pixel text-[#edeaf7]">
      <div
        className="absolute inset-0 transition-transform duration-[1150ms] ease-[cubic-bezier(.7,0,.9,.4)]"
        style={{ transform: zoom ? "scale(7)" : "scale(1)", transformOrigin: "58.3% 59%" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/launcher/char-hero-lg.webp" alt="밤의 방에서 초록빛 모니터 앞에 앉아 게임 패드를 든 방구석게이머" className="h-full w-full object-cover" />
      </div>
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,8,22,0.88)_0%,rgba(11,8,22,0.45)_45%,rgba(11,8,22,0)_65%)] transition-opacity duration-300"
        style={{ opacity: zoom ? 0 : 1 }}
      />
      {zoom && <div aria-hidden className="bg-fade absolute inset-0 bg-mint" style={{ animationDelay: "0.9s" }} />}

      {!zoom && (
        <div className="absolute inset-y-0 left-6 flex w-[min(520px,calc(100%-3rem))] flex-col justify-center gap-5 sm:left-20">
          <div className="flex items-center gap-[14px]">
            <span aria-hidden className="flex h-[46px] w-[46px] items-center justify-center rounded-[4px] bg-mint text-2xl font-bold text-[#0b0816]">▣</span>
            <span className="text-[34px] font-bold text-white sm:text-[42px]">방구석게이머</span>
          </div>
          <span className="text-[15px] tracking-[0.2em] text-[#a99fc9]">CLASSROOM ARCADE SERVER</span>
          <p className="m-0 font-[family-name:var(--font-noto-kr)] text-[17px] leading-[1.7] text-lilac">
            밤마다 방구석에서 만든 교실 게임과<br />업무 도구가 이 서버에 모여 있어요.
          </p>
          {phase === "idle" ? (
            <div className="mt-2 flex flex-col items-start gap-[14px]">
              <button ref={startBtn} type="button" onClick={start} className="bg-glow rounded-[8px] bg-mint px-[38px] py-5 text-2xl font-bold text-[#0b0816]">
                ▶ 서버 접속하기
              </button>
              <span className="bg-blink text-sm tracking-[0.16em] text-mint">PRESS START</span>
            </div>
          ) : (
            <div className="mt-2 flex w-full max-w-[440px] flex-col gap-3">
              <div className="flex justify-between text-sm text-[#a99fc9]"><span>CONNECTING...</span><span className="text-white">{pct}%</span></div>
              <div role="progressbar" aria-label="접속 진행률" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} className="h-[26px] border-[3px] border-mint p-[3px]">
                <div className="h-full bg-[repeating-linear-gradient(90deg,#5be08a_0_14px,#3fbf6e_14px_18px)]" style={{ width: `${pct}%` }} />
              </div>
              <div className="flex min-h-[120px] flex-col gap-[6px] text-sm text-lilac" aria-live="polite">
                {LOGS.filter(([t]) => pct >= t).map(([, l]) => <span key={l} className="bg-fade">{l}</span>)}
              </div>
            </div>
          )}
        </div>
      )}

      <button type="button" onClick={close} className="absolute top-6 right-7 z-10 rounded-[6px] border-2 border-night-line bg-[rgba(11,8,22,0.7)] px-4 py-[10px] text-sm text-lilac hover:text-white">
        건너뛰기 ▶▶
      </button>
      {!zoom && (
        <span className="absolute bottom-5 left-6 font-[family-name:var(--font-noto-kr)] text-xs text-[#8a83a8] sm:left-20">
          첫 방문 때만 나와요 · 상단 ‘↺ 인트로’로 다시 볼 수 있어요
        </span>
      )}
    </div>
  );
}
