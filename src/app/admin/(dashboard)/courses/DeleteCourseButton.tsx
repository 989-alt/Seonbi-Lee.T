"use client";

interface Props {
  action: () => Promise<void>;
  itemLabel: string;
}

export function DeleteCourseButton({ action, itemLabel }: Props) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`정말 "${itemLabel}"을(를) 삭제하시겠습니까? 되돌릴 수 없습니다.`)) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="py-3 px-5 border border-error/40 text-error font-[family-name:var(--font-label)] text-xs uppercase tracking-widest hover:bg-error/10 transition-colors min-h-[44px]"
      >
        삭제
      </button>
    </form>
  );
}
