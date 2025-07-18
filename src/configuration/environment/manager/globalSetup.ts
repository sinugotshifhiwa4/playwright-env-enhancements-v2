import { BaseEnvFileManager } from "./baseEnvFileManager";
import { StageEnvFileManager } from "./stageEnvFileManager";
import { EnvironmentSetup } from "../manager/environmentSetup";
import ErrorHandler from "../../../utils/errorHandling/errorHandler";

async function initializeEnvironment(): Promise<void> {
  try {
    // Initialize the environment setup manager
    const baseEnvFileManager = new BaseEnvFileManager();
    const stageEnvFileManager = new StageEnvFileManager();
    const environmentSetup = new EnvironmentSetup(baseEnvFileManager, stageEnvFileManager);
    await environmentSetup.initialize();
  } catch (error) {
    ErrorHandler.captureError(error, "initializeEnvironment", "Environment initialization failed");
    throw error;
  }
}

async function globalSetup(): Promise<void> {
  try {
    await initializeEnvironment();
  } catch (error) {
    ErrorHandler.captureError(error, "globalSetup", "Global setup failed");
    throw error;
  }
}

export default globalSetup;
