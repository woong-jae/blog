import { format } from "date-fns";
import "./katex.css";
import "./prism.css";
import React from "react";
import Link from "next/link";
import PostRepository from "@/app/PostRepository";
import userConfig from "@/user.config.json";

export const generateStaticParams = async () =>
  PostRepository.posts.map((post) => ({ slug: post.slug }));

export const generateMetadata = ({ params }: { params: { slug: string } }) => {
  const post = PostRepository.getPost(params.slug);
  if (!post) throw new Error(`Post not found for slug: ${params.slug}`);
  return {
    title: post.title,
    description: post.preview,
    openGraph: {
      type: "article",
      url: `${userConfig.url}/post/${post.slug}`,
      article: {
        publishedTime: new Date(post.date).toISOString(),
      },
    },
  };
};

export default function Page({ params }: { params: { slug: string } }) {
  const post = PostRepository.getPost(params.slug);
  if (!post) throw new Error(`Post not found for slug: ${params.slug}`);

  return (
    <React.Fragment>
      <article className="mx-auto max-w-none prose prose-sm md:prose-base dark:prose-invert prose-h1:mb-0 prose-h1:text-2xl md:prose-h1:text-3xl prose-li:my-0 prose-img:mx-auto">
        <header className="mb-8">
          <time className="mb-2">{format(new Date(post.date), "yyyy-MM-dd")}</time>
          <h1 className=" prose-h1:mb-0" id={post.title}>
            {post.title}
          </h1>
          <Link
            className="text-sm lg:text-base text-neutral-500 no-underline"
            href={`/category/${post.category}`}
          >
            /:{post.category}
          </Link>
        </header>
        <div dangerouslySetInnerHTML={{ __html: post.body.html }} />
      </article>
    </React.Fragment>
  );
}
