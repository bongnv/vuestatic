const path = require("path");
const fs = require("fs-extra");
const minify = require("html-minifier").minify;
const { relativePathsFromHtml } = require("./utils");

class StaticGenPlugin {
  constructor(options = {}) {
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

    const template = await fs.readFile(
      path.resolve(__dirname, "index.html"),
      "utf-8",
    );
    const clientManifest = JSON.parse(
      await fs.readFile(this.clientManifestPath),
    );
    const renderer = await createBundleRenderer(this.serverBundlePath, {
      template,
      clientManifest,
      runInNewContext: false,
    });

    const render = async (url) => {
      const context = {
        url,
      };
      const html = minify(
        await renderer.renderToString(context),
        this.htmlMinifierOptions,
      );
      return { html, pageProps: context.pageProps };
    };

    return {
      rendered: {},
      render,
    };
  }

  async renderPage(renderer, url) {
    const filePath = path.join(url, "index.html").slice(1);
    if (renderer.rendered[filePath]) return;

    console.log("Rendering", url);
    renderer.rendered[filePath] = true;
    const { html, pageProps } = await renderer.render(url);
    const htmlFile = path.resolve(this.outputPath, filePath);
    console.log("Writing", htmlFile);
    await fs.ensureFile(htmlFile);
    await fs.writeFile(htmlFile, html);
    if (pageProps) {
      const staticProps = JSON.stringify(pageProps);
      const propsFile = path.resolve(
        this.outputPath,
        url.slice(1),
        "pageProps.json",
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

  apply({ commands }) {
    const pluginName = "StaticGenPlugin";

    commands.for("build").tap(pluginName, ({ steps }) => {
      steps.for("execute").tapPromise(pluginName, async ({ config }) => {
        this.serverBundlePath = path.join(
          config.serverPath,
          "vue-ssr-server-bundle.json",
        );

        const renderer = await this.createRenderer(config);
        for (let url of this.paths) {
          await this.renderPage(renderer, url);
        }
      });
    });
  }
}

module.exports = StaticGenPlugin;
