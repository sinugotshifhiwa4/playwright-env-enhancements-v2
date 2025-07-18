import { ErrorCategories } from "../../types/errorHandling/error-categories.enum";

export class CategorizedError extends Error {
  constructor(
    public readonly category: ErrorCategories,
    public readonly details?: Record<string, unknown>,
    public readonly context: string = "Categorized Error",
    message?: string,
  ) {
    super(message || CategorizedError.getDefaultMessage(category));
    this.name = "CategorizedError";
    Object.setPrototypeOf(this, CategorizedError.prototype);
  }

  private static getDefaultMessage(category: ErrorCategories): string {
    const defaultMessages: Partial<Record<ErrorCategories, string>> = {
      [ErrorCategories.RUNTIME]: "Runtime error",
      [ErrorCategories.ENVIRONMENT_AND_DEPENDENCIES]: "Environment/dependency issue",
      [ErrorCategories.RESOURCES]: "Resource issue",
      [ErrorCategories.DATABASE]: "Database issue",
      [ErrorCategories.API_AND_NETWORK]: "API/network issue",
      [ErrorCategories.SECURITY_AND_ACCESS]: "Security/access issue",
      [ErrorCategories.FILE_SYSTEM]: "File system error",
      [ErrorCategories.UI_AND_BROWSER]: "UI/browser error",
      [ErrorCategories.UNKNOWN]: "Unknown error, error was not categorized",
    };

    return defaultMessages[category] || `Error (Category: ${category})`;
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      category: this.category,
      details: this.details,
      stack: this.stack,
    };
  }
}
