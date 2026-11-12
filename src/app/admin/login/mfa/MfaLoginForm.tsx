"use client";

import { useActionState } from "react";
import { cancelMfaLoginAction, verifyMfaLoginAction } from "../actions";

const initialState = { error: null as string | null };

export function MfaLoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction, pending] = useActionState(verifyMfaLoginAction, initialState);

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-6" noValidate>
        <input type="hidden" name="redirect" value={redirectTo} />
        <div className="space-y-1">
          <label htmlFor="code" className="font-[family-name:var(--font-label)] text-[11px] text-primary tracking-[0.2em] uppercase">
            인증 코드
          </label>
          <div className="neon-border-bottom">
            <input
              id="code"
              name="code"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              autoComplete="one-time-code"
              autoFocus
              required
              className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none text-on-surface tracking-[0.5em] text-2xl px-0 py-2"
            />
          </div>
        </div>
        {state?.error && (
          <p role="alert" className="text-sm text-error">
            {state.error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="w-full min-h-[48px] bg-primary text-on-primary font-bold tracking-widest uppercase disabled:opacity-60"
        >
          {pending ? "확인 중…" : "확인"}
        </button>
      </form>
      <form action={cancelMfaLoginAction}>
        <button type="submit" className="w-full min-h-[44px] text-sm text-on-surface-variant hover:text-error">
          취소하고 로그아웃
        </button>
      </form>
    </div>
  );
}
