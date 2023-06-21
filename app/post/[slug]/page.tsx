import { format } from "date-fns";
import { allPosts } from "contentlayer/generated";
import "./katex.css";
import "./prism.css";

export const generateStaticParams = async () =>
  allPosts.map((post) => ({ slug: post.slug }));

export const generateMetadata = ({ params }: { params: { slug: string } }) => {
  const post = allPosts.find((post) => post.slug === params.slug);
  if (!post) throw new Error(`Post not found for slug: ${params.slug}`);
  return { title: post.title };
};

export default function Page({ params }: { params: { slug: string } }) {
  const post = allPosts.find((post) => post.slug === params.slug);
  if (!post) throw new Error(`Post not found for slug: ${params.slug}`);

  return (
    <article className="mx-auto max-w-none prose prose-sm md:prose-base dark:prose-invert prose-h1:text-2xl md:prose-h1:text-3xl prose-li:my-0 prose-img:mx-auto">
      <header>
        <time className="mb-2">
          {format(new Date(post.date), "yyyy-MM-dd")}
        </time>
        <h1 id={post.title}>{post.title}</h1>
      </header>
      <div dangerouslySetInnerHTML={{ __html: post.body.html }} />
    </article>
  );
}
