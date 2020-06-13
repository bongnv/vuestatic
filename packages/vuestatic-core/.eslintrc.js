const baseConfig = require("../../.eslintrc");

module.exports = {
  ...baseConfig,
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["prettier", "@typescript-eslint"],
  ignorePatterns: ["/lib/", "__tests__"],
};
