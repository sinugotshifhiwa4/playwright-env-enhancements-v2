import { CryptoService } from "../service/cryptoService";
import EnvironmentDetector from "../../configuration/environment/detector/environmentDetector";
import StageEnvFileManager from "../../configuration/environment/manager/stageEnvFileManager";
import path from "path";
import { SECURITY_CONSTANTS } from "../types/security.constant";
import type { EnvironmentStage } from "../../configuration/types/environment/environment.types";
import {
  EnvironmentFilePaths,
  SecretKeyVariables,
} from "../../configuration/types/environment/environment.constants";
import ErrorHandler from "../../utils/errorHandling/errorHandler";
import logger from "../../utils/logger/loggerManager";

/**
 * Handles encryption operations for environment variables.
 * Focuses solely on encryption logic and orchestration.
 */
export class EncryptionManager {
  public async encryptEnvironmentVariables(envVariables?: string[]): Promise<void> {
    try {
      await this.encryptAndUpdateEnvironmentVariables(
        this.getCurrentEnvironmentStageFilePath(),
        this.getCurrentEnvironmentSecretKeyVariable(),
        envVariables,
      );
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "encryptEnvironmentVariables",
        "Failed to encrypt environment variables",
      );
      throw error;
    }
  }

  private async encryptAndUpdateEnvironmentVariables(
    filePath: string,
    secretKeyVariable: string,
    envVariables?: string[],
  ): Promise<void> {
    const envFileLines = await StageEnvFileManager.readEnvironmentFileAsLines(filePath);
    const allEnvVariables = StageEnvFileManager.extractEnvironmentVariables(envFileLines);

    if (Object.keys(allEnvVariables).length === 0) {
      logger.warn(`No environment variables found in ${filePath}`);
      return;
    }

    const variablesToEncrypt = this.resolveVariablesToEncrypt(allEnvVariables, envVariables);

    if (Object.keys(variablesToEncrypt).length === 0) {
      return;
    }

    const { updatedLines, encryptedCount } = await this.encryptVariableValuesInFileLines(
      envFileLines,
      variablesToEncrypt,
      secretKeyVariable,
    );

    if (encryptedCount > 0) {
      await StageEnvFileManager.writeEnvironmentFileLines(filePath, updatedLines);
    }

    await this.logEncryptionSummary(
      filePath,
      Object.keys(variablesToEncrypt).length,
      encryptedCount,
    );
  }

  /**
   * Determines which environment variables should be encrypted based on the provided filter.
   * Filters out variables with empty values to prevent them from being counted.
   */
  private resolveVariablesToEncrypt(
    allEnvVariables: Record<string, string>,
    envVariables?: string[],
  ): Record<string, string> {
    let candidateVariables: Record<string, string>;

    if (!envVariables?.length) {
      candidateVariables = { ...allEnvVariables };
    } else {
      candidateVariables = {};
      const notFoundVariables: string[] = [];

      for (const lookupValue of envVariables) {
        const foundVariable = StageEnvFileManager.findEnvironmentVariableByKey(
          allEnvVariables,
          lookupValue,
        );

        if (Object.keys(foundVariable).length === 0) {
          notFoundVariables.push(lookupValue);
        } else {
          Object.assign(candidateVariables, foundVariable);
        }
      }

      if (notFoundVariables.length > 0) {
        logger.warn(`Environment variables not found: ${notFoundVariables.join(", ")}`);
      }
    }

    return this.filterEncryptableVariables(candidateVariables);
  }

  /**
   * Filters out variables that cannot or should not be encrypted.
   * This includes variables with empty values and already encrypted values.
   */
  private filterEncryptableVariables(
    candidateVariables: Record<string, string>,
  ): Record<string, string> {
    const variablesToEncrypt: Record<string, string> = {};
    const filteredOutVariables: string[] = [];

    for (const [key, value] of Object.entries(candidateVariables)) {
      const trimmedValue = value?.trim();

      if (!trimmedValue) {
        filteredOutVariables.push(`${key} (empty value)`);
        continue;
      }

      if (this.isAlreadyEncrypted(trimmedValue)) {
        filteredOutVariables.push(`${key}`);
        continue;
      }

      variablesToEncrypt[key] = value;
    }

    if (filteredOutVariables.length > 0) {
      logger.info(`Skipped encrypted variables: ${filteredOutVariables.join(", ")}`);
    }

    return variablesToEncrypt;
  }

  /**
   * Encrypts the values of specified environment variables in the file lines.
   * Now only processes variables that are actually eligible for encryption.
   */
  private async encryptVariableValuesInFileLines(
    envFileLines: string[],
    variablesToEncrypt: Record<string, string>,
    secretKeyVariable: string,
  ): Promise<{ updatedLines: string[]; encryptedCount: number }> {
    try {
      let updatedLines = [...envFileLines];
      let encryptedCount = 0;
      const failedVariables: string[] = [];

      for (const [key, value] of Object.entries(variablesToEncrypt)) {
        try {
          const encryptedValue = await CryptoService.encrypt(value.trim(), secretKeyVariable);
          updatedLines = StageEnvFileManager.updateEnvironmentFileLines(
            updatedLines,
            key,
            encryptedValue,
          );
          encryptedCount++;
          logger.debug(`Successfully encrypted variable: ${key}`);
        } catch (encryptionError) {
          failedVariables.push(key);
          logger.error(`Failed to encrypt variable '${key}': ${encryptionError}`);
          throw encryptionError;
        }
      }

      if (failedVariables.length > 0) {
        logger.warn(`Failed to encrypt variables: ${failedVariables.join(", ")}`);
      }

      return { updatedLines, encryptedCount };
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "encryptVariableValuesInFileLines",
        "Failed to encrypt variable values",
      );
      throw error;
    }
  }

  /**
   * Checks if a value is already encrypted by looking for the encryption prefix.
   */
  public isAlreadyEncrypted(value: string): boolean {
    if (!value) {
      return false;
    }
    return value.startsWith(SECURITY_CONSTANTS.FORMAT.PREFIX);
  }

  /**
   * Logs the summary of the encryption process.
   */
  private async logEncryptionSummary(
    filePath: string,
    totalVariables: number,
    encryptedCount: number,
  ): Promise<void> {
    try {
      const skippedCount = totalVariables - encryptedCount;

      if (encryptedCount === 0) {
        logger.info(`No variables needed encryption in ${filePath}`);
      } else {
        const summary = `Encryption completed. ${encryptedCount} variables processed from '${path.basename(filePath)}'`;
        const details = skippedCount > 0 ? `, ${skippedCount} skipped` : "";
        logger.info(`${summary}${details}`);
      }
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "logEncryptionSummary",
        `Failed to log encryption summary for ${filePath}`,
      );
    }
  }

  /**
   * Get the secret key for the current environment (auto-detected)
   */
  public getCurrentEnvironmentSecretKeyVariable(): string {
    const currentEnvironment = EnvironmentDetector.getCurrentEnvironmentStage();
    return this.getSecretKeyVariable(currentEnvironment);
  }

  /**
   * Get the environment file path for the current environment (auto-detected)
   */
  public getCurrentEnvironmentStageFilePath(): string {
    const currentEnvironment = EnvironmentDetector.getCurrentEnvironmentStage();
    return this.getEnvironmentStageFilePath(currentEnvironment);
  }

  /**
   * Get the appropriate secret key variable for the given environment
   */
  private getSecretKeyVariable(environment: EnvironmentStage): string {
    switch (environment) {
      case "dev":
        return SecretKeyVariables.dev;
      case "qa":
        return SecretKeyVariables.qa;
      case "uat":
        return SecretKeyVariables.uat;
      case "preprod":
        return SecretKeyVariables.preprod;
      case "prod":
        return SecretKeyVariables.prod;
      default:
        ErrorHandler.logAndThrow(
          `Failed to select secret key. Invalid environment: ${environment}. Must be 'dev', 'qa', 'uat', 'preprod' or 'prod'`,
          "getSecretKeyVariable",
        );
    }
  }

  private getEnvironmentStageFilePath(environment: EnvironmentStage): string {
    switch (environment) {
      case "dev":
        return EnvironmentFilePaths.dev;
      case "qa":
        return EnvironmentFilePaths.qa;
      case "uat":
        return EnvironmentFilePaths.uat;
      case "preprod":
        return EnvironmentFilePaths.preprod;
      case "prod":
        return EnvironmentFilePaths.prod;
      default:
        ErrorHandler.logAndThrow(
          `Failed to select environment file. Invalid environment: ${environment}. Must be 'dev', 'qa', 'uat', 'preprod' or 'prod'`,
          "getEnvironmentStageFilePath",
        );
    }
  }
}
