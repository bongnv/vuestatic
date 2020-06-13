#!/usr/bin/env node

import cac from "cac";
import { Execution, ExecutionConfig } from "@bongnv/vuestatic-core";
import MarkdownVueStaticPlugin from "@bongnv/markdown-vuestatic-plugin";
import DevServerPlugin from "@bongnv/dev-server-plugin";
import StaticGenPlugin from "@bongnv/static-gen-plugin";
import BundleAnalyzerPlugin from "@bongnv/bundle-analyzer-plugin";

import { resolveConfig } from "./resolveConfig";

const cli = cac("vuestatic");

cli.command("build", "Build the static site").action((options) => {
  resolveConfig({
    ...options,
    isProd: process.env.NODE_ENV === "production",
    plugins: [
      new MarkdownVueStaticPlugin(),
      new StaticGenPlugin({
        crawl: true,
      }),
    ],
  }).then((config: ExecutionConfig) => new Execution(config).run("build"));
});

cli.command("dev", "Start development server").action((options) => {
  resolveConfig({
    ...options,
    plugins: [new MarkdownVueStaticPlugin(), new DevServerPlugin()],
  }).then((config) => new Execution(config).run("dev"));
});

cli.command("analyze", "Analyze the client bundle").action((options) => {
  resolveConfig({
    ...options,
    isProd: process.env.NODE_ENV === "production",
    plugins: [new BundleAnalyzerPlugin(), new DevServerPlugin()],
  }).then((config) => new Execution(config).run("analyze"));
});

cli.help();
cli.parse();
