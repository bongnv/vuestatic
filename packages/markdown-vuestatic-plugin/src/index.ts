import path from "path";
import type { Hook } from "tapable";
import type Config from "webpack-chain";
import type { NormalizedConfig, Execution } from "@bongnv/vuestatic-core";

const PLUGIN_NAME = "MarkdownVueStaticPlugin";

export class MarkdownVueStaticPlugin {
  private _configImagesLoader(
    webpackConfig: Config,
    config: NormalizedConfig,
    isDevCommand: boolean,
  ): void {
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

  private _setupConfig(configHook: Hook, isDevCommand: boolean): void {
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
        "@content",
        path.join(config.baseDir, "content"),
      );

      this._configImagesLoader(webpackConfig, config, isDevCommand);
    });
  }

  apply({ commands, config }: Execution): void {
    const vueAppDir = path.resolve(__dirname, "../vue-app");

    config.propsHandlers.push(path.join(vueAppDir, "props-handler.js"));

    commands.for("build").tap(PLUGIN_NAME, ({ steps }: Execution) => {
      this._setupConfig(steps.for("config"), false);
    });

    commands.for("dev").tap(PLUGIN_NAME, ({ steps }: Execution) => {
      this._setupConfig(steps.for("config"), true);
    });
  }
}
