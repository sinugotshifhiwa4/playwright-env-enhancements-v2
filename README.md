## Git Hooks with Husky

This project uses **[Husky](https://typicode.github.io/husky)**, **Lint-Staged**, **ESLint**, and
**Prettier** to ensure consistent code quality and formatting before any changes are committed or
pushed.

To set up Husky, [follow this guide](https://typicode.github.io/husky/get-started.html).

- Husky hook scripts are located in the `.husky/` directory.
- `lint-staged` configuration is defined in `package.json`.

This setup ensures only **staged files** are linted and formatted, keeping the workflow fast and
efficient.

---

### Benefits

- Enforces clean and consistent code before reaching the repository
- Prevents accidental commits of `.only` in test files
- Works smoothly with both **CLI** and **VS Code Git UI**
- Enhances productivity and streamlines code reviews

---

### Included Hooks

#### Pre-commit

Runs automatically before a commit and:

- Executes `lint-staged` to:
  - Fix lint issues with **ESLint**
  - Format code with **Prettier**

- Scans for `.only` usage in `*.spec.ts` test files:
  - Blocks the commit if `test.only`, `describe.only`, or `it.only` is found

---
