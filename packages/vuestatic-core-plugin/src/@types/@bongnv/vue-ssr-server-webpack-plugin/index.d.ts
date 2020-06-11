declare module "@bongnv/vue-ssr-server-webpack-plugin" {
  import { Plugin } from "webpack";

  interface PluginConfig {
    entryName: string;
  }

  class VueSSRServerPlugin extends Plugin {
    constructor(config: PluginConfig);
  }

  export = VueSSRServerPlugin;
}
