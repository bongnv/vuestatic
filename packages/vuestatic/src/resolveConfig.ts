import path from "path";
import { pathExists } from "fs-extra";

import type { ExecutionConfig } from "@bongnv/vuestatic-core";

const mergeConfig = (
  targetConfig: ExecutionConfig,
  nextConfig: Record<string, any>,
): ExecutionConfig => {
  let plugins = targetConfig.plugins || [];
  plugins = plugins.concat(nextConfig.plugins || []);
  targetConfig = Object.assign(targetConfig, nextConfig, {
    plugins,
  });
  return targetConfig;
};

const loadLocalConfig = async (): Promise<Record<string, any>> => {
  const localConfigFile = path.resolve(process.cwd(), "vuestatic.config.js");
  const configExisted = await pathExists(localConfigFile);
  if (configExisted) {
    return await import(localConfigFile);
  }

  console.warn("vuestatic.config.js is not found.");
  return {};
};

export const resolveConfig = async (
  cmdConfig: Record<string, any>,
): Promise<ExecutionConfig> => {
  let config = mergeConfig({}, cmdConfig);
  config = mergeConfig(config, await loadLocalConfig());
  return config;
};
