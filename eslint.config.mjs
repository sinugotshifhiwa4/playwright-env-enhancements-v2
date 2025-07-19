import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory of the current file
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config = tseslint.config(
  ...tseslint.configs.recommended,

  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      // Variable handling
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // Code quality
      "no-console": "error",
      "no-empty-pattern": "off",

      // Type safety - now enabled for better type checking
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-argument": "error",

      // Flexibility rules
      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "no-duplicate-imports": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },

  {
    files: ["**/*.spec.ts", "**/tests/**/*.ts"],
    rules: {
      // Relaxed rules for test files
      "no-console": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  {
    ignores: [
      "src/testData/**",
      "node_modules/**",
      "logs/**",
      "playwright-report/**",
      "dist/**",
      "*.ts",
    ],
  },

  prettierConfig,
);

export default config;
