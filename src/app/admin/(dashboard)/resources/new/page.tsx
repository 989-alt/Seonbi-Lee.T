import { BackButton } from "../../BackButton";
import { ResourceForm } from "../ResourceForm";
import { createResourceAction } from "../actions";
import { listAllCourses } from "@/lib/repositories/courses";
import type { ResourceRow } from "@/lib/repositories/types";

export const metadata = { title: "새 자료 // ADMIN" };

export default async function NewResourcePage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string; kind?: string }>;
}) {
  const sp = await searchParams;
  const courses = await listAllCourses();

  const initial: Partial<ResourceRow> = {
    course_slug: sp.course ?? null,
    kind:
      sp.kind === "gallery"
        ? "gallery"
        : sp.kind === "lesson"
          ? "lesson"
          : undefined,
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <BackButton />
        <h1 className="font-[family-name:var(--font-headline)] text-3xl font-bold text-on-surface uppercase mt-4">
          새 자료
        </h1>
      </div>
      <div className="bg-surface-container-low p-6 md:p-8 relative">
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 w-[2px] h-full bg-primary"
        />
        <ResourceForm
          initial={initial}
          action={createResourceAction}
          submitLabel="CREATE RESOURCE"
          courses={courses}
        />
      </div>
    </div>
  );
}
