const baseConfig = require("../../.eslintrc.js");
module.exports = {
  ...baseConfig,
  extends: [...baseConfig.extends, "plugin:@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
  plugins: [...baseConfig.plugins, "@typescript-eslint"],
  ignorePatterns: ["/lib/", "__tests__"],
};
