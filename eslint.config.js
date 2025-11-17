import js from "@eslint/js"
import { defineConfig } from "eslint/config"
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended"
import simpleImportSort from "eslint-plugin-simple-import-sort"
import unusedImports from "eslint-plugin-unused-imports"
import tseslint from "typescript-eslint"

export default defineConfig([
  {
    files: ["**/*.ts"],
    plugins: {
      js,
      "@typescript-eslint": tseslint.plugin
    },
    extends: ["js/recommended", ...tseslint.configs.recommended],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json"
      }
    }
  },
  {
    plugins: {
      "unused-imports": unusedImports,
      "simple-import-sort": simpleImportSort
    },
    rules: {
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_"
        }
      ],
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "no-restricted-imports": ["error", "node:test"],
      "@typescript-eslint/no-unused-vars": "off"
    }
  },
  eslintPluginPrettierRecommended
])
