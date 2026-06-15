"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import type { PostRow } from "@/lib/repositories/types";

type State = { error: string | null };
const initialState: State = { error: null };

interface PostFormProps {
  initial?: Partial<PostRow>;
  action: (prev: State | undefined, formData: FormData) => Promise<State>;
  currentHeroUrl?: string | null;
  submitLabel: string;
}

export function PostForm({
  initial,
  action,
  currentHeroUrl,
  submitLabel,
}: PostFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [content, setContent] = useState(initial?.content_md ?? "");

  return (
    <form action={formAction} className="space-y-6" encType="multipart/form-data">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Slug" name="slug" defaultValue={initial?.slug ?? ""} placeholder="비우면 제목에서 자동 생성 (영문 소문자·숫자·하이픈)" />
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
      <TextArea label="요약" name="excerpt" required rows={3} defaultValue={initial?.excerpt ?? ""} maxLength={400} />

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label
            htmlFor="content_md"
            className="font-[family-name:var(--font-label)] text-[11px] text-primary tracking-[0.2em] uppercase"
          >
            본문 (Markdown)
          </label>
          <span className="font-[family-name:var(--font-label)] text-[10px] text-on-surface-variant">
            {content.length.toLocaleString()}자
          </span>
        </div>
        <textarea
          id="content_md"
          name="content_md"
          rows={16}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="## 섹션&#10;&#10;Markdown으로 작성하세요."
          className="w-full bg-surface-container-high border border-outline-variant/30 text-on-surface font-mono px-3 py-3 text-sm focus:border-primary focus:outline-none resize-y"
        />
      </div>

      <Field label="태그 (쉼표로 구분)" name="tags" defaultValue={initial?.tags?.join(", ") ?? ""} placeholder="예: AI, 수업, Claude" />

      <div className="space-y-2">
        <label className="font-[family-name:var(--font-label)] text-[11px] text-primary tracking-[0.2em] uppercase">
          히어로 이미지 (5MB 이하, 선택)
        </label>
        {currentHeroUrl && (
          <div className="mb-3 relative w-40 h-24 bg-surface-container-high overflow-hidden">
            <Image
              src={currentHeroUrl}
              alt="현재 히어로"
              fill
              className="object-cover"
              sizes="160px"
              unoptimized
            />
          </div>
        )}
        <input
          type="file"
          name="hero"
          accept="image/webp,image/jpeg,image/png"
          className="block w-full text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-primary file:text-on-primary file:font-[family-name:var(--font-label)] file:text-xs file:uppercase file:tracking-widest hover:file:bg-primary-dim"
        />
      </div>

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
            ✕ {state.error}
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
      <label htmlFor={name} className="font-[family-name:var(--font-label)] text-[11px] text-primary tracking-[0.2em] uppercase">
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
      <label htmlFor={name} className="font-[family-name:var(--font-label)] text-[11px] text-primary tracking-[0.2em] uppercase">
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
      <label htmlFor={name} className="font-[family-name:var(--font-label)] text-[11px] text-primary tracking-[0.2em] uppercase">
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
