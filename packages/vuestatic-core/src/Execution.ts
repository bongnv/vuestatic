import { AsyncSeriesHook, HookMap, Tap } from "tapable";
import _ from "lodash";
import Config from "webpack-chain";

import { BundleClientPlugin } from "./BundleClientPlugin";
import { BundleServerPlugin } from "./BundleServerPlugin";
import { defaultExecutionConfig } from "./utils";

interface Plugin {
  apply(execution: Execution): void;
}

export interface ExecutionConfig {
  plugins?: Plugin[];
  isProd?: boolean;
  baseDir?: string;
  outputDir?: string;
  publicPath?: string;
  serverPath?: string;
  srcDir?: string;
  clientPlugins?: string[];
  clientWebpackConfig?: Config;
  serverWebpackConfig?: Config;
}

export interface NormalizedConfig {
  plugins: Plugin[];
  isProd: boolean;
  baseDir: string;
  outputDir: string;
  publicPath: string;
  serverPath: string;
  srcDir: string;
  clientPlugins: string[];
  clientWebpackConfig: Config;
  serverWebpackConfig: Config;
}

export class Execution {
  config: NormalizedConfig;
  commands: HookMap;
  steps: HookMap;

  constructor(rawConfig?: ExecutionConfig) {
    const params = ["execution"];
    this.commands = new HookMap(() => new AsyncSeriesHook(params));
    this.steps = new HookMap(() => new AsyncSeriesHook(params));
    this.config = defaultExecutionConfig(rawConfig);
  }

  private _applyPlugins(): void {
    const plugins = this.config.plugins || [];
    plugins.unshift(new BundleClientPlugin(), new BundleServerPlugin());

    _.compact(plugins).forEach((plugin) => plugin.apply(this));
  }

  private _initHooks(): void {
    this.steps.for("config").intercept({
      tap: (tapInfo: Tap) => {
        console.log(`${tapInfo.name} is configuring...`);
      },
    });

    this.steps.for("execute").intercept({
      tap: (tapInfo: Tap) => {
        console.log(`${tapInfo.name} is executing...`);
      },
    });
  }

  private async _executeSteps(): Promise<void> {
    await this.steps.for("config").promise(this);
    await this.steps.for("execute").promise(this);
  }

  async run(command: string): Promise<void> {
    this._initHooks();
    this._applyPlugins();
    await this.commands.for(command).promise(this);
    await this._executeSteps();
  }
}
