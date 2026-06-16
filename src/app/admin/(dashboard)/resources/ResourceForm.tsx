"use client";

import { useActionState, useState } from "react";
import type {
  ResourceRow,
  ResourceLink,
  ResourcePrompt,
  CourseRow,
} from "@/lib/repositories/types";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { createResourceUploadUrl } from "./actions";

const UPLOAD_BUCKET = "resource-files";

type State = { error: string | null };
const initialState: State = { error: null };

interface ResourceFormProps {
  initial?: Partial<ResourceRow>;
  action: (prev: State | undefined, formData: FormData) => Promise<State>;
  submitLabel: string;
  courses?: CourseRow[];
}

export function ResourceForm({ initial, action, submitLabel, courses = [] }: ResourceFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [links, setLinks] = useState<ResourceLink[]>(initial?.links ?? []);
  const [prompts, setPrompts] = useState<ResourcePrompt[]>(initial?.prompts ?? []);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // 브라우저에서 Supabase Storage로 직접 업로드 → 성공 시 다운로드 링크로 추가
  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploadError(null);
    setUploading(true);
    const supabase = createSupabaseBrowserClient();
    try {
      for (const file of Array.from(fileList)) {
        const signed = await createResourceUploadUrl(file.name, file.size);
        if (!signed.ok) {
          setUploadError(signed.error);
          continue;
        }
        const { error } = await supabase.storage
          .from(UPLOAD_BUCKET)
          .uploadToSignedUrl(signed.path, signed.token, file);
        if (error) {
          setUploadError(`${file.name}: 업로드 실패 (${error.message})`);
          continue;
        }
        setLinks((v) => [
          ...v,
          { label: signed.label, url: signed.publicUrl, kind: "download" },
        ]);
      }
    } finally {
      setUploading(false);
    }
  }

  const addLink = () =>
    setLinks((v) => [...v, { label: "", url: "", kind: "link" }]);
  const updateLink = (i: number, patch: Partial<ResourceLink>) =>
    setLinks((v) => v.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  const removeLink = (i: number) =>
    setLinks((v) => v.filter((_, idx) => idx !== i));

  const addPrompt = () =>
    setPrompts((v) => [...v, { label: "", text: "" }]);
  const updatePrompt = (i: number, patch: Partial<ResourcePrompt>) =>
    setPrompts((v) => v.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  const removePrompt = (i: number) =>
    setPrompts((v) => v.filter((_, idx) => idx !== i));

  return (
    <form action={formAction} className="space-y-6" encType="multipart/form-data">
      {/* serialized dynamic arrays */}
      <input type="hidden" name="links_json" value={JSON.stringify(links)} />
      <input type="hidden" name="prompts_json" value={JSON.stringify(prompts)} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          label="Slug"
          name="slug"
          defaultValue={initial?.slug ?? ""}
          placeholder="비우면 제목에서 자동 생성 (영문 소문자·숫자·하이픈)"
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="종류"
          name="kind"
          required
          defaultValue={initial?.kind ?? "lesson"}
          options={[
            { value: "lesson", label: "레슨 (배우기 단계별)" },
            { value: "gallery", label: "갤러리 (스킬·템플릿 카드)" },
          ]}
        />
        <Select
          label="레벨 (레슨일 때)"
          name="level"
          defaultValue={initial?.level ?? ""}
          options={[
            { value: "", label: "— 없음 —" },
            { value: "entry", label: "입문" },
            { value: "basic", label: "기초" },
            { value: "applied", label: "실무" },
            { value: "advanced", label: "심화" },
            { value: "vibe", label: "바이브코딩" },
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
      <TextArea
        label="길잡이 본문 (선택)"
        name="body_md"
        rows={6}
        defaultValue={initial?.body_md ?? ""}
        maxLength={20000}
      />

      {/* FILE UPLOAD (교안) */}
      <section className="space-y-3">
        <span className="font-[family-name:var(--font-label)] text-[11px] text-primary tracking-[0.2em] uppercase">
          교안 파일 업로드
        </span>
        <div className="bg-surface-container-high border border-dashed border-outline-variant/40 p-4 space-y-2">
          <input
            type="file"
            multiple
            disabled={uploading}
            accept=".pdf,.pptx,.ppt,.key,.hwp,.hwpx,.doc,.docx,.xls,.xlsx,.csv,.zip,.txt,.md,.png,.jpg,.jpeg,.gif,.webp,.mp4"
            onChange={(e) => {
              void handleFiles(e.target.files);
              e.target.value = "";
            }}
            className="block w-full text-sm text-on-surface-variant file:mr-3 file:border-0 file:bg-primary file:text-on-primary file:px-4 file:py-2 file:font-[family-name:var(--font-label)] file:text-xs file:uppercase file:tracking-widest file:cursor-pointer disabled:opacity-50"
          />
          <p className="text-on-surface-variant text-xs font-[family-name:var(--font-body)]">
            PDF·PPTX·HWP/HWPX·DOCX·ZIP 등, 파일당 50MB 이하. 업로드하면 아래 <b>링크 / 다운로드</b> 목록에 자동 추가되고, 방문자에게 <b>다운로드 버튼</b>으로 제공됩니다.
          </p>
          {uploading && (
            <p className="text-primary text-xs font-[family-name:var(--font-label)] tracking-widest uppercase">
              업로드 중…
            </p>
          )}
          {uploadError && (
            <p className="text-error text-xs font-[family-name:var(--font-label)] tracking-widest">
              ✕ {uploadError}
            </p>
          )}
        </div>
      </section>

      {/* LINKS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-[family-name:var(--font-label)] text-[11px] text-primary tracking-[0.2em] uppercase">
            링크 / 다운로드
          </span>
          <button
            type="button"
            onClick={addLink}
            className="font-[family-name:var(--font-label)] text-[10px] tracking-widest uppercase text-primary border border-primary/40 px-3 py-1.5 hover:bg-primary/10 transition-colors"
          >
            + 링크 추가
          </button>
        </div>
        {links.length === 0 && (
          <p className="text-on-surface-variant text-xs font-[family-name:var(--font-body)]">
            드라이브·구글독스·GitHub repo·다운로드 URL을 추가하세요.
          </p>
        )}
        <div className="space-y-3">
          {links.map((l, i) => (
            <div
              key={i}
              className="bg-surface-container-high p-3 grid grid-cols-1 md:grid-cols-[1fr_1.5fr_auto_auto] gap-2 items-center"
            >
              <input
                type="text"
                value={l.label}
                onChange={(e) => updateLink(i, { label: e.target.value })}
                placeholder="라벨 (예: 강의원고)"
                className="bg-surface-container-low border border-outline-variant/30 text-on-surface px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
              <input
                type="url"
                value={l.url}
                onChange={(e) => updateLink(i, { url: e.target.value })}
                placeholder="https://..."
                className="bg-surface-container-low border border-outline-variant/30 text-on-surface px-3 py-2 text-sm font-mono focus:border-primary focus:outline-none"
              />
              <select
                value={l.kind}
                onChange={(e) =>
                  updateLink(i, { kind: e.target.value as ResourceLink["kind"] })
                }
                className="bg-surface-container-low border border-outline-variant/30 text-on-surface px-2 py-2 text-sm focus:border-primary focus:outline-none"
              >
                <option value="link">링크</option>
                <option value="download">다운로드</option>
              </select>
              <button
                type="button"
                onClick={() => removeLink(i)}
                className="text-error border border-error/40 px-3 py-2 text-xs uppercase tracking-widest hover:bg-error/10 transition-colors"
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* PROMPTS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-[family-name:var(--font-label)] text-[11px] text-primary tracking-[0.2em] uppercase">
            프롬프트 (복사용 텍스트)
          </span>
          <button
            type="button"
            onClick={addPrompt}
            className="font-[family-name:var(--font-label)] text-[10px] tracking-widest uppercase text-primary border border-primary/40 px-3 py-1.5 hover:bg-primary/10 transition-colors"
          >
            + 프롬프트 추가
          </button>
        </div>
        {prompts.length === 0 && (
          <p className="text-on-surface-variant text-xs font-[family-name:var(--font-body)]">
            수강생이 복사·붙여넣기 할 프롬프트를 넣으세요.
          </p>
        )}
        <div className="space-y-3">
          {prompts.map((p, i) => (
            <div key={i} className="bg-surface-container-high p-3 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={p.label}
                  onChange={(e) => updatePrompt(i, { label: e.target.value })}
                  placeholder="라벨 (예: 공문 초안 프롬프트)"
                  className="flex-grow bg-surface-container-low border border-outline-variant/30 text-on-surface px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removePrompt(i)}
                  className="shrink-0 text-error border border-error/40 px-3 py-2 text-xs uppercase tracking-widest hover:bg-error/10 transition-colors"
                >
                  삭제
                </button>
              </div>
              <textarea
                value={p.text}
                onChange={(e) => updatePrompt(i, { text: e.target.value })}
                rows={5}
                placeholder="프롬프트 본문..."
                className="w-full bg-surface-container-low border border-outline-variant/30 text-on-surface font-mono px-3 py-2 text-sm focus:border-primary focus:outline-none resize-y"
              />
            </div>
          ))}
        </div>
      </section>

      <Select
        label="코스"
        name="course_slug"
        defaultValue={initial?.course_slug ?? ""}
        options={[
          { value: "", label: "— 없음 —" },
          ...courses.map((c) => ({ value: c.slug, label: c.title })),
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          label="태그 (쉼표로 구분)"
          name="tags"
          defaultValue={initial?.tags?.join(", ") ?? ""}
          placeholder="예: Claude Code, 연수, 교안"
        />
        <Field
          label="정렬 순서 (낮을수록 위)"
          name="sort_order"
          defaultValue={String(initial?.sort_order ?? 0)}
          placeholder="0"
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
