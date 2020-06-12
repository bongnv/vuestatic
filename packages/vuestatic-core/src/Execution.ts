import { AsyncSeriesHook, HookMap } from "tapable";
import path from "path";
import fs from "fs-extra";
import _ from "lodash";
import Config from "webpack-chain";

import { BundleClientPlugin } from "./BundleClientPlugin";
import { BundleServerPlugin } from "./BundleServerPlugin";
import { mergeConfig } from "./mergeConfig";
import { defaultExecutionConfig } from "./utils";

interface Plugin {
  apply(execution: Execution): void;
}

export interface ExecutionConfig {
  plugins: Plugin[];
  isProd: boolean;
  baseDir: string;
  outputDir: string;
  publicPath: string;
  serverPath: string;
  srcDir: string;
  coreVueApp: string;
  clientPlugins: string[];
  clientWebpackConfig: Config;
  serverWebpackConfig: Config;
}

export class Execution {
  config: ExecutionConfig;
  commands: HookMap;
  steps: HookMap;

  constructor(rawConfig: Record<string, any>) {
    const params = ["execution"];
    this.commands = new HookMap(() => new AsyncSeriesHook(params));
    this.steps = new HookMap(() => new AsyncSeriesHook(params));
    this.config = mergeConfig(defaultExecutionConfig(), rawConfig);
  }

  async _loadLocalConfig(): Promise<void> {
    const localConfigFile = path.resolve(process.cwd(), "vuestatic.config.js");
    const configExisted = await fs.pathExists(localConfigFile);
    if (configExisted) {
      const localConfig = await import(
        path.resolve(process.cwd(), "vuestatic.config.js")
      );
      this.config = mergeConfig(this.config, localConfig);
    } else {
      console.warn("vuestatic.config.js is not found.");
    }
  }

  _applyPlugins(): void {
    const plugins = this.config.plugins || [];
    plugins.unshift(new BundleClientPlugin(), new BundleServerPlugin());

    _.compact(plugins).forEach((plugin) => plugin.apply(this));
  }

  async _executeSteps(): Promise<void> {
    console.log("Preparing configuration...");
    await this.steps.for("config").promise(this);
    console.log("Executing...");
    await this.steps.for("execute").promise(this);
  }

  async run(command: string): Promise<void> {
    await this._loadLocalConfig();
    this._applyPlugins();
    await this.commands.for(command).promise(this);
    await this._executeSteps();
  }
}
