import winston, { format } from "winston";
import moment from "moment-timezone";
import path from "path";
import fs from "fs";
import { winstonLoggerConfig } from "../types/logger/logger.config";
import type { EnvironmentStage } from "../../configuration/types/environment/environment.types";

export default class LoggerFactory {
  public static createLogger(loggingDir: string): winston.Logger {
    this.ensureDirExists(loggingDir);
    const fileTransports = this.createFileTransports(loggingDir);
    const consoleTransport = this.createConsoleTransport();

    return winston.createLogger({
      level: winstonLoggerConfig.logLevels.debug,
      transports: [
        fileTransports.info,
        fileTransports.warn,
        fileTransports.error,
        fileTransports.debug,
        consoleTransport,
      ],
      exceptionHandlers: [this.createExceptionHandler(loggingDir, "exceptions.log")],
      rejectionHandlers: [this.createRejectionHandler(loggingDir, "rejections.log")],
    });
  }

  public static resolvePath(dirpath: string, fileName: string): string {
    return path.resolve(dirpath, fileName);
  }

  private static createFileTransports(loggingDir: string) {
    const timestampFormat = this.customTimestampFormat();
    const customFormat = this.logCustomFormat();

    const baseTransportConfig = {
      maxsize: winstonLoggerConfig.logFileLimit,
      format: winston.format.combine(winston.format.uncolorize(), timestampFormat, customFormat),
    };

    const createLevelTransport = (level: string, filename: string) =>
      new winston.transports.File({
        ...baseTransportConfig,
        filename: this.resolvePath(loggingDir, filename),
        level,
        format: winston.format.combine(
          this.levelFilter(level),
          winston.format.uncolorize(),
          timestampFormat,
          customFormat,
        ),
      });

    return {
      info: createLevelTransport(
        winstonLoggerConfig.logLevels.info,
        winstonLoggerConfig.logFilePaths.LOG_FILE_INFO,
      ),
      warn: createLevelTransport(
        winstonLoggerConfig.logLevels.warn,
        winstonLoggerConfig.logFilePaths.LOG_FILE_WARN,
      ),
      error: createLevelTransport(
        winstonLoggerConfig.logLevels.error,
        winstonLoggerConfig.logFilePaths.LOG_FILE_ERROR,
      ),
      debug: createLevelTransport(
        winstonLoggerConfig.logLevels.debug,
        winstonLoggerConfig.logFilePaths.LOG_FILE_DEBUG,
      ),
    };
  }

  private static createConsoleTransport(): winston.transports.ConsoleTransportInstance {
    const timestampFormat = this.customTimestampFormat();
    const customFormatColored = this.logCustomFormatColored();
    const environment = (process.env.ENV as EnvironmentStage) || "dev";
    const consoleLevel = this.getConsoleLogLevel(environment);

    return new winston.transports.Console({
      level: consoleLevel,
      format: winston.format.combine(timestampFormat, customFormatColored),
    });
  }

  private static createExceptionHandler(loggingDir: string, filename: string) {
    return new winston.transports.File({
      filename: this.resolvePath(loggingDir, filename),
      format: winston.format.combine(
        winston.format.uncolorize(),
        this.customTimestampFormat(),
        this.logCustomFormat(),
      ),
    });
  }

  private static createRejectionHandler(loggingDir: string, filename: string) {
    return new winston.transports.File({
      filename: this.resolvePath(loggingDir, filename),
      format: winston.format.combine(
        winston.format.uncolorize(),
        this.customTimestampFormat(),
        this.logCustomFormat(),
      ),
    });
  }

  private static getConsoleLogLevel(environment: EnvironmentStage): string {
    const levelMap: Record<EnvironmentStage, string> = {
      dev: winstonLoggerConfig.logLevels.debug,
      qa: winstonLoggerConfig.logLevels.debug,
      uat: winstonLoggerConfig.logLevels.info,
      preprod: winstonLoggerConfig.logLevels.warn,
      prod: winstonLoggerConfig.logLevels.error,
    };
    return levelMap[environment] || winstonLoggerConfig.logLevels.debug;
  }

  private static ensureDirExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  private static levelFilter(level: string): winston.Logform.Format {
    return format((info) => (info.level === level ? info : false))();
  }

  private static logCustomFormat(): winston.Logform.Format {
    return winston.format.printf(({ level, message, timestamp, ...meta }) => {
      const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
      return `${timestamp} [${level}]: ${message}${metaStr}`;
    });
  }

  private static logCustomFormatColored(): winston.Logform.Format {
    return winston.format.printf(({ level, message, timestamp, ...meta }) => {
      const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
      const coloredLevel = winston.format.colorize().colorize(level, level.toUpperCase());
      return `${timestamp} [${coloredLevel}]: ${message}${metaStr}`;
    });
  }

  private static customTimestampFormat(): winston.Logform.Format {
    return winston.format.timestamp({
      format: () =>
        moment().tz(winstonLoggerConfig.timeZone).format(winstonLoggerConfig.dateFormat),
    });
  }
}
