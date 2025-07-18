export interface LoggerConfig {
  logFileLimit: number;
  timeZone: string;
  dateFormat: string;
  logLevels: LogLevels;
  logFilePaths: LogFilePaths;
}

interface LogLevels {
  readonly debug: string;
  readonly info: string;
  readonly error: string;
  readonly warn: string;
}

interface LogFilePaths {
  readonly LOG_DIR: string;
  readonly LOG_FILE_INFO: string;
  readonly LOG_FILE_ERROR: string;
  readonly LOG_FILE_WARN: string;
  readonly LOG_FILE_DEBUG: string;
}

export interface LoggerMetadata {
  userId?: string | number;
  sessionId?: string;
  module?: string;
  requestId?: string;
  correlationId?: string;
  [key: string]: string | number | boolean | undefined;
}
