#!/usr/bin/env node

const cac = require("cac");
const Execution = require("./Execution");

const cli = cac("vuestatic");
cli.command("build", "Build the static site").action((options) => {
  new Execution(options).run();
});

cli.command("dev", "Start development mode").action((options) => {
  const devOptions = {
    ...options,
    isWatch: true,
  };
  new Execution(devOptions).run();
});

cli.command("analyze", "Analyze the client bundle").action((options) => {
  const analyzeOptions = {
    ...options,
    isAnalyze: true,
  };
  new Execution(analyzeOptions).run();
});

cli.help();

cli.parse();
