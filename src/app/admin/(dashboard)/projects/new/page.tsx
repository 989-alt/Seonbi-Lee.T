import { ProjectForm } from "../ProjectForm";
import { createProjectAction } from "../actions";
import Link from "next/link";

export const metadata = { title: "새 프로젝트 // ADMIN" };

export default function NewProjectPage() {
  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <Link
          href="/admin/projects"
          className="font-[family-name:var(--font-label)] text-xs text-on-surface-variant hover:text-primary tracking-widest uppercase"
        >
          ← 목록으로
        </Link>
        <h1 className="font-[family-name:var(--font-headline)] text-3xl font-bold text-on-surface uppercase mt-4">
          새 프로젝트
        </h1>
      </div>
      <div className="bg-surface-container-low p-6 md:p-8 relative">
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 w-[2px] h-full bg-primary"
        />
        <ProjectForm action={createProjectAction} submitLabel="CREATE PROJECT" />
      </div>
    </div>
  );
}
