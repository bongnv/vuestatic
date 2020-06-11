import type { AsyncSeriesHook } from "tapable";

declare global {
  type ExecutionConfig = Record<string, any>;

  interface Execution {
    config: ExecutionConfig;
    hooks: Record<string, AsyncSeriesHook>;
  }
}
