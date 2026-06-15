import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseForm } from "../CourseForm";
import { updateCourseAction, deleteCourseAction } from "../actions";
import { getCourseById } from "@/lib/repositories/courses";
import { DeleteCourseButton } from "../DeleteCourseButton";

export const metadata = { title: "코스 편집 // ADMIN" };

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await getCourseById(id);
  if (!course) notFound();

  const boundUpdate = updateCourseAction.bind(null, id);
  const boundDelete = deleteCourseAction.bind(null, id);

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/courses"
            className="font-[family-name:var(--font-label)] text-xs text-on-surface-variant hover:text-primary tracking-widest uppercase"
          >
            ← 목록으로
          </Link>
          <h1 className="font-[family-name:var(--font-headline)] text-3xl font-bold text-on-surface uppercase mt-4">
            코스 편집
          </h1>
        </div>
        <DeleteCourseButton action={boundDelete} itemLabel={course.title} />
      </div>

      <div className="bg-surface-container-low p-6 md:p-8 relative">
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 w-[2px] h-full bg-primary"
        />
        <CourseForm
          initial={course}
          action={boundUpdate}
          submitLabel="UPDATE COURSE"
        />
      </div>
    </div>
  );
}
