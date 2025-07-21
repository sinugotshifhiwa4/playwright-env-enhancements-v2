import path from "path";
import ErrorHandler from "../errorHandling/errorHandler";

export default class PathUtils {
  /**
   * Normalizes and secures a file path
   * Converts to absolute, checks for null bytes and path traversal.
   */
  public static normalize(inputPath: string): string {
    if (!inputPath) {
      throw new Error("Path cannot be empty");
    }

    if (inputPath.includes("\0")) {
      throw new Error("Path contains null bytes");
    }

    const normalizedPath = path.normalize(inputPath);
    const absolutePath = path.resolve(normalizedPath);
    const cwd = path.resolve(process.cwd());

    if (!absolutePath.startsWith(cwd) && !path.isAbsolute(inputPath)) {
      throw new Error(`Path traversal attempt detected: ${inputPath}`);
    }

    return absolutePath;
  }

  /**
   * Validates a file or directory path
   */
  public static validate(filePath: string, paramName = "path"): void {
    if (!filePath) {
      ErrorHandler.logAndThrow(
        `Invalid argument: '${paramName}' is required.`,
        "PathUtils.validate",
      );
    }

    if (paramName === "filePath" && /[\/\\]$/.test(filePath)) {
      ErrorHandler.logAndThrow(
        `Invalid file path: '${filePath}' cannot end with a directory separator.`,
        "PathUtils.validate",
      );
    }
  }

  /**
   * Gets relative path from current working directory
   */
  //   public static getRelative(filePath: string): string {
  //     return path.relative(process.cwd(), filePath);
  //   }

  public static resolvePath(fileName: string): string {
    return path.resolve(fileName);
  }

  public static joinPath(...segments: string[]): string {
    if (segments.length === 0) {
      throw new Error("At least one path segment is required");
    }

    const joinedPath = path.join(...segments);
    return this.normalize(joinedPath);
  }

  /**
   * Gets the file base name without its extension
   */
  public static getBaseName(filePath: string): string {
    return path.basename(filePath, path.extname(filePath));
  }

  /**
   * Gets the file extension (including dot)
   */
  public static getExtension(filePath: string): string {
    return path.extname(filePath);
  }
}
