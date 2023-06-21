import PostPreview from "@/components/PostPeview";
import { allPosts } from "contentlayer/generated";
import Link from "next/link";
import React from "react";

export default function Home() {
  return (
    <React.Fragment>
      <article>
        <h2 className="font-bold text-lg md:text-xl mt-2 mb-3">Recent Posts</h2>
        {allPosts
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
        <Link href="/category/all">더 보기</Link>
      </div>
    </React.Fragment>
  );
}
