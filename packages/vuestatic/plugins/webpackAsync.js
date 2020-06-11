const webpack = require("webpack");

const webpackAsync = (config) => {
  return new Promise((resolve, reject) => {
    webpack(config, (err, stats) => {
      if (err) {
        console.error("error with webpack", err);
        return reject(err);
      }

      if (stats.hasErrors()) {
        console.error(stats.toString());
        return reject(new Error("Failed to compile with errors."));
      }

      resolve(stats);
    });
  });
};

module.exports = webpackAsync;
