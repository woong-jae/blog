import React from "react";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import PostPreview from "@/components/PostPreview";
import PostRepository from "./PostRepository";

export default function Home() {
  return (
    <React.Fragment>
      <section className="p-5 h-44 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500">
        <h1 className="text-2xl font-bold">woong-jae</h1>
        <p className="mt-2">Frontend developer who always strive to be diligent</p>
      </section>
      <Breadcrumb categories={PostRepository.categories} />
      <article>
        <h2 className="font-bold text-xl md:text-2xl mt-2 mb-3">Recent Posts</h2>
        {PostRepository.posts
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 3)
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
      <div className="flex justify-center">
        <Link className="font-bold text-neutral-500" href="/category/all">
          더 보기
        </Link>
      </div>
    </React.Fragment>
  );
}
