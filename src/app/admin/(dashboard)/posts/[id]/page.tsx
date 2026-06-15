import { BackButton } from "../../BackButton";
import { notFound } from "next/navigation";
import { PostForm } from "../PostForm";
import { updatePostAction, deletePostAction } from "../actions";
import { getPostById, publicHeroUrl } from "@/lib/repositories/posts";
import { DeletePostButton } from "../DeletePostButton";

export const metadata = { title: "글 편집 // ADMIN" };

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();

  const boundUpdate = updatePostAction.bind(null, id);
  const boundDelete = deletePostAction.bind(null, id);

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <BackButton />
          <h1 className="font-[family-name:var(--font-headline)] text-3xl font-bold text-on-surface uppercase mt-4">
            글 편집
          </h1>
        </div>
        <DeletePostButton action={boundDelete} itemLabel={post.title} />
      </div>

      <div className="bg-surface-container-low p-6 md:p-8 relative">
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 w-[2px] h-full bg-primary"
        />
        <PostForm
          initial={post}
          action={boundUpdate}
          currentHeroUrl={publicHeroUrl(post.hero_image_path)}
          submitLabel="UPDATE POST"
        />
      </div>
    </div>
  );
}
