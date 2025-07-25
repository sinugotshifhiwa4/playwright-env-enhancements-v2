import fs from "fs";
import path from "path";
import PathUtils from "./pathUtils";
import { FileOperationOptions, FileOperationResult } from "../types/fileManager/File-manager.types";
import { FileEncoding } from "../types/fileManager/file-encoding.enum";
import ErrorHandler from "../errorHandling/errorHandler";
import logger from "../logger/loggerManager";

export default class FileManager {
  // Default options
  private static readonly DEFAULT_OPTIONS: FileOperationOptions = {
    throwOnError: true,
    overwrite: true,
    createParentDirs: true,
  };

  /**
   * Creates directory structure recursively
   */
  public static async createDirectory(
    dirPath: string,
    options?: Partial<FileOperationOptions>,
  ): Promise<FileOperationResult> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    dirPath = PathUtils.normalize(dirPath);
    PathUtils.validate(dirPath, "dirPath");

    try {
      await fs.promises.mkdir(dirPath, { recursive: true });
      logger.debug(`Created directory: ${PathUtils.resolvePath(dirPath)}`);
      return { success: true };
    } catch (error) {
      ErrorHandler.captureError(error, "createDirectory", `Failed to create directory: ${dirPath}`);

      if (opts.throwOnError) {
        throw error;
      }
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Creates an empty file with parent directories
   */
  public static async createFile(
    filePath: string,
    options?: Partial<FileOperationOptions>,
  ): Promise<FileOperationResult> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    filePath = PathUtils.normalize(filePath);
    PathUtils.validate(filePath, "filePath");

    try {
      // First ensure parent directory exists
      const dirPath = path.dirname(filePath);
      const dirResult = await this.createDirectory(dirPath, options);

      if (!dirResult.success) {
        return dirResult;
      }

      // Create empty file if it doesn't exist
      const fileHandle = await fs.promises.open(filePath, "a");
      await fileHandle.close();

      logger.debug(`Created file: ${PathUtils.resolvePath(filePath)}`);
      return { success: true };
    } catch (error) {
      ErrorHandler.captureError(error, "createFile", `Failed to create file: ${filePath}`);

      if (opts.throwOnError) {
        throw error;
      }

      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Checks if a directory exists
   *
   * @param dirPath - Path to the directory
   * @returns Promise resolving to boolean indicating existence
   */
  public static async doesDirectoryExist(dirPath: string): Promise<boolean> {
    dirPath = PathUtils.normalize(dirPath);
    PathUtils.validate(dirPath, "dirPath");

    try {
      const stats = await fs.promises.stat(dirPath);
      return stats.isDirectory();
    } catch {
      logger.debug(`Directory does not exist: ${PathUtils.resolvePath(dirPath)}`);
      return false;
    }
  }

  public static async ensureDirectoryExist(dirPath: string): Promise<FileOperationResult> {
    const exist = await this.doesDirectoryExist(dirPath);

    if (!exist) {
      return this.createDirectory(dirPath);
    }

    return { success: true };
  }

  /**
   * Checks if a file exists
   *
   * @param filePath - Path to the file
   * @returns Promise resolving to boolean indicating existence
   */
  public static async doesFileExist(filePath: string): Promise<boolean> {
    filePath = PathUtils.normalize(filePath);
    PathUtils.validate(filePath, "filePath");

    try {
      const stats = await fs.promises.stat(filePath);
      return stats.isFile();
    } catch {
      logger.debug(`File does not exist: ${path.basename(filePath)}`);
      return false;
    }
  }

  public static async ensureFileExist(filePath: string): Promise<FileOperationResult> {
    const exist = await this.doesFileExist(filePath);

    if (!exist) {
      return this.createFile(filePath);
    }

    return { success: true };
  }

  /**
   * Deletes a file
   */
  public static async deleteFile(
    filePath: string,
    options?: Partial<FileOperationOptions>,
  ): Promise<FileOperationResult> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    filePath = PathUtils.normalize(filePath);
    PathUtils.validate(filePath, "filePath");

    try {
      await fs.promises.unlink(filePath);
      logger.debug(`Deleted file: ${PathUtils.resolvePath(filePath)}`);
      return { success: true };
    } catch (error) {
      ErrorHandler.captureError(error, "deleteFile", `Failed to delete file: ${filePath}`);

      if (opts.throwOnError) {
        throw error;
      }
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Deletes a directory
   */
  public static async deleteDirectory(
    dirPath: string,
    options?: Partial<FileOperationOptions>,
  ): Promise<FileOperationResult> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    dirPath = PathUtils.normalize(dirPath);
    PathUtils.validate(dirPath, "dirPath");

    try {
      await fs.promises.rmdir(dirPath, { recursive: true });
      logger.debug(`Deleted directory: ${PathUtils.resolvePath(dirPath)}`);
      return { success: true };
    } catch (error) {
      ErrorHandler.captureError(error, "deleteDirectory", `Failed to delete directory: ${dirPath}`);

      if (opts.throwOnError) {
        throw error;
      }
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Writes content to a file with improved error handling and options
   *
   * @param filePath - Path to the file
   * @param content - Content to write
   * @param keyName - Identifier for logging
   * @param encoding - File encoding
   * @param options - Operation options
   * @returns Promise with operation result
   */
  public static async writeFile(
    filePath: string,
    content: string,
    keyName: string,
    encoding: FileEncoding = FileEncoding.UTF8,
    options?: Partial<FileOperationOptions>,
  ): Promise<FileOperationResult> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    filePath = PathUtils.normalize(filePath);

    try {
      PathUtils.validate(filePath, "filePath");

      if (content === undefined || content === null) {
        const error = new Error(`No content provided for file: ${keyName}`);
        logger.warn(error.message);

        if (opts.throwOnError) {
          throw error;
        }
        return { success: false, error };
      }

      const dirPath = path.dirname(filePath);

      if (opts.createParentDirs) {
        await this.createDirectory(dirPath);
      }

      // Check if file exists and we're not supposed to overwrite
      if (!opts.overwrite) {
        const exists = await this.doesFileExist(filePath);
        if (exists) {
          const error = new Error(`File already exists and overwrite is disabled: ${filePath}`);

          if (opts.throwOnError) {
            throw error;
          }
          return { success: false, error };
        }
      }

      await fs.promises.writeFile(filePath, content, { encoding });

      logger.debug(`Successfully wrote file: ${PathUtils.resolvePath(filePath)}`);
      return { success: true };
    } catch (error) {
      ErrorHandler.captureError(error, "writeFile", `Failed to write file: ${filePath}`);

      if (opts.throwOnError) {
        throw error;
      }
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }
  /**
   * Reads content from a file
   *
   * @param filePath - Path to the file
   * @param encoding - File encoding
   * @returns Promise with file content
   */
  public static async readFile(
    filePath: string,
    encoding: FileEncoding = FileEncoding.UTF8,
  ): Promise<string> {
    filePath = PathUtils.normalize(filePath);
    PathUtils.validate(filePath, "filePath");

    try {
      const content = await fs.promises.readFile(filePath, { encoding });
      logger.debug(`Successfully loaded file: ${PathUtils.resolvePath(filePath)}`);
      return content.toString();
    } catch (error) {
      ErrorHandler.captureError(error, "readFile", `Failed to read file: ${filePath}`);
      throw error;
    }
  }

  /**
   * Checks if a file or directory is accessible
   * @param filePath - Path to check
   * @param mode - Access mode (optional, defaults to F_OK for existence check)
   * @param options - Operation options
   * @returns Promise with operation result
   */
  public static async checkAccess(
    filePath: string,
    mode: number = fs.constants.F_OK,
    options?: Partial<FileOperationOptions>,
  ): Promise<FileOperationResult> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    filePath = PathUtils.normalize(filePath);
    PathUtils.validate(filePath, "filePath");

    try {
      await fs.promises.access(filePath, mode);
      return { success: true };
    } catch (error) {
      const modeDescription = this.getAccessModeDescription(mode);
      ErrorHandler.captureError(
        error,
        "checkAccess",
        `Access check failed for ${filePath} (${modeDescription})`,
      );

      if (opts.throwOnError) {
        throw error;
      }
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Lists directory contents with detailed information
   */
  public static async listDirectoryContents(
    dirPath: string,
    options?: Partial<FileOperationOptions> & {
      includeStats?: boolean;
      recursive?: boolean;
    },
  ): Promise<
    FileOperationResult<
      Array<{ name: string; isFile: boolean; isDirectory: boolean; stats?: fs.Stats }>
    >
  > {
    const opts = { ...this.DEFAULT_OPTIONS, includeStats: false, recursive: false, ...options };
    dirPath = PathUtils.normalize(dirPath);
    PathUtils.validate(dirPath, "dirPath");

    try {
      const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
      const result = [];

      for (const entry of entries) {
        const entryInfo = {
          name: entry.name,
          isFile: entry.isFile(),
          isDirectory: entry.isDirectory(),
          stats: opts.includeStats
            ? await fs.promises.stat(path.join(dirPath, entry.name))
            : undefined,
        };

        result.push(entryInfo);

        // Recursive listing for directories
        if (opts.recursive && entry.isDirectory()) {
          const subDirPath = path.join(dirPath, entry.name);
          const subResult = await this.listDirectoryContents(subDirPath, opts);
          if (subResult.success && subResult.data) {
            result.push(
              ...subResult.data.map((item) => ({
                ...item,
                name: path.join(entry.name, item.name),
              })),
            );
          }
        }
      }

      return { success: true, data: result };
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "listDirectoryContents",
        `Failed to list directory contents: ${dirPath}`,
      );

      if (opts.throwOnError) {
        throw error;
      }
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Gets file size in bytes
   */
  public static async getFileSize(
    filePath: string,
    options?: Partial<FileOperationOptions>,
  ): Promise<FileOperationResult<number>> {
    const statsResult = await this.getFileStats(filePath, options);

    if (!statsResult.success || !statsResult.data) {
      return {
        success: false,
        error: statsResult.error ?? new Error("Failed to get file stats"),
      };
    }

    return {
      success: true,
      data: statsResult.data.size,
    };
  }

  /**
   * Gets file stats
   *
   * @param filePath - Path to the file
   * @param options - Operation options
   * @returns Promise with operation result containing file stats
   */
  public static async getFileStats(
    filePath: string,
    options?: Partial<FileOperationOptions>,
  ): Promise<FileOperationResult<fs.Stats>> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    filePath = PathUtils.normalize(filePath);

    try {
      PathUtils.validate(filePath, "filePath");
      const stats = await fs.promises.stat(filePath);
      return { success: true, data: stats };
    } catch (error) {
      ErrorHandler.captureError(error, "getFileStats", `Failed to get file stats: ${filePath}`);

      if (opts.throwOnError) {
        throw error;
      }
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Helper method to get human-readable access mode description
   * @param mode - Access mode constant
   * @returns Description string
   */
  private static getAccessModeDescription(mode: number): string {
    const modes: string[] = [];

    if (mode & fs.constants.F_OK) modes.push("exists");
    if (mode & fs.constants.R_OK) modes.push("readable");
    if (mode & fs.constants.W_OK) modes.push("writable");
    if (mode & fs.constants.X_OK) modes.push("executable");

    return modes.length > 0 ? modes.join(", ") : "unknown";
  }
}
