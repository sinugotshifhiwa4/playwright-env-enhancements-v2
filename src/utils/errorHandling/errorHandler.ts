import DataSanitizer from "../sanitization/dataSanitizer";
import { ErrorCategories } from "../types/errorHandling/error-categories.enum";
import { ErrorDetails } from "../types/errorHandling/error-handler.types";
import ErrorAnalyzer from "./internals/errorAnalyzer";
import logger from "../logger/loggerManager";
import {
  LOGGED_ERRORS_CACHE,
  generateLoggedErrorCacheKey,
  cleanupLoggedErrorsCache,
} from "./lookups/errorPatternCacheManager";

export default class ErrorHandler {
  /**
   * Centralized error capture with optimized deduplication and logging.
   * @param error - The error to log
   * @param source - The source of the error (e.g. function name)
   * @param context - Optional additional context for the error
   * @returns void
   */
  public static captureError(error: unknown, source: string, context?: string): void {
    try {
      const details = ErrorAnalyzer.createErrorDetails(error, source, context);
      const cacheKey = generateLoggedErrorCacheKey(
        details.source,
        details.category,
        details.statusCode ?? 0,
        details.message,
      );

      // Skip if already logged this execution
      if (LOGGED_ERRORS_CACHE.has(cacheKey)) {
        return;
      }

      // Clean up cache if needed before adding new entry
      cleanupLoggedErrorsCache();

      LOGGED_ERRORS_CACHE.add(cacheKey);
      this.logStructuredError(details);
      this.logAdditionalDetails(error, source);
    } catch (loggingError) {
      this.handleLoggingFailure(loggingError, source);
    }
  }

  public static logAndThrow(message: string, source: string): never {
    this.captureError(new Error(message), source);
    throw new Error(message);
  }

  /**
   * Log structured error details with proper typing
   */
  private static logStructuredError(details: ErrorDetails): void {
    const sanitizedDetails = DataSanitizer.sanitizeErrorObject(
      details as unknown as Record<string, unknown>,
    );

    // Log the sanitized details
    const logMessage = JSON.stringify(sanitizedDetails, null, 2);
    logger.error(logMessage);
  }

  /**
   * Log additional error details
   */
  private static logAdditionalDetails(error: unknown, source: string): void {
    const extraDetails = ErrorAnalyzer.extractAdditionalErrorDetails(error);

    if (Object.keys(extraDetails).length > 0) {
      logger.debug(
        JSON.stringify(
          {
            source,
            type: "Additional Details",
            details: extraDetails,
          },
          null,
          2,
        ),
      );
    }
  }

  /**
   * Handle failures in the error logging process
   */
  private static handleLoggingFailure(loggingError: unknown, source: string): void {
    logger.error(
      JSON.stringify(
        {
          source,
          context: "Error Handler Failure",
          message: ErrorAnalyzer.getErrorMessage(loggingError),
          category: ErrorCategories.UNKNOWN,
          timestamp: new Date().toISOString(),
        },
        null,
        2,
      ),
    );
  }

  /**
   * Reset the error cache - useful for testing or memory management
   */
  public static resetCache(): void {
    LOGGED_ERRORS_CACHE.clear();
  }
}
