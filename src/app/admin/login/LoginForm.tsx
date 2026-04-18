"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

interface LoginFormProps {
  redirectTo: string;
}

const initialState = { error: null as string | null };

export function LoginForm({ redirectTo }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <input type="hidden" name="redirect" value={redirectTo} />

      <div className="space-y-1">
        <label
          htmlFor="email"
          className="font-[family-name:var(--font-label)] text-[11px] text-primary tracking-[0.2em] uppercase"
        >
          이메일
        </label>
        <div className="neon-border-bottom">
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="admin@example.com"
            className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none text-on-surface font-[family-name:var(--font-body)] px-0 py-2 text-base placeholder:text-white/20"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label
          htmlFor="password"
          className="font-[family-name:var(--font-label)] text-[11px] text-primary tracking-[0.2em] uppercase"
        >
          비밀번호
        </label>
        <div className="neon-border-bottom">
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none text-on-surface font-[family-name:var(--font-body)] px-0 py-2 text-base placeholder:text-white/20"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full py-4 bg-primary text-on-primary font-[family-name:var(--font-headline)] font-bold uppercase tracking-[0.3em] text-sm hover:bg-primary-dim transition-colors disabled:opacity-60 disabled:cursor-not-allowed min-h-[48px]"
      >
        {pending ? "AUTHENTICATING..." : "ACCESS TERMINAL"}
      </button>

      <div
        role="status"
        aria-live="polite"
        className="min-h-[1.5rem] font-[family-name:var(--font-label)] text-xs tracking-widest"
      >
        {state.error && <p className="text-error">✕ {state.error}</p>}
      </div>
    </form>
  );
}
