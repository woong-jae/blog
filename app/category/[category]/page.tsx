import React from "react";
import { notFound } from "next/navigation";

import PostPreview from "@/components/PostPreview";
import Navigation from "@/components/Navigation";
import PostRepository from "@/app/PostRepository";

export const generateStaticParams = async () => {
  return PostRepository.categories.map((category) => ({ category }));
};

export default function Page({ params }: { params: { category: string } }) {
  const { category } = params;
  if (!PostRepository.categories.includes(category)) notFound();

  const posts =
    category === "all"
      ? PostRepository.posts
      : PostRepository.posts.filter((post) => post.category === category);

  return (
    <React.Fragment>
      <Navigation
        categories={PostRepository.categories}
        currentCategory={category}
      />
      <article>
        <h2 className="font-bold text-xl md:text-2xl mt-2 mb-3">
          {category}
          <span className="text-sm md:text-md mx-2">{`${posts.length}개`}</span>
        </h2>
        {posts
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          )
          .map((post) => {
            return (
              <PostPreview
                key={post._id}
                title={post.title}
                category={post.category}
                createdAt={new Date(post.date)}
                url={post.url}
                preview={post.preview}
              />
            );
          })}
      </article>
    </React.Fragment>
  );
}
