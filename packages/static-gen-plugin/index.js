const path = require("path");
const fs = require("fs-extra");
const minify = require("html-minifier").minify;
const url = require("url");

const relativePathsFromHtml = ({ html, currentPath }) => {
  const cheerio = require("cheerio");
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

class BundleStaticPlugin {
  constructor(options = {}) {
    this.templatePath =
      options.templatePath || path.resolve(__dirname, "index.html");

    this.clientManifestPath =
      options.clientManifestPath ||
      path.resolve(process.cwd(), "dist", "vue-ssr-client-manifest.json");

    this.paths = options.paths || ["/"];
    this.crawl = options.crawl || false;
    this.outputPath = path.resolve(process.cwd(), "dist");
    this.htmlMinifierOptions = options.htmlMinifier || {};
  }

  async createRenderer() {
    const { createBundleRenderer } = require("vue-server-renderer");
    const genStaticProps = require(this.staticPropsFile).default;

    const template = await fs.readFile(this.templatePath, "utf-8");
    const clientManifest = JSON.parse(
      await fs.readFile(this.clientManifestPath),
    );
    const renderer = await createBundleRenderer(this.serverBundlePath, {
      template,
      clientManifest,
      runInNewContext: false,
    });

    const render = async (url) => {
      const pageData = await genStaticProps(url);
      const context = {
        url,
        pageData,
      };
      const html = minify(
        await renderer.renderToString(context),
        this.htmlMinifierOptions,
      );
      return { html, pageData };
    };

    return {
      rendered: {},
      render,
    };
  }

  async renderPage(renderer, url) {
    const filePath = path.join(url, "index.html").slice(1);
    if (renderer.rendered[filePath]) return;

    console.log("Rendering", url.slice(1));
    renderer.rendered[filePath] = true;
    const { html, pageData } = await renderer.render(url);
    const htmlFile = path.resolve(this.outputPath, filePath);
    console.log("Writing", htmlFile);
    await fs.ensureFile(htmlFile);
    await fs.writeFile(htmlFile, html);
    if (pageData) {
      const staticProps = JSON.stringify(pageData);
      const propsFile = path.resolve(
        this.outputPath,
        url.slice(1),
        "pageData.json",
      );
      console.log("Writing", propsFile);
      await fs.ensureFile(propsFile);
      await fs.writeFile(propsFile, staticProps);
    }

    if (this.crawl) {
      const relativePaths = relativePathsFromHtml({
        html,
        currentPath: filePath,
      });

      for (let url of relativePaths) {
        await this.renderPage(renderer, url);
      }
    }
  }

  apply({ hooks }) {
    const pluginName = "BundleStaticPlugin";

    hooks["post-config"].tap(pluginName, ({ config }) => {
      this.serverBundlePath = path.join(
        config.serverPath,
        "vue-ssr-server-bundle.json",
      );
      this.staticPropsFile = path.join(config.serverPath, "static-props.js");
    });

    hooks["build"] &&
      hooks["build"].tapPromise(pluginName, async () => {
        const renderer = await this.createRenderer();
        for (let url of this.paths) {
          await this.renderPage(renderer, url);
        }
      });
  }
}

module.exports = BundleStaticPlugin;
