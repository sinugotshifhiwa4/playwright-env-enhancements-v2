import { AxiosError } from "axios";
import DataSanitizer from "../../sanitization/dataSanitizer";
import { CategorizedError } from "./categorizedError";
import { ErrorCategories } from "../../types/errorHandling/error-categories.enum";
import { ErrorDetails } from "../../types/errorHandling/error-handler.types";
import {
  PRIORITIZED_PATTERN_GROUPS,
  SYSTEM_ERROR_MAP,
  RUNTIME_ERROR_MAP,
  HTTP_STATUS_MAP,
} from "../lookups/patternsCache";
import {
  MATCH_RESULT_CACHE,
  cleanupMatchCache,
  generateMatchCacheKey,
  COMMON_MESSAGE_PROPS,
} from "../lookups/errorPatternCacheManager";

export default class ErrorAnalyzer {
  /**
   * Create a standardized error object with source, context, message, and category.
   * @param error - The error to process
   * @param source - The source of the error (e.g., function name)
   * @param context - Optional additional context for the error
   * @returns An object containing structured error details
   */
  public static createErrorDetails(error: unknown, source: string, context?: string): ErrorDetails {
    const analysis = this.categorizeError(error);

    return {
      source,
      context: context || analysis.context,
      message: this.getErrorMessage(error),
      category: analysis.category,
      timestamp: new Date().toISOString(),
      environment: process.env.ENV || "dev",
      version: process.env.APP_VERSION,
      statusCode: this.extractHttpStatus(error),
    };
  }

  /**
   * Enhanced error message extraction with Axios-specific handling
   * @param error - The error object to extract message from
   * @returns The extracted and sanitized error message
   */
  public static getErrorMessage(error: unknown): string {
    // Handle Axios errors specifically
    if (this.isAxiosError(error)) {
      const axiosMessage = this.extractAxiosMessage(error);
      if (axiosMessage) {
        return this.sanitizeErrorMessage(axiosMessage);
      }
    }

    if (error instanceof Error) {
      return this.sanitizeErrorMessage(error.message);
    }

    if (typeof error === "string") {
      return this.sanitizeErrorMessage(error);
    }

    if (error && typeof error === "object") {
      const errorObj = error as Record<string, unknown>;

      // Fast property lookup using consolidated message properties
      for (const prop of COMMON_MESSAGE_PROPS) {
        const value = errorObj[prop];
        if (typeof value === "string" && value.trim()) {
          return this.sanitizeErrorMessage(value);
        }
      }

      // Enhanced context extraction for error-like objects
      return this.extractObjectErrorMessage(errorObj);
    }

    // Enhanced fallback with type information
    return this.generateFallbackMessage(error);
  }

  /**
   * Consolidated HTTP status extraction from any error type
   * @param error - The error object to extract status from
   * @returns HTTP status code or undefined
   */
  public static extractHttpStatus(error: unknown): number | undefined {
    if (!error || typeof error !== "object") {
      return undefined;
    }

    const errorObj = error as Record<string, unknown>;

    // Handle Axios errors specifically
    if (this.isAxiosError(error)) {
      return (error as AxiosError).response?.status;
    }

    // Check for response.status (axios-style and similar)
    if (
      "response" in errorObj &&
      errorObj.response &&
      typeof errorObj.response === "object" &&
      errorObj.response !== null
    ) {
      const response = errorObj.response as Record<string, unknown>;
      if ("status" in response && typeof response.status === "number") {
        return response.status;
      }
    }

    // Check for direct status properties
    const statusProps = ["status", "statusCode"];
    for (const prop of statusProps) {
      if (prop in errorObj && typeof errorObj[prop] === "number") {
        return errorObj[prop] as number;
      }
    }

    return undefined;
  }

  /**
   * Consolidated HTTP error categorization
   * @param status - HTTP status code
   * @returns Category and context information
   */
  public static categorizeHttpStatus(status: number): {
    category: ErrorCategories;
    context: string;
  } {
    // Use imported HTTP status mappings cache
    const mapping = HTTP_STATUS_MAP.get(status);
    if (mapping) return mapping;

    // Default HTTP categorization based on status code ranges
    if (status >= 400 && status < 500) {
      return {
        category: ErrorCategories.SECURITY_AND_ACCESS,
        context: `Client Error (${status})`,
      };
    } else if (status >= 500) {
      return {
        category: ErrorCategories.API_AND_NETWORK,
        context: `Server Error (${status})`,
      };
    } else {
      return {
        category: ErrorCategories.API_AND_NETWORK,
        context: `HTTP Error (${status})`,
      };
    }
  }

