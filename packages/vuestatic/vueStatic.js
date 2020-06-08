const App = require("./App");
const resolveConfig = require("./resolveConfig");

const vueStatic = (config) => {
  const resolvedConfig = resolveConfig(config);
  return new App(resolvedConfig);
};

module.exports = vueStatic;
