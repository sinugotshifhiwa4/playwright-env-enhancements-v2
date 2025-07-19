import { EncryptionManager } from "../manager/encryptionManager";
import BaseEnvFileManager from "../../configuration/environment/manager/baseEnvFileManager";
import SecureKeyGenerator from "../../../src/cryptography/key/secureKeyGenerator";
import ErrorHandler from "../../utils/errorHandling/errorHandler";

export class CryptoOrchestrator {
  private encryptionManager: EncryptionManager;

  constructor(encryptionManager: EncryptionManager) {
    this.encryptionManager = encryptionManager;
  }

  public async generateSecretKey(): Promise<void> {
    try {
      // Generate a new secret key
      const generatedSecretKey = SecureKeyGenerator.generateBase64SecretKey();

      // Store the secret key in the base environment file
      await BaseEnvFileManager.storeBaseEnvironmentKey(
        this.encryptionManager.getCurrentEnvironmentSecretKeyVariable(),
        generatedSecretKey,
      );
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "generateSecretKey",
        `Failed to generate secret key "${this.encryptionManager.getCurrentEnvironmentSecretKeyVariable()}"`,
      );
      throw error;
    }
  }

  public async encryptEnvironmentVariables(envVariables?: string[]): Promise<void> {
    await this.encryptionManager.encryptEnvironmentVariables(envVariables);
  }
}
