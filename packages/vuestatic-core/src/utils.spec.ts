import { defaultExecutionConfig } from "./utils";

test("defaultExecutionConfig should match snapshot", () => {
  const config = defaultExecutionConfig({
    baseDir: "/",
  });

  expect(config).toMatchSnapshot();
});
