#!/usr/bin/env node

import cac from "cac";
import { Execution } from "@bongnv/vuestatic-core";
import MarkdownVueStaticPlugin from "@bongnv/markdown-vuestatic-plugin";
import DevServerPlugin from "@bongnv/dev-server-plugin";
import StaticGenPlugin from "@bongnv/static-gen-plugin";
import BundleAnalyzerPlugin from "@bongnv/bundle-analyzer-plugin";

const cli = cac("vuestatic");

cli.command("build", "Build the static site").action((options) => {
  new Execution({
    ...options,
    isProd: process.env.NODE_ENV === "production",
    plugins: [
      new MarkdownVueStaticPlugin(),
      new StaticGenPlugin({
        crawl: true,
      }),
    ],
  }).run("build");
});

cli.command("dev", "Start development server").action((options) => {
  new Execution({
    ...options,
    plugins: [new MarkdownVueStaticPlugin(), new DevServerPlugin()],
  }).run("dev");
});

cli.command("analyze", "Analyze the client bundle").action((options) => {
  new Execution({
    ...options,
    isProd: process.env.NODE_ENV === "production",
    plugins: [new BundleAnalyzerPlugin()],
  }).run("analyze");
});

cli.help();
cli.parse();