  /**
   * Shared utility for extracting request information from error objects
   * @param error - The error object to extract request info from
   * @returns Request information object
   */
  public static extractRequestInfo(error: unknown): Record<string, unknown> {
    if (!this.isAxiosError(error)) {
      return {};
    }

    const axiosError = error as AxiosError;
    const info: Record<string, unknown> = {};

    if (axiosError.config?.url) {
      info.endpoint = axiosError.config.url;
    }

    if (axiosError.config?.method) {
      info.method = axiosError.config.method.toUpperCase();
    }

    if (axiosError.response?.status) {
      info.statusCode = axiosError.response.status;
      info.statusText = axiosError.response.statusText;
    }

    return Object.keys(info).length > 0 ? { requestInfo: info } : {};
  }

  /**
   * Extract error message from Axios error response data
   * @param error - The Axios error to extract message from
   * @returns Extracted error message or null
   */
  private static extractAxiosMessage(error: AxiosError): string | null {
    const data = error.response?.data;

    if (!data || typeof data !== "object") {
      return null;
    }

    // Try common message properties
    for (const prop of COMMON_MESSAGE_PROPS) {
      const value = (data as Record<string, unknown>)[prop];
      if (typeof value === "string" && value.trim()) {
        return value.trim();
      }
    }

    return null;
  }

  /**
   * Type guard to check if error is an Axios error
   * @param error - The error to check
   * @returns True if error is an Axios error
   */
  private static isAxiosError(error: unknown): error is AxiosError {
    return !!(
      error &&
      typeof error === "object" &&
      "isAxiosError" in error &&
      (error as AxiosError).isAxiosError === true
    );
  }

  /**
   * Extract additional error details with optimized type checking
   * @param error - The error object to extract details from
   * @returns Additional error details object
   */
  public static extractAdditionalErrorDetails(error: unknown): Record<string, unknown> {
    if (typeof error === "object" && error !== null) {
      const baseDetails = DataSanitizer.sanitizeErrorObject(error as Record<string, unknown>);

      // Add request info for network errors
      const requestInfo = this.extractRequestInfo(error);
      if (Object.keys(requestInfo).length > 0) {
        return { ...baseDetails, ...requestInfo };
      }

      return baseDetails;
    }
    return {};
  }

