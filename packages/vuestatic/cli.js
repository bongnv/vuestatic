#!/usr/bin/env node

const cli = require('cac')();

cli
  .command('build', "Build to the project")
  .action((options) => {
    console.log("build with options", options);
  })

cli.help();

cli.parse();
