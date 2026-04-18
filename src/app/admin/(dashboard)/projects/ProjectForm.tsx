"use client";

import { useActionState } from "react";
import Image from "next/image";
import type { ProjectRow } from "@/lib/repositories/types";

type State = { error: string | null };
const initialState: State = { error: null };

interface ProjectFormProps {
  initial?: Partial<ProjectRow>;
  action: (
    prev: State | undefined,
    formData: FormData
  ) => Promise<State>;
  currentThumbUrl?: string | null;
  submitLabel: string;
}

export function ProjectForm({
  initial,
  action,
  currentThumbUrl,
  submitLabel,
}: ProjectFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-6" encType="multipart/form-data">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Slug (URL 식별자)" name="slug" required defaultValue={initial?.slug ?? ""} placeholder="예: grade-manager" />
        <Field label="버전" name="version" defaultValue={initial?.version ?? ""} placeholder="예: v1.2" />
      </div>

      <Field label="한글 제목" name="title_ko" required defaultValue={initial?.title_ko ?? ""} placeholder="예: 성적 관리 프로그램" />
      <Field label="영문 제목 (선택)" name="title_en" defaultValue={initial?.title_en ?? ""} placeholder="예: Grade Manager" />

      <TextArea label="설명" name="description" required rows={4} defaultValue={initial?.description ?? ""} maxLength={1000} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="카테고리"
          name="category"
          required
          defaultValue={initial?.category ?? "edutech"}
          options={[
            { value: "edutech", label: "에듀테크" },
            { value: "admin", label: "행정업무 경감" },
            { value: "class", label: "학급 경영" },
            { value: "etc", label: "기타" },
          ]}
        />
        <Select
          label="악센트 색상"
          name="accent"
          required
          defaultValue={initial?.accent ?? "tertiary"}
          options={[
            { value: "tertiary", label: "Orange (교육/에듀테크)" },
            { value: "primary", label: "Cyan (비즈니스/행정)" },
            { value: "secondary", label: "Purple (창작/학급)" },
            { value: "on-surface", label: "White (기타)" },
          ]}
        />
      </div>

      <Field label="기술 스택 (쉼표로 구분)" name="tech_stack" defaultValue={initial?.tech_stack?.join(", ") ?? ""} placeholder="예: Next.js, Supabase, TypeScript" />
      <Field label="외부 링크 (선택)" name="external_url" type="url" defaultValue={initial?.external_url ?? ""} placeholder="https://..." />

      <div className="space-y-2">
        <label className="font-[family-name:var(--font-label)] text-[11px] text-primary tracking-[0.2em] uppercase">
          썸네일 이미지 (5MB 이하, 선택)
        </label>
        {currentThumbUrl && (
          <div className="mb-3 relative w-40 h-24 bg-surface-container-high overflow-hidden">
            <Image
              src={currentThumbUrl}
              alt="현재 썸네일"
              fill
              className="object-cover"
              sizes="160px"
              unoptimized
            />
          </div>
        )}
        <input
          type="file"
          name="thumbnail"
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
          { value: "archived", label: "ARCHIVED (보관)" },
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
  type = "text",
}: {
  label: string;
  name: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
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
          type={type}
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
