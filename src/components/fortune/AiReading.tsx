"use client";

import { useRef, useState, type FormEvent } from "react";
import { DAILY_AI, MAX_FOLLOWUPS } from "@/lib/fortune/ai/limits";
import { blockedQuestion } from "@/lib/fortune/tarot/reading";

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
type Msg = { role: "assistant" | "user"; text: string };

/**
 * AI 상담. 첫 풀이 뒤에 이어서 물을 수 있다.
 * body에는 카드 ID나 사주 글자 같은 계산 결과만 넣는다. 대화는 이 화면에만 있고 저장하지 않는다.
 */
export function AiReading({ body, dark = false }: { body: object; dark?: boolean }) {
  const [thread, setThread] = useState<Msg[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const send = async (next: Msg[]) => {
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/fortune/ask", {
        method: "POST",
        headers: { "content-type": "application/json", "x-fortune-device": deviceId() },
        // 첫 풀이(thread 0개)는 자료만, 이어 묻기는 지금까지의 대화를 함께 보낸다
        body: JSON.stringify({ ...body, thread: next }),
      });
      const data: { text?: string; error?: string; blocked?: boolean } = await res.json();
      if (!res.ok || !data.text) throw new Error(data.error ?? "AI 풀이를 가져오지 못했어요.");
      if (data.blocked) {
        // 답하지 않는 질문이면 대화에 넣지 않고 안내만 보여 준다
        setThread(next.slice(0, -1));
        setError(data.text);
      } else {
        setThread([...next, { role: "assistant", text: data.text }]);
        setQ("");
      }
      setStatus("idle");
      requestAnimationFrame(() => endRef.current?.scrollIntoView({ block: "nearest", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }));
    } catch (e) {
      setThread(next.length ? next.slice(0, -1) : []);
      setStatus("error");
      setError(e instanceof Error && e.message !== "Failed to fetch" ? e.message : "연결이 끊겼어요. 잠시 뒤에 다시 눌러 주세요.");
    }
  };

  const followups = thread.filter((m) => m.role === "user").length;
  const canFollow = thread.length > 0 && followups < MAX_FOLLOWUPS;

  const ask = (e: FormEvent) => {
    e.preventDefault();
    const text = q.trim();
    if (!text) return setError("궁금한 것을 한 줄로 적어 주세요.");
    const blocked = blockedQuestion(text);
    if (blocked) return setError(blocked);
    void send([...thread, { role: "user", text }]);
  };

  const sub = dark ? "text-lilac" : "text-[#5c5578]";
  const loading = status === "loading";
  return (
    <div className="mt-6" data-ai-reading>
      {thread.length === 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <button type="button" className="fx-btn fx-btn-main" onClick={() => send([])} disabled={loading}>
            {loading ? "AI가 풀이를 쓰는 중이에요(20초쯤)" : "AI 상담가에게 자세히 듣기"}
          </button>
          <p className={`m-0 text-[13px] leading-[1.6] ${sub}`}>카드 이름·사주 글자와 질문만 Claude(AI)로 보내요. 생년월일은 보내지 않고, 아무것도 저장하지 않아요. 풀이 뒤에 이어서 {MAX_FOLLOWUPS}번까지 물을 수 있어요(하루 {DAILY_AI}번).</p>
        </div>
      )}
      <div aria-live="polite">
        {thread.length > 0 && (
          <div className={`fx-reading rounded-[14px] border p-5 ${dark ? "border-[#5be08a] bg-[#120e22]" : "border-[#2f9a5a] bg-white"}`}>
            <p className={`m-0 font-pixel text-[13px] font-bold ${dark ? "text-mint" : "text-[#1f7a45]"}`}>AI 상담</p>
            {thread.map((m, i) => (m.role === "user" ? <Question key={i} text={m.text} dark={dark} /> : <Answer key={i} text={m.text} dark={dark} />))}
            {loading && <p className={`m-0 mt-4 text-[14.5px] ${sub}`}>AI가 답을 쓰는 중이에요…</p>}
            <div ref={endRef} />
            {canFollow ? (
              <form onSubmit={ask} className="mt-5 flex flex-col gap-2 sm:flex-row">
                <label htmlFor={`follow-${dark ? "d" : "l"}`} className="sr-only">이어서 묻기</label>
                <input id={`follow-${dark ? "d" : "l"}`} className="fx-input" maxLength={200} autoComplete="off" value={q} disabled={loading} onChange={(e) => { setQ(e.target.value); setError(null); }} placeholder="예) 그럼 올해 하반기에는 어떻게 해야 할까요?" />
                <button type="submit" className="fx-btn fx-btn-main flex-none" disabled={loading}>이어서 묻기</button>
              </form>
            ) : (
              !loading && <p className={`m-0 mt-4 text-[13.5px] ${sub}`}>이 상담에서는 {MAX_FOLLOWUPS}번까지 물을 수 있어요. 다른 주제를 고르면 새로 상담할 수 있어요.</p>
            )}
            {canFollow && <p className={`m-0 mt-2 text-[12.5px] ${sub}`}>이어서 {MAX_FOLLOWUPS - followups}번 더 물을 수 있어요. 이름이나 연락처는 적지 마세요.</p>}
            <p className={`m-0 mt-3 text-[12.5px] ${sub}`}>AI가 계산 결과를 바탕으로 쓴 글이에요. 재미로만 참고해 주세요.</p>
          </div>
        )}
        {error && <p role="alert" className="m-0 mt-3 rounded-[10px] bg-[#4a2036] px-4 py-3 text-[14.5px] leading-[1.6] text-[#ffd7dd]">{error}</p>}
      </div>
    </div>
  );
}

function Question({ text, dark }: { text: string; dark: boolean }) {
  return <p className={`m-0 mt-5 ml-auto w-fit max-w-[85%] rounded-[12px] px-4 py-2 text-[15px] leading-[1.7] break-keep ${dark ? "bg-[#2a2150] text-white" : "bg-[#eeeaf6] text-[#1b1530]"}`}><span className="sr-only">내 질문: </span>{text}</p>;
}

function Answer({ text, dark }: { text: string; dark: boolean }) {
  return (
    <div className="mt-2">
      {text.split("\n").filter((l) => l.trim()).map((l, i) =>
        HEADS.has(l.trim())
          ? <h4 key={i} className="fx-h3 mt-4 text-[16px]!">{l.trim()}</h4>
          : <p key={i} className={`m-0 mt-2 text-[15.5px] leading-[1.8] break-keep ${dark ? "text-[#e4dff4]" : "text-[#1b1530]"}`}>{l}</p>,
      )}
    </div>
  );
}
