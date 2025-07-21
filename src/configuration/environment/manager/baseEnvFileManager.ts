import FileManager from "../../../utils/fileManager/fileManager";
import EnvironmentPathUtils from "../../../utils/environment/environmentPathUtils";
import { FileEncoding } from "../../../utils/types/fileManager/file-encoding.enum";
import ErrorHandler from "../../../utils/errorHandling/errorHandler";
import logger from "../../../utils/logger/loggerManager";

/**
 * Manages base environment file operations including reading, writing, and updating base environment variables
 */
export default class BaseEnvFileManager {
  public static readonly BASE_ENV_FILE = EnvironmentPathUtils.getBaseEnvFilePath();

  /**
   * Reads content from the base environment file or creates it if it doesn't exist
   * @returns Promise resolving to the file content as string
   */
  public static async getOrCreateBaseEnvFileContent(): Promise<string> {
    try {
      const fileExists = await FileManager.createFile(this.BASE_ENV_FILE);

      if (!fileExists) {
        logger.warn(
          `Base environment file not found at "${this.BASE_ENV_FILE}". A new empty file will be created.`,
        );
        await FileManager.writeFile(this.BASE_ENV_FILE, "", "Created empty environment file");
        return "";
      }

      return await FileManager.readFile(this.BASE_ENV_FILE, FileEncoding.UTF8);
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "getOrCreateBaseEnvFileContent",
        `Failed to read or initialize environment file at "${this.BASE_ENV_FILE}"`,
      );
      throw error;
    }
  }

  /**
   * Writes secret key variable to base environment file
   * @param content - Content to write to the file
   * @param keyName - Name of the key being written (for logging purposes)
   */
  public static async writeSecretKeyVariableToBaseEnvFile(
    content: string,
    keyName: string,
  ): Promise<void> {
    try {
      await FileManager.writeFile(this.BASE_ENV_FILE, content, keyName, FileEncoding.UTF8);
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "writeSecretKeyVariableToBaseEnvFile",
        `Failed to write key "${keyName}" to environment file.`,
      );
      throw error;
    }
  }

  /**
   * Retrieves the value for a specific environment key
   * @param keyName - The name of the environment key to retrieve
   * @returns Promise resolving to the value of the key, or undefined if not found
   */
  public static async getSecretKeyValue(keyName: string): Promise<string | undefined> {
    try {
      const fileContent = await this.getOrCreateBaseEnvFileContent();
      return this.extractKeyValue(fileContent, keyName);
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "getSecretKeyValue",
        `Failed to retrieve value for key "${keyName}".`,
      );
      throw error;
    }
  }

  /**
   * Stores or updates an environment key-value pair in the base environment file
   * @param keyName - The name of the environment key
   * @param value - The value to store for the key
   */
  public static async storeBaseEnvironmentKey(keyName: string, value: string): Promise<void> {
    try {
      // Get current file content
      const fileContent = await this.getOrCreateBaseEnvFileContent();

      // Update or add the key-value pair
      const updatedContent = this.updateOrAddEnvironmentKey(fileContent, keyName, value);

      // Write the updated content back to the file
      await this.writeSecretKeyVariableToBaseEnvFile(updatedContent, keyName);
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "storeBaseEnvironmentKey",
        `Failed to store key "${keyName}" value`,
      );
      throw error;
    }
  }

  /**
   * Extracts the value for a specific key from the file content
   * @param fileContent - The content to search in
   * @param keyName - The key name to extract value for
   * @returns The value of the key, or undefined if not found
   */
  private static extractKeyValue(fileContent: string, keyName: string): string | undefined {
    const regex = this.createKeyValueRegex(keyName);
    const match = fileContent.match(regex);
    return match?.[1];
  }

  /**
   * Creates a regex pattern to match and capture an environment key's value
   * Escapes special regex characters in the key name for safety
   * @param keyName - The key name to create regex for
   * @returns RegExp object for matching and capturing the key's value
   */
  private static createKeyValueRegex(keyName: string): RegExp {
    const escapedKeyName = keyName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`^${escapedKeyName}=(.*)$`, "m");
  }

  /**
   * Updates an existing environment key or adds a new one to the file content
   * @param fileContent - The current content of the environment file
   * @param keyName - The name of the environment key
   * @param value - The value to set for the key
   * @returns The updated file content
   */
  private static updateOrAddEnvironmentKey(
    fileContent: string,
    keyName: string,
    value: string,
  ): string {
    const keyExists = this.environmentKeyExists(fileContent, keyName);

    if (keyExists) {
      return this.updateExistingEnvironmentKey(fileContent, keyName, value);
    } else {
      return this.addNewEnvironmentKey(fileContent, keyName, value);
    }
  }

  /**
   * Checks if an environment key exists in the file content
   * @param fileContent - The content to search in
   * @param keyName - The key name to look for
   * @returns True if the key exists, false otherwise
   */
  private static environmentKeyExists(fileContent: string, keyName: string): boolean {
    const regex = this.createKeyRegex(keyName);
    return regex.test(fileContent);
  }

  /**
   * Creates a regex pattern to match an environment key line
   * Escapes special regex characters in the key name for safety
   * @param keyName - The key name to create regex for
   * @returns RegExp object for matching the key
   */
  private static createKeyRegex(keyName: string): RegExp {
    const escapedKeyName = keyName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`^${escapedKeyName}=.*$`, "m");
  }

  /**
   * Updates an existing environment key in the file content
   * @param fileContent - The current file content
   * @param keyName - The key name to update
   * @param value - The new value for the key
   * @returns Updated file content
   */
  private static updateExistingEnvironmentKey(
    fileContent: string,
    keyName: string,
    value: string,
  ): string {
    const regex = this.createKeyRegex(keyName);
    const updatedContent = fileContent.replace(regex, `${keyName}=${value}`);
    logger.debug(`Key "${keyName}" found and updated`);
    return updatedContent;
  }

  /**
   * Adds a new environment key to the file content
   * @param fileContent - The current file content
   * @param keyName - The key name to add
   * @param value - The value for the new key
   * @returns Updated file content with the new key
   */
  private static addNewEnvironmentKey(fileContent: string, keyName: string, value: string): string {
    let updatedContent = fileContent;

    // Ensure file ends with newline before adding new key
    if (updatedContent && !updatedContent.endsWith("\n")) {
      updatedContent += "\n";
    }

    updatedContent += `${keyName}=${value}`;
    logger.debug(`Key "${keyName}" not found, added to end of file`);

    return updatedContent;
  }

  /**
   * Checks if the base environment file exists
   * @param baseEnvFilePath - Path to the base environment file
   * @returns Promise resolving to true if file exists, false otherwise
   */
  public static async doesBaseEnvFileExist(): Promise<boolean> {
    return FileManager.doesFileExist(this.BASE_ENV_FILE);
  }

  /**
   * Handles missing base environment file by logging appropriate warnings
   * Skips warnings during key generation operations
   */
  public static handleMissingBaseEnvFile(): void {
    const isGeneratingKey = (process.env.PLAYWRIGHT_GREP || "").includes("@full-encryption");

    // Skip check entirely if generating/storing secret keys
    if (isGeneratingKey) {
      return;
    }

    // For all other operations, warn but continue working
    const warningMessage = [
      `Base environment file not found at: ${this.BASE_ENV_FILE}.`,
      `Expected location based on configuration: ${this.BASE_ENV_FILE}.`,
      `You can create base environment file by running encryption`,
    ].join("\n");

    logger.warn(warningMessage);
  }
}
