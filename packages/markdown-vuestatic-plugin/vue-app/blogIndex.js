const { pick } = require("lodash");

const getAllBlogPosts = async ({ resolve, getPostByPath }, fields) =>
  Promise.all(
    resolve
      .keys()
      .reverse()
      .filter((url) => url.startsWith("./blog"))
      .map((url) => getPostByPath(url, fields)),
  );

const getAllTags = async (context) => {
  const posts = await getAllBlogPosts(context, ["tags"]);
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

const getAllPostsByTag = async (context, tag, fields) => {
  const allPosts = await getAllBlogPosts(context, [...fields, "tags"]);
  return allPosts
    .filter((post) => post.tags && post.tags.includes(tag))
    .map((post) => pick(post, fields));
};

const getBlogIndexData = async (context) => {
  const posts = await getAllBlogPosts(context, [
    "slug",
    "title",
    "excerpt",
    "date",
    "timeToRead",
  ]);
  const tags = await getAllTags(context);
  return {
    tags,
    posts,
  };
};

const getTagPageData = async (context, tag) => {
  const posts = await getAllPostsByTag(context, tag, [
    "slug",
    "title",
    "excerpt",
    "date",
    "timeToRead",
  ]);
  const tags = await getAllTags(context);
  return {
    tags,
    posts,
  };
};

module.exports = (next, context) => {
  return (url) => {
    if (url === "/blog") {
      return getBlogIndexData(context);
    }

    if (url.startsWith("/tags/")) {
      return getTagPageData(context, url.slice(6));
    }

    return next(url);
  };
};
