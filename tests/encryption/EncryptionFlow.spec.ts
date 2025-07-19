import { test, expect } from "../../fixtures/cryptography.fixture";
import EnvironmentVariables from "../../src/configuration/environment/variables/environmentVariables";

test.describe.serial("Encryption Flow @full-encryption", () => {
  test("Generate secret key", async ({ cryptoOrchestrator }) => {
    await cryptoOrchestrator.generateSecretKey();
  });

  test("Encrypt environment variables", async ({ cryptoOrchestrator, encryptionValidator }) => {
    await cryptoOrchestrator.encryptEnvironmentVariables([
      EnvironmentVariables.PORTAL_USERNAME!,
      EnvironmentVariables.PORTAL_PASSWORD!,
    ]);

    // Verify encryption
    const results = await encryptionValidator.validateEncryption([
      "PORTAL_USERNAME",
      "PORTAL_PASSWORD",
    ]);
    expect(results.PORTAL_USERNAME).toBe(true);
    expect(results.PORTAL_PASSWORD).toBe(true);
  });
});
