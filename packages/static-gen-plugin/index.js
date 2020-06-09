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
    this.serverBundlePath = path.resolve(
      process.cwd(),
      ".vuestatic",
      "server",
      "vue-ssr-server-bundle.json",
    );

    this.templatePath =
      options.templatePath || path.resolve(__dirname, "index.html");

    this.clientManifestPath = options.clientManifestPath || path.resolve(
      process.cwd(),
      "dist",
      "vue-ssr-client-manifest.json"
    );

    this.staticPropsFile = path.resolve(
      process.cwd(),
      ".vuestatic",
      "static-props",
      "index.js",
    );

    this.paths = options.paths || ["/"];
    this.crawl = options.crawl || false;
    this.outputPath = path.resolve(process.cwd(), "dist");
    this.htmlMinifierOptions = options.htmlMinifier || {};
  }

  async createRenderer() {
    const { createBundleRenderer } = require("vue-server-renderer");
    const genStaticProps = require(this.staticPropsFile).default;

    const template = await fs.readFile(this.templatePath, "utf-8");
    const clientManifest = JSON.parse(await fs.readFile(this.clientManifestPath));
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
      }
      const html = minify(await renderer.renderToString(context), this.htmlMinifierOptions);
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
      const propsFile = path.resolve(this.outputPath, url.slice(1), "pageData.json");
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

    hooks["config"].tap(pluginName, ({ config }) => {
      const path = require("path");
      const Config = require('webpack-chain');
      const { VueLoaderPlugin } = require("vue-loader");

      const baseDir = path.resolve(process.cwd());
      const isPrd = process.env.NODE_ENV === "production";

      const webpackConfig = new Config();
      webpackConfig
        .mode(isPrd ? "production" : "development")
        .target("node")
        .entry('static-props')
        .add('./src/static-props.js');

      webpackConfig.output
        .libraryTarget("commonjs2")
        .path(path.join(baseDir, ".vuestatic/static-props"))
        .filename("index.js");

      webpackConfig.module
        .rule("compile-vue")
        .test(/\.vue$/)
        .use("vue-loader")
        .loader("vue-loader");

      webpackConfig.module
        .rule("compile-css")
        .test(/\.css$/)
        .use("vue-style-loader")
        .loader("vue-style-loader")
        .end()
        .use("css-loader")
        .loader("css-loader")
        .end()
        .use("postcss-loader")
        .loader("postcss-loader")
        .end();

      webpackConfig.module
        .rule("compile-md")
        .test(/\.md$/)
        .use("markdown-loader")
        .loader("@bongnv/markdown-loader")
        .options({
          plugins: [require("@bongnv/markdown-images-plugin")],
        });

      webpackConfig.module
        .rule("compile-images")
        .test(/\.(jpg|jpeg|png|svg|webp|gif|ico)$/)
        .use("image-trace-loader")
        .loader("image-trace-loader")
        .end()
        .use("file-loader")
        .loader("file-loader")
        .options({
          name: isPrd ? "[contenthash].[ext]" : "[name].[ext]",
          outputPath: (url, resourcePath, context) => {
            return path.relative(path.join(context, ".vuestatic/static-props"), path.resolve(this.outputPath, "_assets/images", url));
          },
          publicPath: "/_assets/images",
        })
        .end()
        .use("image-webpack-loader")
        .loader("image-webpack-loader")
        .options({
          disable: !isPrd,
        });

      webpackConfig.plugin("vue-loader").use(new VueLoaderPlugin());
      config.staticWebpackConfig = webpackConfig;
    });

    hooks["build"] &&
      hooks["build"].tapPromise(pluginName, async ({ config }) => {
        const { webpackAsync } = require("../vuestatic/utils");

        const clientResult = await webpackAsync(config.staticWebpackConfig.toString());
        console.log(clientResult.toString());

        const renderer = await this.createRenderer();
        for (let url of this.paths) {
          await this.renderPage(renderer, url);
        }
      });
  }
}

module.exports = BundleStaticPlugin;
