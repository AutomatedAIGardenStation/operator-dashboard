import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: {
      parser: tsparser,
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      "react": reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "off",
      "no-restricted-syntax": [
        "error",
        {
          "selector": "Literal[value=/[\\/]arm([\\/]|$)/]",
          "message": "Use canonical /gantry/ endpoints instead of /arm/"
        },
        {
          "selector": "Literal[value=/[\\/]push-notification([\\/]|$)/]",
          "message": "Use canonical /notifications/register endpoint instead of /push-notification"
        },
        {
          "selector": "Literal[value=/[\\/]system[\\/]thresholds([\\/]|$)/]",
          "message": "Use canonical /system/config endpoint instead of /system/thresholds"
        }
      ]
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**", "*.config.ts", "*.config.js"],
  },
];
