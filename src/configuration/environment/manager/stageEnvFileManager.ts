import FileManager from "../../../utils/fileManager/fileManager";
import logger from "../../../utils/logger/loggerManager";

export class StageEnvFileManager {
  /**
   * Checks if an environment-specific file exists
   */
  public async doesEnvironmentFileExist(filePath: string): Promise<boolean> {
    return FileManager.doesFileExist(filePath);
  }

  /**
   * Logs appropriate message when environment file is not found
   */
  public logEnvironmentFileNotFound(
    fileName: string,
    filePath: string,
    environmentStage: string,
  ): void {
    logger.warn(
      `Environment '${environmentStage}' was specified but its configuration file could not be found at ${filePath}.`,
    );
  }
}