  /**
   * Sanitizes an error message by removing unwanted characters and formatting.
   * @param message - The error message to sanitize.
   * @returns A sanitized version of the error message.
   */
  public static sanitizeErrorMessage(message: string): string {
    if (!message) return "";

    return (
      message
        // Remove ANSI escape sequences (more comprehensive pattern)
        .replace(/\u001b\[[0-9;]*[a-zA-Z]/g, "")
        // Remove other special characters
        .replace(/["'\\<>]/g, "")
        // Remove "Error: " prefix
        .replace(/^Error: /, "")
        // Trim whitespace and get first line only
        .trim()
        .split("\n")[0]
    );
  }

  // PRIVATE HELPER METHODS

  /**
   * Categorize error based on various error types and patterns
   * @param error - The error to categorize
   * @returns Category and context information
   */
  private static categorizeError(error: unknown): {
    category: ErrorCategories;
    context: string;
  } {
    // Handle CategorizedError (custom error type)
    if (error instanceof CategorizedError) {
      return {
        category: error.category,
        context: error.context || "Categorized Error",
      };
    }

    // Handle standard JavaScript errors
    if (error instanceof Error) {
      // Check runtime error mappings first - using imported cache
      const runtimeResult = RUNTIME_ERROR_MAP.get(error.name);
      if (runtimeResult) return runtimeResult;

      // Check system error codes - using imported cache
      if ("code" in error) {
        const systemResult = SYSTEM_ERROR_MAP.get((error as Error & { code: string }).code);
        if (systemResult) return systemResult;
      }
    }

    // HTTP status code analysis - using consolidated logic
    const httpResult = this.analyzeHttpError(error);
    if (httpResult.category !== ErrorCategories.UNKNOWN) {
      return httpResult;
    }

    // Pattern-based message analysis - using imported cache
    const messageResult = this.analyzeErrorMessage(error);
    if (messageResult.category !== ErrorCategories.UNKNOWN) {
      return messageResult;
    }

    // Fallback categorization
    return {
      category: ErrorCategories.UNKNOWN,
      context: error instanceof Error && error.name ? `${error.name} Error` : "General Error",
    };
  }

  /**
   * Analyze error message using optimized cached pattern matching
   * @param error - The error to analyze
   * @returns Category and context information
   */
  private static analyzeErrorMessage(error: unknown): {
    category: ErrorCategories;
    context: string;
  } {
    const errorMessage = this.getErrorMessage(error).toLowerCase();

    // Check cache first
    const cacheKey = generateMatchCacheKey(errorMessage);
    if (MATCH_RESULT_CACHE.has(cacheKey)) {
      return MATCH_RESULT_CACHE.get(cacheKey)!;
    }

    // Use imported prioritized pattern groups for efficient matching
    for (const patternGroup of PRIORITIZED_PATTERN_GROUPS) {
      for (const pattern of patternGroup.patterns) {
        if (pattern.test(errorMessage)) {
          const result = {
            category: patternGroup.category as ErrorCategories,
            context: patternGroup.context,
          };

          // Cache the result with optimized size management
          this.cacheMatchResult(cacheKey, result);
          return result;
        }
      }
    }

    return { category: ErrorCategories.UNKNOWN, context: "Unknown Error. Error not catogorized" };
  }

  /**
   * Analyze HTTP errors using consolidated categorization
   * @param error - The error to analyze
   * @returns Category and context information
   */
  private static analyzeHttpError(error: unknown): {
    category: ErrorCategories;
    context: string;
  } {
    const status = this.extractHttpStatus(error);

    if (typeof status === "number") {
      return this.categorizeHttpStatus(status);
    }

    return { category: ErrorCategories.UNKNOWN, context: "General Error" };
  }

  /**
   * Extract error message from object-type errors
   * @param errorObj - The error object to extract message from
   * @returns Extracted and sanitized error message
   */
  private static extractObjectErrorMessage(errorObj: Record<string, unknown>): string {
    // Handle error-like objects with context
    if ("name" in errorObj || "code" in errorObj) {
      const contextParts: string[] = [];

      if ("name" in errorObj && typeof errorObj.name === "string") {
        contextParts.push(`name: ${errorObj.name}`);
      }

      if (
        "code" in errorObj &&
        (typeof errorObj.code === "string" || typeof errorObj.code === "number")
      ) {
        contextParts.push(`code: ${errorObj.code}`);
      }

      if ("status" in errorObj && typeof errorObj.status === "number") {
        contextParts.push(`status: ${errorObj.status}`);
      }

      if ("statusCode" in errorObj && typeof errorObj.statusCode === "number") {
        contextParts.push(`statusCode: ${errorObj.statusCode}`);
      }

      if (contextParts.length > 0) {
        return this.sanitizeErrorMessage(`Error object (${contextParts.join(", ")})`);
      }
    }

    // Safe JSON stringify with error handling
    try {
      const stringified = JSON.stringify(errorObj);
      if (stringified && stringified !== "{}") {
        return this.sanitizeErrorMessage(`Object error: ${stringified}`);
      }
    } catch {
      return this.sanitizeErrorMessage("[Object with circular references]");
    }

    return this.sanitizeErrorMessage("[Empty object error]");
  }

  /**
   * Generate fallback message for unknown error types
   * @param error - The error to generate fallback message for
   * @returns Fallback error message
   */
  private static generateFallbackMessage(error: unknown): string {
    const errorType = error === null ? "null" : typeof error;
    const errorValue = this.getErrorValue(error);

    return `Unknown error occurred (type: ${errorType}, value: ${errorValue})`;
  }

  /**
   * Get string representation of error value
   * @param error - The error to get value from
   * @returns String representation of error value
   */
  private static getErrorValue(error: unknown): string {
    if (error === undefined) return "undefined";
    if (error === null) return "null";
    if (typeof error === "boolean") return error.toString();
    if (typeof error === "number") return error.toString();
    if (typeof error === "symbol") return error.toString();
    if (typeof error === "function") return "[Function]";
    return "[Unknown]";
  }

  /**
   * Optimized cache match result with better size management
   * @param cacheKey - The cache key
   * @param result - The result to cache
   */
  private static cacheMatchResult(
    cacheKey: string,
    result: { category: ErrorCategories; context: string },
  ): void {
    // Use the centralized cache cleanup function
    cleanupMatchCache();
    MATCH_RESULT_CACHE.set(cacheKey, result);
  }
}
