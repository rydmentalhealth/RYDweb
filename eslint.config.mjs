import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    ignores: [
      // Generated files and directories
      "lib/generated/**",
      "prisma/generated/**",
      ".next/**",
      "node_modules/**",
      "out/**",
      "dist/**",
      // Specific generated files
      "**/*.wasm.js",
      "**/wasm.js",
      "**/runtime/**",
      // Build artifacts
      "build/**",
      "coverage/**",
    ],
  },
  {
    rules: {
      // Disable strict rules that cause issues with generated code
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-this-alias": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      // Development helpers
      "no-console": "off",
      // React specific
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];

export default eslintConfig;