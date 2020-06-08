#!/usr/bin/env node

const cac = require('cac');
const vueStatic = require("./vueStatic");

const cli = cac("vuestatic");
cli
  .command("build", "Build the static site")
  .action((options) => {
    vueStatic(options).run();
  })

cli
  .command("dev", "Start development mode")
  .action((options) => {
    const devOptions = {
      ...options,
      isDev: true,
    };
    vueStatic(devOptions).run();
  })

cli.help();

cli.parse();
