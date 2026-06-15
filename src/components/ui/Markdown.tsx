import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";

// Neon-Laboratory themed renderer for resource `body_md`. No raw HTML (XSS-safe);
// GFM tables/strikethrough/autolinks enabled. Used by ResourceAccordion.
const components: Components = {
  h1: ({ children }) => (
    <h3 className="font-[family-name:var(--font-headline)] text-lg md:text-xl font-bold text-on-surface mt-6 mb-3">
      {children}
    </h3>
  ),
  h2: ({ children }) => (
    <h3 className="font-[family-name:var(--font-headline)] text-base md:text-lg font-bold text-primary mt-6 mb-2">
      {children}
    </h3>
  ),
  h3: ({ children }) => (
    <h4 className="font-[family-name:var(--font-headline)] text-sm md:text-base font-bold text-on-surface mt-5 mb-2">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="my-3 leading-relaxed text-on-surface/90">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-bold text-on-surface">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => (
    <ul className="list-disc pl-5 my-3 space-y-1.5 marker:text-primary">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-5 my-3 space-y-1.5 marker:text-on-surface-variant">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  a: ({ href, children }) => {
    const external = !!href && /^https?:\/\//.test(href);
    return (
      <a
        href={href}
        className="text-primary underline underline-offset-2 hover:text-primary-dim break-words"
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    );
  },
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-primary/50 pl-4 my-4 text-on-surface-variant italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="border-outline-variant/30 my-6" />,
  code: ({ children }) => (
    <code className="bg-surface-container-highest text-primary font-mono text-[0.85em] px-1.5 py-0.5">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="bg-surface-container-highest border border-outline-variant/20 p-4 overflow-x-auto my-4 text-sm leading-relaxed [&>code]:bg-transparent [&>code]:p-0 [&>code]:text-on-surface">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-4">
      <table className="w-full text-sm border-collapse border border-outline-variant/30">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-surface-container-highest">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="text-left px-3 py-2 border border-outline-variant/30 font-bold text-on-surface">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2 border border-outline-variant/30 text-on-surface/90 align-top">
      {children}
    </td>
  ),
  img: ({ src, alt }) => (
    <figure className="my-5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={typeof src === "string" ? src : ""}
        alt={alt ?? ""}
        loading="lazy"
        className="w-full border border-outline-variant/30 bg-surface-container-low"
      />
      {alt ? (
        <figcaption className="mt-2 text-xs text-on-surface-variant text-center">
          {alt}
        </figcaption>
      ) : null}
    </figure>
  ),
};

export function Markdown({ children }: { children: string }) {
  return (
    <div className="font-[family-name:var(--font-body)] text-sm md:text-base text-on-surface">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
