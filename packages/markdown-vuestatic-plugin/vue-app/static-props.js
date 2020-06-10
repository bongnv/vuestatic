const resolve = require.context("@content", true, /\.md$/, "lazy");

const pick = (data, fields) => {
  const newData = {};
  fields.forEach((field) => {
    if (field in data) {
      newData[field] = data[field];
    }
  });
  return newData;
};

const getPostBySlug = async (slug, fields) => {
  const md = await resolve(`./${slug}.md`);

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
      .map((url) => getPostBySlug(url.slice(2, -3), fields)),
  );

const getAllPostsByTag = async (tag, fields) => {
  const allPosts = await getAllBlogPosts([...fields, "tags"]);
  return allPosts
    .filter((post) => post.tags && post.tags.includes(tag))
    .map((post) => pick(post, fields));
};

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

export default function(rawLocation) {
  if (rawLocation === "/") {
    // todo: change index file
    return getPostBySlug("about", ["title", "html"]);
  }

  const location = rawLocation.replace(/\/$/, "").replace(/^\//, "");
  if (location === "blog") {
    return getBlogIndexData();
  }

  if (location.startsWith("blog/")) {
    return getPostBySlug(location, [
      "title",
      "html",
      "date",
      "excerpt",
      "headings",
      "timeToRead",
      "tags",
    ]);
  }

  if (location.startsWith("tags/")) {
    return getTagPageData(location.slice(5));
  }

  return Promise.reject({
    code: 404,
  });
}
