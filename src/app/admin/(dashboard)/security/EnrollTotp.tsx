"use client";

import { useActionState, useState, useTransition } from "react";
import { confirmEnrollAction, startEnrollAction, type EnrollState } from "./actions";

type ScanState = Extract<EnrollState, { step: "scan" }>;

export function EnrollTotp() {
  const [started, setStarted] = useState<EnrollState>({ step: "idle", error: null });
  const [pending, startTransition] = useTransition();

  if (started.step === "scan") return <ScanForm key={started.factorId} initial={started} />;

  return (
    <div className="space-y-3">
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(async () => setStarted(await startEnrollAction()))}
        className="min-h-[44px] bg-primary px-5 font-bold text-on-primary disabled:opacity-60"
      >
        {pending ? "준비 중…" : "2단계 인증 등록하기"}
      </button>
      {started.error && <p role="alert" className="text-sm text-error">{started.error}</p>}
    </div>
  );
}

function ScanForm({ initial }: { initial: ScanState }) {
  const [state, formAction, pending] = useActionState(confirmEnrollAction, initial as EnrollState);
  const view = state.step === "scan" ? state : initial;

  return (
    <form action={formAction} className="space-y-4">
      <ol className="list-decimal space-y-1 pl-5 text-sm text-on-surface-variant">
        <li>휴대폰 인증 앱(Google Authenticator, Microsoft Authenticator 등)을 엽니다.</li>
        <li>아래 QR을 스캔합니다. 스캔이 안 되면 비밀키를 직접 입력합니다.</li>
        <li>앱에 나온 6자리 숫자를 입력합니다.</li>
      </ol>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={view.qr} alt="2단계 인증 등록 QR 코드" width={200} height={200} className="bg-white p-2" />
      <p className="break-all font-mono text-xs text-on-surface-variant">비밀키: {view.secret}</p>
      <input
        name="code"
        inputMode="numeric"
        maxLength={6}
        autoComplete="one-time-code"
        aria-label="인증 코드 6자리"
        className="w-40 border border-outline-variant bg-transparent px-3 py-2 text-xl tracking-[0.4em] text-on-surface"
      />
      {state.error && <p role="alert" className="text-sm text-error">{state.error}</p>}
      <button type="submit" disabled={pending} className="block min-h-[44px] bg-primary px-5 font-bold text-on-primary disabled:opacity-60">
        {pending ? "확인 중…" : "등록 완료"}
      </button>
    </form>
  );
}
