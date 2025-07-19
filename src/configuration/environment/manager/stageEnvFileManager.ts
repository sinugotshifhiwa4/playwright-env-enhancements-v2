import FileManager from "../../../utils/fileManager/fileManager";
import { SECURITY_CONSTANTS } from "../../../cryptography/types/security.constant";
import { FileEncoding } from "../../../utils/types/fileManager/file-encoding.enum";
import ErrorHandler from "../../../utils/errorHandling/errorHandler";
import logger from "../../../utils/logger/loggerManager";

export default class StageEnvFileManager {
  /**
   * Reads the environment file and returns its content as an array of lines.
   */
  public static async readEnvironmentFileAsLines(filePath: string): Promise<string[]> {
    const exists = await FileManager.doesFileExist(filePath);
    if (!exists) {
      throw new Error(`Environment file not found: ${filePath}`);
    }

    const content = await FileManager.readFile(filePath, FileEncoding.UTF8);

    if (!content) {
      logger.warn(`Environment file is empty: ${filePath}`);
      return [];
    }

    // Handle both Windows (\r\n) and Unix (\n) line endings
    return content.split(/\r?\n/);
  }

  /**
   * Writes the updated lines back to the environment file.
   */
  public static async writeEnvironmentFileLines(filePath: string, lines: string[]): Promise<void> {
    try {
      const content = lines.join("\n");
      await FileManager.writeFile(filePath, content, FileEncoding.UTF8);
      logger.debug(`Successfully wrote ${lines.length} lines to ${filePath}`);
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "writeEnvironmentFileLines",
        "Failed to write environment file",
      );
      throw error;
    }
  }

  /**
   * Extracts all environment variables from the file lines.
   */
  public static extractEnvironmentVariables(lines: string[]): Record<string, string> {
    const variables: Record<string, string> = {};
    let lineNumber = 0;

    for (const line of lines) {
      lineNumber++;
      const parsedVariable = this.parseEnvironmentLine(line, lineNumber);

      if (parsedVariable) {
        const [key, value] = parsedVariable;

        if (Object.prototype.hasOwnProperty.call(variables, key)) {
          logger.warn(`Duplicate environment variable '${key}' found at line ${lineNumber}`);
        }

        variables[key] = value;
      }
    }

    logger.debug(`Extracted ${Object.keys(variables).length} environment variables`);
    return variables;
  }

  /**
   * Parses a single environment file line to extract key-value pairs.
   */
  public static parseEnvironmentLine(line: string, lineNumber?: number): [string, string] | null {
    const trimmedLine = line.trim();

    // Skip empty lines, comments, and lines without equals
    if (!trimmedLine || trimmedLine.startsWith("#") || !trimmedLine.includes("=")) {
      return null;
    }

    const equalIndex = trimmedLine.indexOf("=");
    const key = trimmedLine.substring(0, equalIndex).trim();
    const value = trimmedLine.substring(equalIndex + 1);

    // Validate key format
    if (!key || !SECURITY_CONSTANTS.VALIDATION.ENV_VAR_KEY_PATTERN.test(key)) {
      const lineInfo = lineNumber ? ` at line ${lineNumber}` : "";
      logger.warn(`Invalid environment variable key format: '${key}'${lineInfo}`);
      return null;
    }

    return [key, value];
  }

  /**
   * Updates the environment file lines with a new value for the specified variable.
   */
  public static updateEnvironmentFileLines(
    existingLines: string[],
    envVariable: string,
    value: string,
  ): string[] {
    let wasUpdated = false;

    const updatedLines = existingLines.map((line) => {
      const trimmedLine = line.trim();

      // Look for the exact variable assignment
      if (trimmedLine.startsWith(`${envVariable}=`)) {
        wasUpdated = true;
        return `${envVariable}=${value}`;
      }

      return line;
    });

    // If the variable wasn't found, append it to the end
    if (!wasUpdated) {
      updatedLines.push(`${envVariable}=${value}`);
      logger.debug(`Added new environment variable: ${envVariable}`);
    }

    return updatedLines;
  }

  /**
   * Finds an environment variable by key or value.
   */
  public static findEnvironmentVariableByKey(
    allEnvVariables: Record<string, string>,
    lookupValue: string,
  ): Record<string, string> {
    const result: Record<string, string> = {};

    // First, check if it's a direct key match
    if (Object.prototype.hasOwnProperty.call(allEnvVariables, lookupValue)) {
      result[lookupValue] = allEnvVariables[lookupValue];
      return result;
    }

    // Then, check if it matches any value
    for (const [key, value] of Object.entries(allEnvVariables)) {
      if (value === lookupValue) {
        result[key] = value;
        return result;
      }
    }

    return result;
  }

  /**
   * Checks if an environment-specific file exists
   */
  public static async doesEnvironmentFileExist(filePath: string): Promise<boolean> {
    return FileManager.doesFileExist(filePath);
  }

  /**
   * Logs appropriate message when environment file is not found
   */
  public static logEnvironmentFileNotFound(filePath: string, environmentStage: string): void {
    logger.warn(
      `Environment '${environmentStage}' was specified but its configuration file could not be found at ${filePath}.`,
    );
  }
}
