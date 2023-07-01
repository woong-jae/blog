import { Post, allPosts } from "contentlayer/generated";

class PostRepository {
  readonly posts;
  readonly categories;

  constructor(posts: Post[]) {
    this.posts = posts;
    this.categories = Array.from(allPosts.reduce((categorySet, post) => {
      categorySet.add(post.category);
      return categorySet;
    }, new Set<string>()));
  }

  getPost(slug: string) {
    return allPosts.find((post) => post.slug === slug);
  }
}

export default new PostRepository(allPosts);