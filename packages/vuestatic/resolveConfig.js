const path = require("path");
const buildPath = path.resolve(process.cwd(), "build");
const VuePrerenderPlugin = require(path.join(buildPath, "vue-prerender-plugin"));
const clientWebpackConfig = require(path.join(buildPath, "webpack.client.conf"));
const serverWebpackConfig = require(path.join(buildPath, "webpack.server.conf"));

const resolveConfig = (config) => {
  const isProd = process.env.NODE_ENV === "production";

  clientWebpackConfig.plugins.push(
    new VuePrerenderPlugin({
      paths: ["/"],
      crawl: true,
      htmlMinifier: isProd
        ? {
          collapseWhitespace: true,
          removeAttributeQuotes: true,
          removeComments: true,
          minifyJS: true,
        }
        : false,
    }),
  );

  return {
    ...config,
    clientWebpackConfig,
    serverWebpackConfig,
  };
};

module.exports = resolveConfig;
