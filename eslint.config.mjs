import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config = tseslint.config(
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ["**/*.ts"],
  })),

  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
                                                "no-console": "error",
      "no-empty-pattern": "off",

      // Disable rules
      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "no-duplicate-imports": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-non-null-assertion": "off",

      // Existing overrides
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-return": "warn",
    },
  },

  {
    files: ["**/*.spec.ts", "**/tests/**/*.ts"],
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-call": "off",
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
      "ortoni-report/**",
      "dist/**",
      "*.d.ts",
    ],
  },

  prettierConfig,
);

export default config;
