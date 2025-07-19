import FileManager from "../../utils/fileManager/fileManager";
import { EncryptionManager } from "./encryptionManager";
import { SECURITY_CONSTANTS } from "../types/security.constant";
import { FileEncoding } from "../../utils/types/fileManager/file-encoding.enum";
import ErrorHandler from "../../utils/errorHandling/errorHandler";

/**
 * Utility class for validating encryption status of environment variables
 */
export class EncryptionValidator {
  private encryptionManager: EncryptionManager;

  constructor(encryptionManager: EncryptionManager) {
    this.encryptionManager = encryptionManager;
  }

  /**
   * Validate encryption status of specified environment variables
   * @param varNames - Array of variable names to validate
   * @returns Object mapping variable names to their encryption status
   */
  public async validateEncryption(varNames: string[]): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    const envVars = await this.loadEnvironmentVariables(
      this.encryptionManager.getCurrentEnvironmentStageFilePath(),
    );

    for (const varName of varNames) {
      const value = envVars[varName];
      results[varName] = value ? this.isEncrypted(value) : false;
    }

    return results;
  }

  /**
   * Check if all specified variables are encrypted
   * @param varNames - Array of variable names to validate
   * @returns True if all variables are encrypted, false otherwise
   */
  public async areAllEncrypted(varNames: string[]): Promise<boolean> {
    const results = await this.validateEncryption(varNames);
    return Object.values(results).every((isEncrypted) => isEncrypted);
  }

  /**
   * Get a list of unencrypted variables from the specified list
   * @param varNames - Array of variable names to check
   * @returns Array of variable names that are not encrypted
   */
  public async getUnencryptedVariables(varNames: string[]): Promise<string[]> {
    const results = await this.validateEncryption(varNames);
    return Object.entries(results)
      .filter(([, isEncrypted]) => !isEncrypted)
      .map(([varName]) => varName);
  }

  /**
   * Load and parse environment variables from a file
   */
  private async loadEnvironmentVariables(filePath: string): Promise<Record<string, string>> {
    const exists = await FileManager.doesFileExist(filePath);

    if (!exists) {
      ErrorHandler.logAndThrow(
        `Environment file not found: ${filePath}`,
        "loadEnvironmentVariables",
      );
    }

    const envContent = await FileManager.readFile(filePath, FileEncoding.UTF8);
    const envVars: Record<string, string> = {};

    envContent.split("\n").forEach((line) => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith("#")) {
        const [key, ...valueParts] = trimmedLine.split("=");
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join("=").trim();
        }
      }
    });

    return envVars;
  }

  /**
   * Check if a value is properly encrypted with ENC2 format
   */
  private isEncrypted(value: string): boolean {
    if (!value || typeof value !== "string") {
      return false;
    }

    if (!value.startsWith(SECURITY_CONSTANTS.FORMAT.PREFIX)) {
      return false;
    }

    const withoutPrefix = value.substring(SECURITY_CONSTANTS.FORMAT.PREFIX.length);
    const parts = withoutPrefix.split(SECURITY_CONSTANTS.FORMAT.SEPARATOR);

    if (parts.length !== SECURITY_CONSTANTS.FORMAT.EXPECTED_PARTS) {
      return false;
    }

    const base64Regex = /^[A-Za-z0-9+/]+=*$/;
    return parts.every((part) => part.length > 0 && base64Regex.test(part));
  }
}
