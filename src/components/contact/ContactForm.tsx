"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    const payload = {
      subject: formData.get("subject"),
      message: formData.get("message"),
      replyTo: formData.get("replyTo"),
      website: formData.get("website"), // honeypot
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "알 수 없는 오류" }));
        throw new Error(data.error ?? `서버 응답 오류 (${res.status})`);
      }

      setStatus("success");
      e.currentTarget.reset();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "전송 중 오류가 발생했습니다.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative z-10 space-y-6" noValidate>
      {/* Honeypot — hidden from real users */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-[-9999px]">
        <label htmlFor="website">Website (leave blank)</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="space-y-1 group">
        <div className="flex justify-between items-end">
          <label
            htmlFor="subject"
            className="font-[family-name:var(--font-label)] text-[11px] text-primary tracking-[0.2em] uppercase"
          >
            제목
          </label>
          <span aria-hidden="true" className="text-[9px] text-white/30 font-mono">
            REQ_FIELD
          </span>
        </div>
        <div className="neon-border-bottom">
          <input
            id="subject"
            name="subject"
            type="text"
            required
            minLength={1}
            maxLength={100}
            placeholder="제목을 입력하세요"
            autoComplete="off"
            className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none text-on-surface font-[family-name:var(--font-body)] px-0 py-2 text-lg placeholder:text-white/20"
          />
        </div>
      </div>

      <div className="space-y-1 group">
        <div className="flex justify-between items-end">
          <label
            htmlFor="replyTo"
            className="font-[family-name:var(--font-label)] text-[11px] text-primary tracking-[0.2em] uppercase"
          >
            회신 받을 이메일 (선택)
          </label>
          <span aria-hidden="true" className="text-[9px] text-white/30 font-mono">
            OPT
          </span>
        </div>
        <div className="neon-border-bottom">
          <input
            id="replyTo"
            name="replyTo"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none text-on-surface font-[family-name:var(--font-body)] px-0 py-2 text-base placeholder:text-white/20"
          />
        </div>
      </div>

      <div className="space-y-1 group">
        <div className="flex justify-between items-end">
          <label
            htmlFor="message"
            className="font-[family-name:var(--font-label)] text-[11px] text-primary tracking-[0.2em] uppercase"
          >
            문의 내용
          </label>
          <span aria-hidden="true" className="text-[9px] text-white/30 font-mono">
            DATA_STREAM
          </span>
        </div>
        <div className="neon-border-bottom">
          <textarea
            id="message"
            name="message"
            required
            minLength={10}
            maxLength={2000}
            rows={5}
            placeholder="10자 이상 입력해 주세요"
            className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none text-on-surface font-[family-name:var(--font-body)] px-0 py-2 text-base placeholder:text-white/20 resize-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full group/btn relative py-4 bg-primary overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed min-h-[48px]"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
        <div className="relative flex items-center justify-center gap-3 text-on-primary font-[family-name:var(--font-headline)] font-bold uppercase tracking-[0.3em] text-sm">
          <span>
            {status === "submitting"
              ? "TRANSFERRING..."
              : status === "success"
              ? "TRANSFER COMPLETE"
              : "INITIATE TRANSFER"}
          </span>
          <span aria-hidden="true">›</span>
        </div>
      </button>

      <div
        role="status"
        aria-live="polite"
        className="min-h-[1.5rem] font-[family-name:var(--font-label)] text-xs tracking-widest"
      >
        {status === "success" && (
          <p className="text-primary">
            ✓ 전송 완료. 최대한 빠르게 회신드리겠습니다.
          </p>
        )}
        {status === "error" && (
          <p className="text-error">✕ {errorMessage || "전송 실패. 잠시 후 다시 시도해 주세요."}</p>
        )}
      </div>
    </form>
  );
}
