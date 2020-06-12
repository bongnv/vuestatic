const url = require("url");
const cheerio = require("cheerio");

const relativePathsFromHtml = ({ html, currentPath }) => {
  const $ = cheerio.load(html);

  const linkHrefs = $("a[href]")
    .map(function (i, el) {
      return $(el).attr("href");
    })
    .get();

  const iframeSrcs = $("iframe[src]")
    .map(function (i, el) {
      return $(el).attr("src");
    })
    .get();

  return []
    .concat(linkHrefs)
    .concat(iframeSrcs)
    .map(function (href) {
      if (href.indexOf("//") === 0) {
        return null;
      }

      var parsed = url.parse(href);

      if (parsed.protocol || typeof parsed.path !== "string") {
        return null;
      }

      return parsed.path.indexOf("/") === 0
        ? parsed.path
        : url.resolve(currentPath, parsed.path);
    })
    .filter(function (href) {
      return href != null;
    });
};

exports.relativePathsFromHtml = relativePathsFromHtml;
