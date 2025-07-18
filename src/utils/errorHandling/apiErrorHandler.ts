import ApiTestExpectation from "../../layers/api/validators/internal/apiTestExpectation";
import ExpectedFailurePatterns from "./lookups/patterns/expectedFailurePatterns";
import ErrorAnalyzer from "./internals/errorAnalyzer";
import { ErrorCategories } from "../../utils/types/errorHandling/error-categories.enum";
import { HTTP_STATUS_MAP } from "./lookups/patternsCache";
import ErrorHandler from "./errorHandler";
import logger from "../logger/loggerManager";

export default class ApiErrorHandler {
  public static captureError(
    error: unknown,
    source: string,
    context?: string,
  ): {
    success: false;
    error: string;
    code: string;
    statusCode: number;
    details?: Record<string, unknown>;
  } {
    const isExpectedNegativeTestError = this.isExpectedNegativeTestError(error, source, context);

    if (!isExpectedNegativeTestError) {
      ErrorHandler.captureError(error, source, context);
    } else {
      this.logExpectedApiError(error, source);
    }

    const errorInfo = this.extractErrorInfo(error);
    const statusCode = this.mapCategoryToStatusCode(errorInfo.category, errorInfo.statusCode);

    return {
      success: false,
      error: errorInfo.message,
      code: errorInfo.category,
      statusCode,
      ...(errorInfo.details && Object.keys(errorInfo.details).length > 0
        ? { details: errorInfo.details }
        : {}),
    };
  }

  /**
   * Log expected API errors with consistent formatting
   */
  private static logExpectedApiError(error: unknown, source: string): void {
    const statusCode = ErrorAnalyzer.extractHttpStatus(error);
    const errorMessage = ErrorAnalyzer.getErrorMessage(error);

    logger.info(
      `Expected API error in negative test at [${source}]: Status Code ${statusCode || "Unknown"} — ${errorMessage.substring(0, 100)}... — Test validation passed.`,
    );
  }

  /**
   * Optimized error information extraction - uses ErrorAnalyzer for all logic
   */
  private static extractErrorInfo(error: unknown): {
    message: string;
    category: ErrorCategories;
    statusCode: number;
    details?: Record<string, unknown>;
  } {
    // Use ErrorAnalyzer for all error processing
    const errorDetails = ErrorAnalyzer.createErrorDetails(
      error,
      "ApiErrorHandler.extractErrorInfo",
    );

    return {
      message: errorDetails.message,
      category: errorDetails.category,
      statusCode: errorDetails.statusCode || 0,
      details: ErrorAnalyzer.extractAdditionalErrorDetails(error),
    };
  }

  /**
   * Optimized category to status code mapping with better performance
   */
  private static mapCategoryToStatusCode(
    category: ErrorCategories,
    defaultStatusCode: number,
  ): number {
    // If default status code is valid and category matches HTTP-related domains, prefer it
    const httpCategories = [ErrorCategories.API_AND_NETWORK, ErrorCategories.SECURITY_AND_ACCESS];

    if (defaultStatusCode >= 100 && defaultStatusCode < 600 && httpCategories.includes(category)) {
      return defaultStatusCode;
    }

    // Use a more efficient lookup - create a reverse mapping cache if needed frequently
    const statusForCategory = this.getStatusCodeForCategory(category);
    if (statusForCategory) {
      return statusForCategory;
    }

    return defaultStatusCode || 500;
  }

  /**
   * Efficient lookup for status codes by category
   */
  private static getStatusCodeForCategory(category: ErrorCategories): number | null {
    // Priority order for multiple matches - return the most appropriate one
    const categoryPriority = {
      [ErrorCategories.SECURITY_AND_ACCESS]: [401, 403, 400],
      [ErrorCategories.API_AND_NETWORK]: [500, 502, 503, 504, 404, 408, 409, 422, 429, 501],
      [ErrorCategories.FILE_SYSTEM]: [500],
      [ErrorCategories.DATABASE]: [500],
      [ErrorCategories.RUNTIME]: [500],
      [ErrorCategories.ENVIRONMENT_AND_DEPENDENCIES]: [500],
      [ErrorCategories.RESOURCES]: [500],
      [ErrorCategories.UI_AND_BROWSER]: [500],
      [ErrorCategories.UNKNOWN]: [500],
    };

    // Special handling for EXPECTED_FAILURE - can be any 4xx or 5xx status code
    if (category === ErrorCategories.EXPECTED_FAILURE) {
      // Find any status code in the 400-599 range that exists in our map
      for (const [statusCode, mapping] of HTTP_STATUS_MAP.entries()) {
        if (statusCode >= 400 && statusCode < 600 && mapping.category === category) {
          return statusCode;
        }
      }
      return null;
    }

    const priorityList = categoryPriority[category];
    if (!priorityList) return null;

    // Find the first status code from priority list that exists in our map
    for (const statusCode of priorityList) {
      const mapping = HTTP_STATUS_MAP.get(statusCode);
      if (mapping && mapping.category === category) {
        return statusCode;
      }
    }

    return null;
  }

  public static handleNegativeTestError(
    error: unknown,
    methodName: string,
    context?: string,
  ): void {
    if (this.isExpectedNegativeTestError(error, methodName, context)) {
      const statusCode = ErrorAnalyzer.extractHttpStatus(error);
      const errorMessage = ErrorAnalyzer.getErrorMessage(error);

      logger.info(
        `Expected failure handled correctly in negative test [${methodName}] — Status: ${statusCode} — ${errorMessage.substring(0, 50)}...`,
      );
    } else {
      this.captureError(
        error,
        methodName,
        `Unexpected error occurred in negative test for ${methodName}`,
      );
      throw error;
    }
  }

  /**
   * Optimized expected negative test error detection
   */
  private static isExpectedNegativeTestError(
    error: unknown,
    context: string,
    additionalContext?: string,
  ): boolean {
    if (!context) {
      return false;
    }

    // Check if it's a registered negative test
    const isNegativeTest = ApiTestExpectation.isNegativeTest(context);
    if (!isNegativeTest) {
      return false; // Early return for performance
    }

    // For HTTP errors, check status code expectations using ErrorAnalyzer
    const status = ErrorAnalyzer.extractHttpStatus(error);
    if (typeof status === "number" && ApiTestExpectation.isExpectedStatus(context, status)) {
      return true;
    }

    // Use ExpectedFailurePatterns for pattern matching
    const errorMessage = ErrorAnalyzer.getErrorMessage(error);
    const patternGroup = ExpectedFailurePatterns.getPatternsForContext(context);

    // Check if the error message matches any expected failure patterns
    const contextualMessage = additionalContext
      ? `${errorMessage} ${additionalContext}`
      : errorMessage;

    return patternGroup.patterns.some((pattern) => pattern.test(contextualMessage));
  }
}
