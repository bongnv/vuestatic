class MarkdownVueStaticPlugin {
  apply({ hooks }) {
    const path = require("path");

    const pluginName = "MarkdownVueStaticPlugin";

    hooks.config.tap(pluginName, ({ config }) => {
      const webpackConfig = config.serverWebpackConfig;
      const { isProd, isWatch, baseDir, serverPath, outputDir } = config;

      webpackConfig.module
        .rule("compile-md")
        .test(/\.md$/)
        .use("markdown-loader")
        .loader("@bongnv/markdown-loader")
        .options({
          plugins: [require("@bongnv/markdown-images-plugin")],
        });

      const imagesDir = path.join(
        isWatch ? "static" : path.relative(serverPath, outputDir),
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

      webpackConfig.resolve.modules.add(path.resolve(__dirname, "vue-app"));

      webpackConfig.resolve.alias.set(
        "@content",
        path.join(baseDir, "content"),
      );
    });
  }
}

module.exports = MarkdownVueStaticPlugin;
