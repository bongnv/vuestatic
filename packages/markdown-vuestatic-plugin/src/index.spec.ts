import { MarkdownVueStaticPlugin } from "./index";
import { Execution } from "@bongnv/vuestatic-core";

test("MarkdownVueStaticPlugin should create build config to match snapshot", async () => {
  const plugin = new MarkdownVueStaticPlugin();
  expect(plugin.apply).toBeTruthy();

  const e = new Execution({});
  plugin.apply(e);
  await e.commands.for("build").promise(e);
  await e.steps.for("config").promise(e);
  expect(e.config).toMatchSnapshot();
});

test("MarkdownVueStaticPlugin should create dev config to match snapshot", async () => {
  const plugin = new MarkdownVueStaticPlugin();
  expect(plugin.apply).toBeTruthy();

  const e = new Execution({});
  plugin.apply(e);
  await e.commands.for("dev").promise(e);
  await e.steps.for("config").promise(e);
  expect(e.config).toMatchSnapshot();
});
