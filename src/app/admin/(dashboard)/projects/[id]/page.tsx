import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectForm } from "../ProjectForm";
import { updateProjectAction, deleteProjectAction } from "../actions";
import { getProjectById, publicThumbnailUrl } from "@/lib/repositories/projects";
import { DeleteButton } from "../DeleteButton";

export const metadata = { title: "프로젝트 편집 // ADMIN" };

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  const boundUpdate = updateProjectAction.bind(null, id);
  const boundDelete = deleteProjectAction.bind(null, id);

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/projects"
            className="font-[family-name:var(--font-label)] text-xs text-on-surface-variant hover:text-primary tracking-widest uppercase"
          >
            ← 목록으로
          </Link>
          <h1 className="font-[family-name:var(--font-headline)] text-3xl font-bold text-on-surface uppercase mt-4">
            프로젝트 편집
          </h1>
        </div>
        <DeleteButton action={boundDelete} itemLabel={project.title_ko} />
      </div>

      <div className="bg-surface-container-low p-6 md:p-8 relative">
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 w-[2px] h-full bg-primary"
        />
        <ProjectForm
          initial={project}
          action={boundUpdate}
          currentThumbUrl={publicThumbnailUrl(project.thumbnail_path)}
          submitLabel="UPDATE PROJECT"
        />
      </div>
    </div>
  );
}
