import { SanitizationParams } from "../types/sanitization/sanitization.types";
import { MaskValue } from "./internals/sanitization-mask.constants";
import { defaultSensitiveKeys, defaultSensitiveKeysRegex } from "./internals/sensitive-keys.config";

export default class DataSanitizer {
  /**
   * Default configuration parameters used by the data sanitizer.
   *
   * These values define how the sanitizer behaves when no custom configuration is provided:
   * - `sensitiveKeys`: Keys considered sensitive (e.g., "password", "token") and should be masked.
   * - `maskValue`: The value used to replace sensitive information (e.g., "***").
   * - `enablePatternDetection`: Enables masking of values based on regex pattern matching (e.g., emails, tokens).
   * - `maxDepth`: Controls how deep the recursive sanitizer will traverse nested objects.
   */
  private static defaultParams: SanitizationParams = {
    sensitiveKeys: defaultSensitiveKeys,
    maskValue: MaskValue,
    enablePatternDetection: true,
    maxDepth: 10,
  };

  /**
   * Sanitizes the given data object by recursively iterating over all its
   * properties and applying the following transformations:
   * - masks sensitive data (passwords, etc.) with a configurable mask value
   * - replaces pattern matches (e.g. email addresses) with a configurable mask value
   * - can be configured to only apply to a maximum depth of recursion
   *
   * @param data the object to sanitize
   * @param config an optional configuration object that can be used to override
   * the default behavior of the sanitizer. Supported properties are:
   * - sensitiveKeys: an array of key names that should be masked
   * - maskValue: the value to use when masking sensitive data
   * - enablePatternDetection: a boolean indicating whether to detect and mask
   *   pattern matches in strings
   * - maxDepth: the maximum depth of recursion to apply the sanitizer to
   *
   * @returns the sanitized version of the input object
   */
  public static sanitize<T>(data: T, config?: Partial<SanitizationParams>): T {
    const finalConfig = { ...this.defaultParams, ...config };
    return this.processValue(data, finalConfig);
  }

  public static getDefaultParams(): SanitizationParams {
    return { ...this.defaultParams };
  }

  private static processValue<T>(
    data: T,
    config: SanitizationParams,
    depth: number = 0,
    seen: WeakSet<object> = new WeakSet(),
    path: string = "",
  ): T {
    // Depth check
    if (depth > (config.maxDepth || 10)) {
      return data;
    }

    // Handle primitives
    if (data === null || data === undefined || typeof data !== "object") {
      return this.processPrimitive(data, config);
    }

    // Handle circular references
    if (seen.has(data as object)) {
      return "[Circular]" as unknown as T;
    }
    seen.add(data as object);

    // Handle arrays
    if (Array.isArray(data)) {
      const sanitizedArray: unknown[] = [];
      for (let i = 0; i < data.length; i++) {
        const itemPath = `${path}[${i}]`;
        const sanitizedItem = this.processValue(
          data[i],
          config,
          depth + 1,
          seen,
          itemPath,
        ) as unknown;
        sanitizedArray.push(sanitizedItem);
      }
      return sanitizedArray as unknown as T;
    }

    // Handle objects
    return this.processObject(data, config, depth, seen, path);
  }

  /**
   * Sanitizes a primitive value according to the given configuration.
   * Only applies pattern detection for sensitive data masking.
   */
  private static processPrimitive<T>(data: T, config: SanitizationParams): T {
    if (typeof data !== "string") {
      return data;
    }

    // Pattern detection
    if (config.enablePatternDetection && this.containsSensitivePattern(data)) {
      return config.maskValue as unknown as T;
    }

    return data;
  }

  private static processObject<T>(
    data: T,
    config: SanitizationParams,
    depth: number,
    seen: WeakSet<object>,
    path: string,
  ): T {
    const result = { ...(data as object) } as Record<string, unknown>;
    const sensitiveKeys = new Set(config.sensitiveKeys?.map((k) => k.toLowerCase()) || []);

    for (const [key, value] of Object.entries(result)) {
      const keyPath = path ? `${path}.${key}` : key;

      // Check if key is sensitive
      if (this.isSensitiveKey(key, sensitiveKeys)) {
        result[key] = config.maskValue;
      } else {
        result[key] = this.processValue(value, config, depth + 1, seen, keyPath);
      }
    }

    return result as T;
  }

  // Helper methods
  private static containsSensitivePattern(value: string): boolean {
    return defaultSensitiveKeysRegex.some((pattern) => pattern.test(value));
  }

  private static isSensitiveKey(key: string, sensitiveKeys: Set<string>): boolean {
    const keyLower = key.toLowerCase();
    return sensitiveKeys.has(keyLower);
  }

  /**
   * Sanitizes an error object by removing stack trace and applying standard sanitization.
   */
  public static sanitizeErrorObject(obj: Record<string, unknown>): Record<string, unknown> {
    if (!obj) return {};

    // Remove stack trace before sanitizing
    const { stack: _stack, ...objWithoutStack } = obj;

    return this.sanitize(objWithoutStack, {
      enablePatternDetection: false, // Skip pattern detection for error objects
    });
  }

  /**
   * Sanitize string values by removing dangerous characters and ANSI sequences
   */
  public static sanitizeString(value: string): string {
    if (!value || typeof value !== "string") return "";

    return (
      value
        // Remove ANSI escape sequences
        .replace(/\u001b\[[0-9;]*[a-zA-Z]/g, "")
        // Remove other dangerous characters
        .replace(/["'\\<>]/g, "")
        .trim()
    );
  }
}
