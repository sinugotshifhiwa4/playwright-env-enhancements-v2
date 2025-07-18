import { ErrorCategories } from "./error-categories.enum";
/**
 * Interface for structured error logging
 */
export interface ErrorDetails {
  source: string;
  context?: string;
  message: string;
  category: ErrorCategories;
  statusCode?: number;
  url?: string;
  details?: Record<string, unknown>;
  timestamp: string;
  environment: string;
  version?: string;
}

/**
 * Configuration for request expectations
 */
export interface TestExpectation {
  expectedStatusCodes: number[];
  expectedCategories?: ErrorCategories[];
  isNegativeTest: boolean;
}

export interface ErrorPatternGroup {
  category: string;
  context: string;
  patterns: RegExp[];
}
