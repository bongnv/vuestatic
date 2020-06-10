const applyClientPlugins = (options = {}) => {
  const plugins = options.plugins || [];
  const applyPlugins = plugins
    .map((plugin) => `require("${plugin}")(props);`)
    .join();
  const code = `
  function applyPlugins(props) {
    ${applyPlugins}
  }

  module.exports = applyPlugins;`;
  return {
    cacheable: true,
    code,
  };
};

module.exports = applyClientPlugins;
