import Link from "next/link";
import { BackButton } from "../../BackButton";
import { notFound } from "next/navigation";
import { CourseForm } from "../CourseForm";
import { updateCourseAction, deleteCourseAction } from "../actions";
import { getCourseById } from "@/lib/repositories/courses";
import { DeleteCourseButton } from "../DeleteCourseButton";
import { listAllResourcesByCourse } from "@/lib/repositories/resources";
import { deleteResourceAction } from "@/app/admin/(dashboard)/resources/actions";
import { DeleteResourceButton } from "@/app/admin/(dashboard)/resources/DeleteResourceButton";
import type { ResourceRow } from "@/lib/repositories/types";

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

  const items = await listAllResourcesByCourse(course.slug);
  const lessons = items.filter((r) => r.kind === "lesson");
  const gallery = items.filter((r) => r.kind === "gallery");

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <BackButton />
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

      {/* ── 이 코스의 자료 ── */}
      <section className="space-y-6">
        <h2 className="font-[family-name:var(--font-headline)] text-xl font-bold text-on-surface uppercase tracking-widest">
          이 코스의 자료
        </h2>

        {/* 레슨 subsection */}
        <ResourceSubsection
          title="레슨"
          items={lessons}
          emptyHint="등록된 레슨이 없습니다."
          addLabel="+ 레슨 추가"
          addHref={`/admin/resources/new?course=${course.slug}&kind=lesson`}
          deleteAction={deleteResourceAction}
        />

        {/* 스킬 subsection */}
        <ResourceSubsection
          title="스킬"
          items={gallery}
          emptyHint="등록된 스킬 항목이 없습니다."
          addLabel="+ 스킬 추가"
          addHref={`/admin/resources/new?course=${course.slug}&kind=gallery`}
          deleteAction={deleteResourceAction}
        />
      </section>
    </div>
  );
}

function ResourceSubsection({
  title,
  items,
  emptyHint,
  addLabel,
  addHref,
  deleteAction,
}: {
  title: string;
  items: ResourceRow[];
  emptyHint: string;
  addLabel: string;
  addHref: string;
  deleteAction: (id: string) => Promise<void>;
}) {
  return (
    <div className="bg-surface-container-low relative">
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 w-[2px] h-full bg-secondary"
      />
      <div className="p-4 md:p-6 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <span className="font-[family-name:var(--font-label)] text-[11px] text-secondary tracking-[0.2em] uppercase">
            {title}
          </span>
          <Link
            href={addHref}
            className="font-[family-name:var(--font-label)] text-[10px] tracking-widest uppercase text-secondary border border-secondary/40 px-3 py-1.5 hover:bg-secondary/10 transition-colors"
          >
            {addLabel}
          </Link>
        </div>

        {items.length === 0 ? (
          <p className="text-on-surface-variant text-xs font-[family-name:var(--font-body)] py-2">
            {emptyHint}
          </p>
        ) : (
          <div className="space-y-0">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 border-b border-outline-variant/10 py-3 last:border-b-0"
              >
                {/* status badge */}
                <span
                  className={[
                    "font-[family-name:var(--font-label)] text-[9px] tracking-widest uppercase px-2 py-0.5 shrink-0",
                    item.status === "published"
                      ? "bg-primary/15 text-primary"
                      : "bg-outline-variant/20 text-on-surface-variant",
                  ].join(" ")}
                >
                  {item.status === "published" ? "공개" : "임시"}
                </span>

                {/* title */}
                <span className="flex-1 text-on-surface font-[family-name:var(--font-body)] text-sm truncate">
                  {item.title}
                </span>

                {/* edit link */}
                <Link
                  href={`/admin/resources/${item.id}`}
                  className="font-[family-name:var(--font-label)] text-xs text-primary hover:underline tracking-widest uppercase shrink-0"
                >
                  편집
                </Link>

                {/* delete */}
                <DeleteResourceButton
                  action={deleteAction.bind(null, item.id)}
                  itemLabel={item.title}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
