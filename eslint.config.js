import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]),

  {
    files: ["**/*.{ts,tsx}"],

    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },

    settings: {
      react: {
        version: "detect",
      },
    },

    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      react.configs.flat.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      "prettier",
    ],

    rules: {
      // React 17+ JSX transform
      "react/react-in-jsx-scope": "off",

      // Prefer explicit function components
      "react/function-component-definition": [
        "error",
        {
          namedComponents: "function-declaration",
          unnamedComponents: "arrow-function",
        },
      ],

      // TS sanity
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
    },
  },
]);
