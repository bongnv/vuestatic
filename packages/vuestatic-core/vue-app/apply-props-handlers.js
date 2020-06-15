const applyPropsHandlers = (options) => {
  const handlers = options.handlers || [];
  const handlersCode = handlers
    .map((handler) => `next = require("${handler}")(next);`)
    .join("\n");

  const code = `
  module.exports = function applyPropsHandlers(next) {
    ${handlersCode}
    return next;
  }`;

  return {
    cacheable: true,
    code,
  };
};

module.exports = applyPropsHandlers;
