import Link from "next/link";
import { listAllProjects } from "@/lib/repositories/projects";
import { listAllPosts } from "@/lib/repositories/posts";
import { listAllResources } from "@/lib/repositories/resources";
import { listAllCourses } from "@/lib/repositories/courses";

export const metadata = { title: "대시보드 // ADMIN" };

export default async function DashboardPage() {
  const [projects, posts, resources, courses] = await Promise.all([
    listAllProjects(),
    listAllPosts(),
    listAllResources(),
    listAllCourses(),
  ]);

  const publishedProjects = projects.filter((p) => p.status === "published");
  const draftProjects = projects.filter((p) => p.status === "draft");
  const publishedPosts = posts.filter((p) => p.status === "published");
  const draftPosts = posts.filter((p) => p.status === "draft");
  const publishedResources = resources.filter((r) => r.status === "published");
  const draftResources = resources.filter((r) => r.status === "draft");
  const publishedCourses = courses.filter((c) => c.status === "published");
  const draftCourses = courses.filter((c) => c.status === "draft");

  return (
    <div className="space-y-10">
      <div>
        <div className="font-[family-name:var(--font-label)] text-xs text-primary tracking-widest uppercase mb-2">
          STATUS: ACTIVE
        </div>
        <h1 className="font-[family-name:var(--font-headline)] text-4xl font-bold text-on-surface uppercase tracking-tight">
          대시보드
        </h1>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          label="프로젝트"
          total={projects.length}
          published={publishedProjects.length}
          draft={draftProjects.length}
          manageHref="/admin/projects"
          createHref="/admin/projects/new"
        />
        <StatCard
          label="AI 뉴스"
          total={posts.length}
          published={publishedPosts.length}
          draft={draftPosts.length}
          manageHref="/admin/posts"
          createHref="/admin/posts/new"
        />
        <StatCard
          label="자료실"
          total={resources.length}
          published={publishedResources.length}
          draft={draftResources.length}
          manageHref="/admin/resources"
          createHref="/admin/resources/new"
        />
        <StatCard
          label="코스"
          total={courses.length}
          published={publishedCourses.length}
          draft={draftCourses.length}
          manageHref="/admin/courses"
          createHref="/admin/courses/new"
        />
      </section>
    </div>
  );
}

function StatCard({
  label,
  total,
  published,
  draft,
  manageHref,
  createHref,
}: {
  label: string;
  total: number;
  published: number;
  draft: number;
  manageHref: string;
  createHref: string;
}) {
  return (
    <article className="bg-surface-container-low p-6 relative">
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 w-full h-[2px] bg-primary"
      />
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-[family-name:var(--font-headline)] text-xl uppercase text-on-surface">
          {label}
        </h2>
        <span className="font-[family-name:var(--font-label)] text-xs text-on-surface-variant tracking-widest">
          TOTAL: {total}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-surface-container-high p-4">
          <div className="font-[family-name:var(--font-label)] text-[10px] text-primary tracking-widest uppercase mb-1">
            PUBLISHED
          </div>
          <div className="font-[family-name:var(--font-headline)] text-3xl font-bold text-on-surface">
            {published}
          </div>
        </div>
        <div className="bg-surface-container-high p-4">
          <div className="font-[family-name:var(--font-label)] text-[10px] text-tertiary tracking-widest uppercase mb-1">
            DRAFT
          </div>
          <div className="font-[family-name:var(--font-headline)] text-3xl font-bold text-on-surface">
            {draft}
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <Link
          href={manageHref}
          className="flex-1 text-center py-3 border border-outline-variant/30 text-primary font-[family-name:var(--font-label)] text-xs uppercase tracking-widest hover:bg-primary/10 hover:border-primary transition-colors min-h-[44px] inline-flex items-center justify-center"
        >
          관리
        </Link>
        <Link
          href={createHref}
          className="flex-1 text-center py-3 bg-primary text-on-primary font-[family-name:var(--font-label)] text-xs uppercase tracking-widest hover:bg-primary-dim transition-colors min-h-[44px] inline-flex items-center justify-center"
        >
          + 새 글
        </Link>
      </div>
    </article>
  );
}
