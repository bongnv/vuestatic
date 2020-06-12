import { ExecutionConfig } from "./Execution";

export const mergeConfig = (
  targetConfig: ExecutionConfig,
  sourceConfig: Record<string, any>,
): ExecutionConfig => {
  const plugins = targetConfig.plugins.concat(sourceConfig.plugins);
  targetConfig = Object.assign(targetConfig, sourceConfig, {
    plugins,
  });
  return targetConfig;
};
