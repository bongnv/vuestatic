import { ExecutionConfig, NormalizedConfig } from "./Execution";

export const mergeConfig = (
  targetConfig: NormalizedConfig,
  sourceConfig: ExecutionConfig,
): NormalizedConfig => {
  const plugins = targetConfig.plugins.concat(sourceConfig.plugins || []);
  targetConfig = Object.assign(targetConfig, sourceConfig, {
    plugins,
  });
  return targetConfig;
};
