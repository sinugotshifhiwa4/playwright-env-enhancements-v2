import { ErrorCategories } from "../../types/errorHandling/error-categories.enum";

// Use Set for simple deduplication - more memory efficient than Map for boolean-like operations
export const LOGGED_ERRORS_CACHE = new Set<string>();

// Cache for error message patterns - using Map is correct here since we need key-value pairs
export const MATCH_RESULT_CACHE = new Map<string, { category: ErrorCategories; context: string }>();

// Optimized cache limits
export const MAX_MATCH_CACHE_SIZE = 5000;
export const MAX_LOGGED_ERRORS_CACHE_SIZE = 1000; // Prevent memory leaks from logged errors

/**
 * Generate cache key for error message matching - HIGH FREQUENCY METHOD
 * Optimized for better uniqueness and collision avoidance
 */
export function generateMatchCacheKey(errorMessage: string): string {
  // Use a more balanced approach: first 40 chars + last 10 chars + length
  // This captures both start patterns and specific endings while being more unique
  const msg = errorMessage.toLowerCase().trim();
  const len = msg.length;

  if (len <= 50) {
    return `${msg}_${len}`;
  }

  return `${msg.substring(0, 40)}_${msg.substring(len - 10)}_${len}`;
}

/**
 * Generate cache key for error deduplication - optimized for logged errors
 */
export function generateLoggedErrorCacheKey(
  source: string,
  category: ErrorCategories,
  statusCode: number,
  message: string,
): string {
  // Use category enum value + source + first 30 chars of message for deduplication
  return `${category}_${source}_${statusCode}_${message.substring(0, 30)}`;
}

// Common error message properties - ordered by frequency for faster lookups
export const COMMON_MESSAGE_PROPS = [
  "message", // Most common
  "error", // Second most common
  "msg", // Short form, often used
  "detail",
  "description",
  "errorMessage",
] as const;

/**
 * Manage cache size for match results
 */
export function cleanupMatchCache(): void {
  if (MATCH_RESULT_CACHE.size >= MAX_MATCH_CACHE_SIZE) {
    const entriesToRemove = Math.floor(MAX_MATCH_CACHE_SIZE * 0.2);
    const keys = Array.from(MATCH_RESULT_CACHE.keys()).slice(0, entriesToRemove);

    for (const key of keys) {
      MATCH_RESULT_CACHE.delete(key);
    }
  }
}

/**
 * Manage cache size for logged errors
 */
export function cleanupLoggedErrorsCache(): void {
  if (LOGGED_ERRORS_CACHE.size >= MAX_LOGGED_ERRORS_CACHE_SIZE) {
    // Clear oldest entries - since Set maintains insertion order
    const keysToRemove = Array.from(LOGGED_ERRORS_CACHE).slice(
      0,
      Math.floor(MAX_LOGGED_ERRORS_CACHE_SIZE * 0.3),
    );

    for (const key of keysToRemove) {
      LOGGED_ERRORS_CACHE.delete(key);
    }
  }
}

/**
 * Reset all caches - useful for testing or memory management
 */
export function resetAllCaches(): void {
  MATCH_RESULT_CACHE.clear();
  LOGGED_ERRORS_CACHE.clear();
}
