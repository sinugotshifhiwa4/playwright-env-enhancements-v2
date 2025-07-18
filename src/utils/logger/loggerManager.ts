import winston from "winston";
import WinstonLoggerFactory from "./loggerFactory";
import { winstonLoggerConfig } from "./../types/logger/logger.config";
import { LoggerMetadata } from "../types/logger/logger.types";

class LoggerManager {
  private static instance: winston.Logger | null = null;

  public static getLogger(): winston.Logger {
    if (!this.instance) {
      this.initializeLogger();
    }
    return this.instance!;
  }

  public static createChildLogger(meta: LoggerMetadata): winston.Logger {
    return this.getLogger().child(meta);
  }

  public static close(): void {
    if (this.instance) {
      this.instance.close();
      this.instance = null;
    }
  }

  public static reset(): void {
    this.close();
  }

  private static initializeLogger(): void {
    const loggerDir = WinstonLoggerFactory.resolvePath(
      process.cwd(),
      winstonLoggerConfig.logFilePaths.LOG_DIR,
    );
    this.instance = WinstonLoggerFactory.createLogger(loggerDir);
  }
}

// Export the logger instance
export default LoggerManager.getLogger();
