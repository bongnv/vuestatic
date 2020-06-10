const Execution = require("./Execution");

const vueStatic = (config) => {
  return new Execution(config);
};
module.exports = vueStatic;
