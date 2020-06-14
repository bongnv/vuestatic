const applyTransformers = (options) => {
  const transformers = options.transformers || [];
  const transformersCode = transformers
    .map((transformer) => `next = require("${transformer}")(next, context);`)
    .join("\n");

  const code = `
  module.exports = function applyTransformers(next, context) {
    ${transformersCode}
    return next;
  }`;

  return {
    cacheable: true,
    code,
  };
};

module.exports = applyTransformers;
