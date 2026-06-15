import { BackButton } from "../../BackButton";
import { notFound } from "next/navigation";
import { ResourceForm } from "../ResourceForm";
import { updateResourceAction, deleteResourceAction } from "../actions";
import { getResourceById } from "@/lib/repositories/resources";
import { DeleteResourceButton } from "../DeleteResourceButton";
import { listAllCourses } from "@/lib/repositories/courses";

export const metadata = { title: "자료 편집 // ADMIN" };

export default async function EditResourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [resource, courses] = await Promise.all([
    getResourceById(id),
    listAllCourses(),
  ]);
  if (!resource) notFound();

  const boundUpdate = updateResourceAction.bind(null, id);
  const boundDelete = deleteResourceAction.bind(null, id);

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <BackButton />
          <h1 className="font-[family-name:var(--font-headline)] text-3xl font-bold text-on-surface uppercase mt-4">
            자료 편집
          </h1>
        </div>
        <DeleteResourceButton action={boundDelete} itemLabel={resource.title} />
      </div>

      <div className="bg-surface-container-low p-6 md:p-8 relative">
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 w-[2px] h-full bg-primary"
        />
        <ResourceForm
          initial={resource}
          action={boundUpdate}
          submitLabel="UPDATE RESOURCE"
          courses={courses}
        />
      </div>
    </div>
  );
}
