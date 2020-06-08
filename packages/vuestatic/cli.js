#!/usr/bin/env node

const cac = require('cac');
const vueStatic = require("./vueStatic");

const cli = cac("vuestatic");
cli
  .command("", "Build the static site")
  .action((options) => {
    vueStatic(options).run();
  })

cli.help();

cli.parse();
