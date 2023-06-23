import format from "date-fns/format";
import Link from "next/link";

export default function PostPreview({
  category,
  title,
  url,
  preview,
  createdAt,
}: {
  category: string;
  title: string;
  url: string;
  preview: string;
  createdAt: Date;
}) {
  return (
    <article className="px-3 py-4 border-t w-full border-neutral-300">
      <div>
        <Link
          className="text-sm lg:text-base text-neutral-500"
          href={`/category/${category}`}
        >
          /:{category}
        </Link>
      </div>
      <Link href={`${url}`}>
        <h2 className="text-xl lg:text-2xl font-semibold lg:my-1 line-clamp-1">
          {title}
        </h2>
        <p className="mb-1 text-sm lg:text-base text-neutral-500 line-clamp-2">
          {preview}
        </p>
      </Link>
      <div>
        <time className="text-sm lg:text-base text-neutral-500">
          {format(createdAt, "yyyy-MM-dd")}
        </time>
      </div>
    </article>
  );
}
