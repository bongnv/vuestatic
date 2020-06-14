const applyClientPlugins = (options) => {
  const plugins = options.plugins || [];
  const importsCodes = plugins
    .map((plugin, index) => `import plugin${index} from "${plugin}";`)
    .join("\n");

  const applyCode = plugins
    .map((_, index) => `plugin${index}(props);`)
    .join("\n");

  const code = `
  ${importsCodes}
  export default function applyClientPlugins(props) {
    ${applyCode}
  }`;

  return {
    cacheable: true,
    code,
  };
};

module.exports = applyClientPlugins;
