import React from "react";
import PostPreview from "@/components/PostPreview";
import Breadcrumb from "@/components/Breadcrumb";
import PostRepository from "@/app/PostRepository";

export const generateStaticParams = async () => {
  const categorySets = PostRepository.posts.reduce<Set<string>>((set, post) => {
    const { category } = post;
    set.add(category);
    return set;
  }, new Set<string>(["all"]));

  return Array.from(categorySets).map((category) => ({ category }));
};

export default function Page({ params }: { params: { category: string } }) {
  const { category } = params;
  const posts =
    category === "all"
      ? PostRepository.posts
      : PostRepository.posts.filter((post) => post.category === category);

  return (
    <React.Fragment>
      <Breadcrumb categories={PostRepository.categories} currentCategory={category} />
      <article>
        <h2 className="font-bold text-xl md:text-2xl mt-2 mb-3">
          {category}
          <span className="text-sm md:text-md mx-2">{`${posts.length}개`}</span>
        </h2>
        {posts
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
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
