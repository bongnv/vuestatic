const PLUGIN_NAME = "MarkdownVueStaticPlugin";
const path = require("path");

class MarkdownVueStaticPlugin {
  configImagesLoader(webpackConfig, config, isDevCommand) {
    const { isProd, serverPath, outputDir } = config;

    const imagesDir = path.join(
      isDevCommand ? "static" : path.relative(serverPath, outputDir),
      "_assets/images",
    );
    webpackConfig.module
      .rule("compile-images")
      .test(/\.(jpg|jpeg|png|svg|webp|gif|ico)$/)
      .use("image-trace-loader")
      .loader("image-trace-loader")
      .end()
      .use("file-loader")
      .loader("file-loader")
      .options({
        name: isProd ? "[contenthash].[ext]" : "[name].[ext]",
        outputPath: imagesDir,
        publicPath: "/_assets/images",
      })
      .end()
      .use("image-webpack-loader")
      .loader("image-webpack-loader")
      .options({
        disable: !isProd,
      });
  }

  setupConfig(configHook, isDevCommand) {
    configHook.tap(PLUGIN_NAME, ({ config }) => {
      const webpackConfig = config.serverWebpackConfig;

      webpackConfig.module
        .rule("compile-md")
        .test(/\.md$/)
        .use("markdown-loader")
        .loader("@bongnv/markdown-loader")
        .options({
          plugins: [require("@bongnv/markdown-images-plugin")],
        });

      webpackConfig.resolve.alias.set(
        "@vuestatic/static-props",
        path.resolve(__dirname, "vue-app/static-props.js"),
      );

      webpackConfig.resolve.modules.add(path.resolve(__dirname, "vue-app"));

      webpackConfig.resolve.alias.set(
        "@content",
        path.join(config.baseDir, "content"),
      );

      this.configImagesLoader(webpackConfig, config, isDevCommand);
    });
  }

  apply({ commands }) {
    commands.for("build").tap(PLUGIN_NAME, ({ steps }) => {
      this.setupConfig(steps.for("config"), false);
    });

    commands.for("dev").tap(PLUGIN_NAME, ({ steps }) => {
      this.setupConfig(steps.for("config"), true);
    });
  }
}

module.exports = MarkdownVueStaticPlugin;
