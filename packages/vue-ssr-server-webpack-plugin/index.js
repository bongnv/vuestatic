const pluginName = "VueSSRServerWebpackPlugin";

const isJS = (file) => /\.js(\?[^.]+)?$/.test(file);

class VueSSRServerWebpackPlugin {
  constructor(options = {}) {
    this.filename = options.filename || "vue-ssr-server-bundle.json";
    this.entryName = options.entryName || "";
  }

  async apply(compiler) {
    compiler.hooks.emit.tapPromise(pluginName, async (compilation) => {
      const stats = compilation.getStats().toJson();
      const entryName = this.entryName || Object.keys(stats.entrypoints)[0];
      const entryInfo = stats.entrypoints[entryName];
      if (!entryInfo) {
        throw new Error(`Entry ${entryName} not found!`);
      }

      const entryAssets = entryInfo.assets.filter(isJS);
      if (entryAssets.length > 1) {
        throw new Error(
          "Server-side bundle should have one single entry file. " +
            "Avoid using CommonsChunkPlugin in the server config.",
        );
      }

      const entry = entryAssets[0];
      if (!entry || typeof entry !== "string") {
        throw new Error(
          'Entry "' +
            entryName +
            '" not found. Did you specify the correct entry option?',
        );
      }

      const bundle = {
        entry: entry,
        files: {},
        maps: {},
      };

      stats.assets.forEach(function(asset) {
        if (isJS(asset.name)) {
          bundle.files[asset.name] = compilation.assets[asset.name].source();
        } else if (asset.name.match(/\.js\.map$/)) {
          bundle.maps[asset.name.replace(/\.map$/, "")] = JSON.parse(
            compilation.assets[asset.name].source(),
          );
        }
      });

      if (!bundle.files[bundle.entry]) {
        throw new Error(
          `${
            bundle.entry
          } is missing. Make sure vue-server-renderer/server-plugin is excluded`,
        );
      }

      var json = JSON.stringify(bundle, null, 2);

      compilation.emitAsset(this.filename, {
        source: () => json,
        size: () => json.length,
      });
    });
  }
}

module.exports = VueSSRServerWebpackPlugin;
