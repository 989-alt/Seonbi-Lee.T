import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCourseBySlug } from "@/lib/repositories/courses";
import { listPublishedResourcesByCourse } from "@/lib/repositories/resources";
import { ResourceAccordion } from "@/components/resources/ResourceAccordion";

const ACCENT_BORDER: Record<string, string> = {
  primary: "border-primary",
  secondary: "border-secondary",
  tertiary: "border-tertiary",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course || course.status !== "published") return {};
  return {
    title: `${course.title} // SEONBI'S LAB`,
    description: course.description,
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course || course.status !== "published") notFound();

  const resources = await listPublishedResourcesByCourse(slug);
  const lessons = resources.filter((r) => r.kind === "lesson");
  const gallery = resources.filter((r) => r.kind === "gallery");

  const accentBorder = ACCENT_BORDER[course.accent] ?? ACCENT_BORDER.primary;

  return (
    <main className="flex-grow pt-24 px-6 md:px-12 lg:px-24 pb-20 max-w-[1180px] mx-auto w-full">
      {/* BACK */}
      <div className="mt-8 mb-10">
        <Link
          href="/learn"
          className="font-[family-name:var(--font-label)] text-xs text-on-surface-variant hover:text-primary tracking-widest uppercase"
        >
          ← 배우기 목록으로
        </Link>
      </div>

      {/* COURSE HEADER */}
      <section className={`border-l-4 ${accentBorder} pl-6 mb-14`}>
        <div className="font-[family-name:var(--font-label)] text-xs text-primary tracking-[0.3em] uppercase mb-3">
          // COURSE
        </div>
        <h1 className="font-[family-name:var(--font-headline)] text-4xl md:text-6xl font-bold uppercase tracking-tighter text-on-surface leading-[1.02] mb-4">
          {course.title}
        </h1>
        {course.description && (
          <p className="font-[family-name:var(--font-body)] text-on-surface-variant text-base md:text-lg max-w-2xl leading-relaxed">
            {course.description}
          </p>
        )}
      </section>

      {resources.length === 0 && (
        <div className="bg-surface-container-low p-12 text-center">
          <p className="text-on-surface-variant font-[family-name:var(--font-body)]">
            이 코스에 등록된 자료가 아직 없습니다.
          </p>
        </div>
      )}

      {/* LESSONS */}
      {lessons.length > 0 && (
        <section className="border-t border-outline-variant/30 pt-12 mb-14">
          <div className="font-[family-name:var(--font-label)] text-xs text-primary tracking-widest uppercase mb-2">
            // LESSONS
          </div>
          <h2 className="font-[family-name:var(--font-headline)] text-3xl md:text-4xl font-bold uppercase text-on-surface mb-8">
            레슨
          </h2>
          <ResourceAccordion resources={lessons} />
        </section>
      )}

      {/* SKILLS GALLERY */}
      {gallery.length > 0 && (
        <section className="border-t border-outline-variant/30 pt-12">
          <div className="font-[family-name:var(--font-label)] text-xs text-primary tracking-widest uppercase mb-2">
            // SKILLS &amp; TEMPLATES
          </div>
          <h2 className="font-[family-name:var(--font-headline)] text-3xl md:text-4xl font-bold uppercase text-on-surface mb-8">
            스킬
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gallery.map((g) => {
              const url = g.links?.[0]?.url ?? "#";
              return (
                <a
                  key={g.id}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-surface-container-low border-t-2 border-secondary p-6 hover:bg-surface-container-high transition-colors"
                >
                  <h3 className="font-[family-name:var(--font-headline)] text-lg font-bold text-on-surface mb-2">
                    {g.title}
                  </h3>
                  <p className="text-on-surface-variant text-sm">{g.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {g.tags?.map((t) => (
                      <span
                        key={t}
                        className="font-[family-name:var(--font-label)] text-[10px] uppercase tracking-wider text-outline border border-outline-variant/30 px-2 py-0.5"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
