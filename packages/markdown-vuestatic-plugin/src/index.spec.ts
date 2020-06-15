import { MarkdownVueStaticPlugin } from "./index";
import { Execution } from "@bongnv/vuestatic-core";

test("MarkdownVueStaticPlugin should create build config", async () => {
  const plugin = new MarkdownVueStaticPlugin();
  expect(plugin.apply).toBeTruthy();

  const e = new Execution({
    baseDir: "/",
  });
  plugin.apply(e);
  await e.commands.for("build").promise(e);
  await e.steps.for("config").promise(e);
  expect(e.config.serverWebpackConfig.toConfig().module?.rules).toHaveLength(2);
  expect(e.config.serverWebpackConfig.toConfig().resolve?.alias).toHaveProperty(
    "@content",
  );
  expect(e.config.serverWebpackConfig.toConfig()).toMatchSnapshot();
});

test("MarkdownVueStaticPlugin should create dev config", async () => {
  const plugin = new MarkdownVueStaticPlugin();
  expect(plugin.apply).toBeTruthy();

  const e = new Execution({
    baseDir: "/",
  });
  plugin.apply(e);
  await e.commands.for("dev").promise(e);
  await e.steps.for("config").promise(e);
  expect(e.config.serverWebpackConfig.toConfig().module?.rules).toHaveLength(2);
  expect(e.config.serverWebpackConfig.toConfig().resolve?.alias).toHaveProperty(
    "@content",
  );
  expect(e.config.serverWebpackConfig.toConfig()).toMatchSnapshot();
});
