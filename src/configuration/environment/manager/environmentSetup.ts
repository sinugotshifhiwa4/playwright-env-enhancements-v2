import dotenv from "dotenv";
import EnvironmentDetector from "../detector/environmentDetector";
import path from "path";
import BaseEnvFileManager from "./baseEnvFileManager";
import StageEnvFileManager from "./stageEnvFileManager";
import { EnvironmentFilePaths } from "../../types/environment/environment.constants";
import ErrorHandler from "../../../utils/errorHandling/errorHandler";
import type { EnvironmentStage } from "../../types/environment/environment.types";
import logger from "../../../utils/logger/loggerManager";

export class EnvironmentSetup {
  // Instance state tracking
  public initialized = false;
  private loadedFiles: string[] = [];

  public async initialize(): Promise<void> {
    // Skip if already initialized
    if (this.initialized) {
      logger.debug("environment already initialized");
      return;
    }

    try {
      // Skip local file loading in CI environments
      if (EnvironmentDetector.isCI()) {
        return;
      }

      // Load environment files
      await this.loadEnvironments();
      this.initialized = true;

      // Log success only if we loaded at least one file
      this.logInitializationResult();
    } catch (error) {
      ErrorHandler.captureError(error, "initialize", "Failed to set up environment variables");
      throw error;
    }
  }

  private logInitializationResult(): void {
    if (this.loadedFiles.length > 0) {
      logger.info(
        `Environment successfully initialized with ${this.loadedFiles.length} config files: ${this.loadedFiles.join(", ")}`,
      );
    } else {
      logger.warn("Environment initialized but no config files were loaded");
    }
  }

  private async loadEnvironments(): Promise<void> {
    await this.loadBaseEnvironmentFile();
    await this.loadEnvironmentStages();
  }

  /**
   * Loads the base environment file if it exists, otherwise handles the missing file.
   *
   * @param baseEnvFilePath - Path to the base environment file
   * @throws Error if file loading fails
   */
  private async loadBaseEnvironmentFile(): Promise<void> {
    try {
      // Check if the base environment file exists
      const baseEnvExists = await BaseEnvFileManager.doesBaseEnvFileExist();

      if (!baseEnvExists) {
        BaseEnvFileManager.handleMissingBaseEnvFile();
        return;
      }

      // Load the base environment file
      this.loadEnvironment(BaseEnvFileManager.BASE_ENV_FILE);
      const baseName = path.basename(BaseEnvFileManager.BASE_ENV_FILE);
      this.loadedFiles.push(baseName);

      logger.info(`Successfully loaded base environment file: ${baseName}`);
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "loadBaseEnvironmentFile",
        `Failed to load base environment file at ${BaseEnvFileManager.BASE_ENV_FILE}`,
      );
      throw error;
    }
  }

  /**
   * Loads environment-specific configuration
   */
  private async loadEnvironmentStages(): Promise<void> {
    const env = EnvironmentDetector.getCurrentEnvironmentStage();
    const stageEnvironmentFilePath = EnvironmentFilePaths[env];
    await this.loadStageEnvironmentFile(stageEnvironmentFilePath, env);
  }

  private getCurrentEnvironmentStage(): EnvironmentStage {
    return EnvironmentDetector.getCurrentEnvironmentStage();
  }

  private async loadStageEnvironmentFile(
    filePath: string,
    environmentStage: string,
  ): Promise<boolean> {
    try {
      const fileExists = await StageEnvFileManager.doesEnvironmentFileExist(filePath);

      if (!fileExists) {
        StageEnvFileManager.logEnvironmentFileNotFound(filePath, environmentStage);
        return false;
      }

      // Load the environment file
      const baseName = path.basename(filePath);
      this.loadEnvironment(filePath);
      this.loadedFiles.push(baseName);

      logger.info(`Successfully loaded environment file: ${baseName}`);
      return true;
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "loadStageEnvironmentFile",
        `Failed to load environment file '${filePath}' for ${environmentStage} environment`,
      );
      throw error;
    }
  }

  private loadEnvironment(filePath: string): void {
    try {
      const result = dotenv.config({ path: filePath, override: true });

      if (result.error) {
        throw new Error(
          `Error loading environment variables from ${filePath}: ${result.error.message}`,
        );
      }
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "loadEnvironmentFile",
        `Failed to load environment variables from ${filePath}`,
      );
      throw error;
    }
  }
}
