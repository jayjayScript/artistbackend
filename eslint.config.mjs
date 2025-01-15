import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    files: ["**/*.js"], // Target all JS files
    languageOptions: {
      ecmaVersion: 2020, // Use ES2020 syntax
      sourceType: "module", // ES Modules
      globals: {
        ...globals.node, // Include Node.js globals like 'process'
        ...globals.browser, // Include browser globals if needed
      },
    },
    rules: {
      "no-unused-vars": "warn", // Warn on unused variables
      "no-console": "off", // Allow console logs
    },
  },
  pluginJs.configs.recommended, // Include recommended rules from @eslint/js
];
