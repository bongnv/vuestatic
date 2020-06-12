import type { ExecutionConfig } from "./Execution";

export const mergeConfig = (
  targetConfig: ExecutionConfig,
  sourceConfig: ExecutionConfig,
): ExecutionConfig => {
  const plugins = targetConfig.plugins.concat(sourceConfig.plugins);
  targetConfig = Object.assign(targetConfig, sourceConfig, {
    plugins,
  });
  return targetConfig;
};
