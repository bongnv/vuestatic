const { find, pick } = require("lodash");
const { join } = require("path");

const resolve = require.context("@content", true, /\.md$/, "lazy");

const slugToPath = (slug) => {
  const candidates = [
    join(`${slug}.md`),
    join(slug, "readme.md"),
    join(slug, "README.md"),
    join(slug, "README.MD"),
  ].map((url) => `./${url}`);

  return find(resolve.keys(), (url) => candidates.includes(url));
};

const pathToSlug = (mdPath) => {
  return mdPath.slice(2).replace(/(readme)?\.md/i, "");
};

const getPostByPath = async (mdPath, fields) => {
  const md = await resolve(mdPath);
  const slug = pathToSlug(mdPath);
  return pick(
    {
      ...md,
      slug,
    },
    fields,
  );
};

const getAllBlogPosts = async (fields) =>
  Promise.all(
    resolve
      .keys()
      .reverse()
      .filter((url) => url.startsWith("./blog"))
      .map((url) => getPostByPath(url, fields)),
  );

const getAllTags = async () => {
  const posts = await getAllBlogPosts(["tags"]);
  const tags = {};
  posts.forEach((post) => {
    if (post.tags) {
      post.tags.forEach((tag) => {
        if (tags[tag]) {
          tags[tag] = tags[tag] + 1;
        } else {
          tags[tag] = 1;
        }
      });
    }
  });

  return tags;
};

const getAllPostsByTag = async (tag, fields) => {
  const allPosts = await getAllBlogPosts([...fields, "tags"]);
  return allPosts
    .filter((post) => post.tags && post.tags.includes(tag))
    .map((post) => pick(post, fields));
};

const getBlogIndexData = async () => {
  const posts = await getAllBlogPosts([
    "slug",
    "title",
    "excerpt",
    "date",
    "timeToRead",
  ]);
  const tags = await getAllTags();
  return {
    tags,
    posts,
  };
};

const getTagPageData = async (tag) => {
  const posts = await getAllPostsByTag(tag, [
    "slug",
    "title",
    "excerpt",
    "date",
    "timeToRead",
  ]);
  const tags = await getAllTags();
  return {
    tags,
    posts,
  };
};

module.exports = (next) => (route, meta) => {
  const url = route.path.replace(/\/$/, "");
  const slug = url.replace(/^\//, "");
  const mdPath = slugToPath(slug);
  if (mdPath) {
    return getPostByPath(mdPath, [
      "title",
      "html",
      "date",
      "excerpt",
      "headings",
      "timeToRead",
      "tags",
    ]);
  }

  if (url === "/blog") {
    return getBlogIndexData();
  }

  if (url.startsWith("/tags/")) {
    return getTagPageData(url.slice(6));
  }

  return next(route, meta);
};
