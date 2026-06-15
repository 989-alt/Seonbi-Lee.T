import { BackButton } from "../../BackButton";
import { PostForm } from "../PostForm";
import { createPostAction } from "../actions";

export const metadata = { title: "새 글 // ADMIN" };

export default function NewPostPage() {
  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <BackButton />
        <h1 className="font-[family-name:var(--font-headline)] text-3xl font-bold text-on-surface uppercase mt-4">
          새 글
        </h1>
      </div>
      <div className="bg-surface-container-low p-6 md:p-8 relative">
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 w-[2px] h-full bg-primary"
        />
        <PostForm action={createPostAction} submitLabel="CREATE POST" />
      </div>
    </div>
  );
}
