"use client";

import { useState } from "react";

/** 이 기기의 무작위 ID(오늘의 카드와 같은 값). 하루 횟수 제한에만 쓴다 */
function deviceId(): string {
  try {
    const k = "bg_fortune_id";
    let v = localStorage.getItem(k);
    if (!v) localStorage.setItem(k, (v = crypto.randomUUID()));
    return v;
  } catch {
    return "guest";
  }
}

const HEADS = new Set(["총평", "풀이", "조심할 점", "이렇게 해 보세요"]);

/** AI 풀이 버튼과 결과. body에는 카드 ID나 사주 글자 같은 계산 결과만 넣는다 */
export function AiReading({ body, dark = false }: { body: object; dark?: boolean }) {
  const [state, setState] = useState<{ status: "idle" | "loading" | "done" | "error"; text?: string }>({ status: "idle" });

  const ask = async () => {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/fortune/ask", { method: "POST", headers: { "content-type": "application/json", "x-fortune-device": deviceId() }, body: JSON.stringify(body) });
      const data: { text?: string; error?: string } = await res.json();
      setState(res.ok && data.text ? { status: "done", text: data.text } : { status: "error", text: data.error ?? "AI 풀이를 가져오지 못했어요." });
    } catch {
      setState({ status: "error", text: "연결이 끊겼어요. 잠시 뒤에 다시 눌러 주세요." });
    }
  };

  const sub = dark ? "text-lilac" : "text-[#5c5578]";
  return (
    <div className="mt-6" data-ai-reading>
      {state.status !== "done" && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <button type="button" className="fx-btn fx-btn-main" onClick={ask} disabled={state.status === "loading"}>
            {state.status === "loading" ? "AI가 풀이를 쓰는 중이에요(20초쯤)" : "AI 상담가에게 자세히 듣기"}
          </button>
          <p className={`m-0 text-[13px] leading-[1.6] ${sub}`}>카드 이름·사주 글자와 질문만 Claude(AI)로 보내요. 생년월일은 보내지 않고, 아무것도 저장하지 않아요. 하루 3번.</p>
        </div>
      )}
      <div aria-live="polite">
        {state.status === "error" && <p role="alert" className="m-0 mt-3 rounded-[10px] bg-[#4a2036] px-4 py-3 text-[14.5px] leading-[1.6] text-[#ffd7dd]">{state.text}</p>}
        {state.status === "done" && (
          <div className={`fx-reading rounded-[14px] border p-5 ${dark ? "border-[#5be08a] bg-[#120e22]" : "border-[#2f9a5a] bg-white"}`}>
            <p className={`m-0 font-pixel text-[13px] font-bold ${dark ? "text-mint" : "text-[#1f7a45]"}`}>AI 풀이</p>
            {state.text!.split("\n").filter((l) => l.trim()).map((l, i) =>
              HEADS.has(l.trim())
                ? <h4 key={i} className="fx-h3 mt-4 text-[16px]!">{l.trim()}</h4>
                : <p key={i} className={`m-0 mt-2 max-w-[70ch] text-[15.5px] leading-[1.8] break-keep ${dark ? "text-[#e4dff4]" : "text-[#1b1530]"}`}>{l}</p>,
            )}
            <p className={`m-0 mt-4 text-[12.5px] ${sub}`}>AI가 계산 결과를 바탕으로 쓴 글이에요. 재미로만 참고해 주세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}
