import { pathExists } from "fs-extra";
import { resolveConfig } from "./resolveConfig";

jest.mock("fs-extra");

test("resolveConfig should return empty by default", async () => {
  const mockPathExists = <jest.Mock<Promise<boolean>>>(pathExists as unknown);
  expect(mockPathExists).toBeTruthy();
  mockPathExists.mockReturnValueOnce(Promise.resolve(false));
  const config = await resolveConfig({
    baseDir: "/",
  });
  expect(config.outputDir).toEqual(undefined);
  expect(config.plugins).toEqual([]);
  expect(mockPathExists).toHaveBeenCalledTimes(1);
  expect(config.baseDir).toEqual("/");
});
