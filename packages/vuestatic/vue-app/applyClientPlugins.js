const applyClientPlugins = (options = {}) => {
  const plugins = options.plugins || [];
  const applyPlugins = plugins
    .map((plugin, index) => `require("${plugin}")["default"](props);`)
    .join('\n');

  const code = `
  export default function applyPlugins(props) {
    ${applyPlugins}
  }`;

  return {
    cacheable: true,
    code,
  };
};

module.exports = applyClientPlugins;
