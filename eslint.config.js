import { defineConfig } from "eslint/config"
import js from "@eslint/js"
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended"
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
  eslintPluginPrettierRecommended
])
