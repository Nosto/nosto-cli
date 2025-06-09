import { defineConfig } from "eslint/config"
import js from "@eslint/js"
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended"

export default defineConfig([
  {
    languageOptions: {
      globals: {
        process: true,
        console: true,
        Headers: true,
        btoa: true
      }
    }
  },
  {
    files: ["**/*.js"],
    plugins: { js },
    extends: ["js/recommended"]
  },
  eslintPluginPrettierRecommended
])
