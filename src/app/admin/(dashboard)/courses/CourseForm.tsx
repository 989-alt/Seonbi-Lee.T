"use client";

import { useActionState } from "react";
import type { CourseRow } from "@/lib/repositories/types";

type State = { error: string | null };
const initialState: State = { error: null };

interface CourseFormProps {
  initial?: Partial<CourseRow>;
  action: (prev: State | undefined, formData: FormData) => Promise<State>;
  submitLabel: string;
}

export function CourseForm({ initial, action, submitLabel }: CourseFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          label="Slug"
          name="slug"
          required
          defaultValue={initial?.slug ?? ""}
          placeholder="예: claude-code-intro"
        />
        <Select
          label="악센트 색상"
          name="accent"
          required
          defaultValue={initial?.accent ?? "primary"}
          options={[
            { value: "primary", label: "Cyan" },
            { value: "secondary", label: "Purple" },
            { value: "tertiary", label: "Orange" },
          ]}
        />
      </div>

      <Field label="제목" name="title" required defaultValue={initial?.title ?? ""} />
      <TextArea
        label="설명"
        name="description"
        rows={3}
        defaultValue={initial?.description ?? ""}
        maxLength={600}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          label="정렬 순서 (낮을수록 위)"
          name="sort_order"
          defaultValue={String(initial?.sort_order ?? 0)}
          placeholder="0"
        />
        <Select
          label="상태"
          name="status"
          required
          defaultValue={initial?.status ?? "draft"}
          options={[
            { value: "draft", label: "DRAFT (비공개)" },
            { value: "published", label: "PUBLISHED (공개)" },
          ]}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full py-4 bg-primary text-on-primary font-[family-name:var(--font-headline)] font-bold uppercase tracking-[0.3em] text-sm hover:bg-primary-dim transition-colors disabled:opacity-60 disabled:cursor-not-allowed min-h-[48px]"
      >
        {pending ? "SAVING..." : submitLabel}
      </button>

      <div role="status" aria-live="polite" className="min-h-[1.5rem]">
        {state.error && (
          <p className="text-error font-[family-name:var(--font-label)] text-xs tracking-widest">
            &#10005; {state.error}
          </p>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  required,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label
        htmlFor={name}
        className="font-[family-name:var(--font-label)] text-[11px] text-primary tracking-[0.2em] uppercase"
      >
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <div className="neon-border-bottom">
        <input
          id={name}
          name={name}
          type="text"
          required={required}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none text-on-surface font-[family-name:var(--font-body)] px-0 py-2 text-base placeholder:text-white/20"
        />
      </div>
    </div>
  );
}

function TextArea({
  label,
  name,
  required,
  rows = 4,
  defaultValue,
  maxLength,
}: {
  label: string;
  name: string;
  required?: boolean;
  rows?: number;
  defaultValue?: string;
  maxLength?: number;
}) {
  return (
    <div className="space-y-1">
      <label
        htmlFor={name}
        className="font-[family-name:var(--font-label)] text-[11px] text-primary tracking-[0.2em] uppercase"
      >
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <div className="neon-border-bottom">
        <textarea
          id={name}
          name={name}
          required={required}
          rows={rows}
          defaultValue={defaultValue}
          maxLength={maxLength}
          className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none text-on-surface font-[family-name:var(--font-body)] px-0 py-2 text-base placeholder:text-white/20 resize-y"
        />
      </div>
    </div>
  );
}

function Select({
  label,
  name,
  required,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  required?: boolean;
  defaultValue?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-1">
      <label
        htmlFor={name}
        className="font-[family-name:var(--font-label)] text-[11px] text-primary tracking-[0.2em] uppercase"
      >
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <select
        id={name}
        name={name}
        required={required}
        defaultValue={defaultValue}
        className="w-full bg-surface-container-high border border-outline-variant/30 text-on-surface font-[family-name:var(--font-body)] px-3 py-2 text-base focus:border-primary focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
