declare module "@bongnv/markdown-vuestatic-plugin" {
  class MarkdownVueStaticPlugin {}

  export = MarkdownVueStaticPlugin;
}

declare module "@bongnv/dev-server-plugin" {
  class DevServerPlugin {}
  export = DevServerPlugin;
}

declare module "@bongnv/static-gen-plugin" {
  class StaticGenPlugin {
    constructor(options: { crawl: Boolean})
  }
  export = StaticGenPlugin;
}
