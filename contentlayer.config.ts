import { defineDocumentType, makeSource } from "contentlayer/source-files";
import { parse } from "node-html-parser";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypePrismPlus from "rehype-prism-plus";
import remarkGfm from "remark-gfm";

export const Post = defineDocumentType(() => ({
  name: "Post",
  filePathPattern: `**/*.md`,
  fields: {
    title: { type: "string", required: true },
    date: { type: "date", required: true },
    modified: { type: "date" },
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (post) => post._raw.sourceFileName.slice(0, -3),
    },
    url: {
      type: "string",
      resolve: (post) => `/post/${post._raw.sourceFileName.slice(0, -3)}`,
    },
    category: {
      type: "string",
      resolve: (post) => post._raw.flattenedPath.split("/")[0],
    },
    preview: {
      type: "string",
      resolve: (post) => parse(post.body.html).textContent.slice(0, 200),
    },
  },
}));

export default makeSource({
  contentDirPath: "posts",
  documentTypes: [Post],
  markdown: {
    remarkPlugins: [remarkMath, remarkGfm],
    rehypePlugins: [rehypeKatex, rehypePrismPlus],
  },
});
