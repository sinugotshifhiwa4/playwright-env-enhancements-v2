import { EnvironmentSetup } from "../manager/environmentSetup";
import ErrorHandler from "../../../utils/errorHandling/errorHandler";

async function initializeEnvironment(): Promise<void> {
  try {
    // Initialize the environment setup
    const environmentSetup = new EnvironmentSetup();
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
