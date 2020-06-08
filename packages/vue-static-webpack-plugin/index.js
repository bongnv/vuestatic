const { createBundleRenderer } = require("vue-server-renderer");
const path = require("path");
const fs = require("fs").promises;
const cheerio = require("cheerio");
const url = require("url");
const minify = require("html-minifier").minify;

const pluginName = "VueStaticWebpackPlugin";

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

class VueStaticWebpackPlugin {
  constructor(options = {}) {
    this.serverPath =
      options.serverPath || path.resolve(process.cwd(), ".server");
    this.serverBundlePath = path.join(
      this.serverPath,
      "vue-ssr-server-bundle.json",
    );
    this.templatePath =
      options.templatePath || path.resolve(__dirname, "index.html");
    this.paths = options.paths || [];
    this.crawl = options.crawl || false;
    this.htmlMinifierOptions = options.htmlMinifier || {};
  }

  async createRenderer(clientManifest) {
    const template = await fs.readFile(this.templatePath, "utf-8");
    const renderer = await createBundleRenderer(this.serverBundlePath, {
      template,
      clientManifest,
      runInNewContext: false,
    });

    const renderToString = async (context) => {
      const html = await renderer.renderToString(context);
      return minify(html, this.htmlMinifierOptions);
    };

    return {
      renderToString,
    };
  }

  async renderPage(compilation, renderer, url) {
    try {
      const filePath = path.join(url, "index.html").slice(1);
      if (compilation.getAsset(filePath)) {
        return;
      }

      const context = {
        url: url,
      };

      const html = await renderer.renderToString(context);
      const source = {
        source: () => html,
        size: () => html.length,
      };
      compilation.emitAsset(filePath, source);

      if (context.pageData) {
        const pageData = JSON.stringify(context.pageData);
        compilation.emitAsset(path.join(url, "pageData.json").slice(1), {
          source: () => pageData,
          size: () => pageData.length,
        });
      }

      if (this.crawl) {
        const relativePaths = relativePathsFromHtml({
          html,
          currentPath: filePath,
        });

        for (let url of relativePaths) {
          await this.renderPage(compilation, renderer, url);
        }
      }
    } catch (err) {
      console.error("err while rendering", url, err);
    }
  }

  async apply(compiler) {
    compiler.hooks.emit.tapPromise(pluginName, async (compilation) => {
      const clientManifestFile = "vue-ssr-client-manifest.json";
      const clientManifestAsset = compilation.getAsset(clientManifestFile);

      if (!clientManifestAsset) {
        throw new Error(
          `${clientManifestFile} is missing. Make sure vue-server-renderer/client-plugin is added`,
        );
      }

      const clientManifest = JSON.parse(clientManifestAsset.source.source());
      const renderer = await this.createRenderer(clientManifest);

      for (let url of this.paths) {
        await this.renderPage(compilation, renderer, url);
      }
    });
  }
}

module.exports = VueStaticWebpackPlugin;
