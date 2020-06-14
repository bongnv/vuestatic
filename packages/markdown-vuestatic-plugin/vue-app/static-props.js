const { find, pick } = require("lodash");
const { join } = require("path");
const applyTransformers = require("./applyTransformers");

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

const context = {
  resolve,
  slugToPath,
  pathToSlug,
  getPostByPath,
};

const normalizeURL = (next) => {
  return (url) => {
    return next(url.replace(/\/$/, ""));
  };
};

const staticProps = normalizeURL(
  applyTransformers((url) => {
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

    return undefined;
  }, context),
);

module.exports = staticProps;
