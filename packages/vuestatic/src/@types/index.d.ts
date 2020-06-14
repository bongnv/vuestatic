declare module "@bongnv/dev-server-plugin" {
  class DevServerPlugin {}
  export = DevServerPlugin;
}

declare module "@bongnv/static-gen-plugin" {
  class StaticGenPlugin {
    constructor(options: { crawl: boolean });
  }
  export = StaticGenPlugin;
}
