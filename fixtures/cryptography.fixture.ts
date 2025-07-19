import { test as baseTest } from "@playwright/test";
import { CryptoService } from "../src/cryptography/service/cryptoService";
import { EncryptionManager } from "../src/cryptography/manager/encryptionManager";
import { CryptoOrchestrator } from "../src/cryptography/service/cryptoOrchestrator";
import { EncryptionValidator } from "../src/cryptography/manager/encryptionValidator";

type CryptographyFixtures = {
  cryptoService: CryptoService;
  encryptionManager: EncryptionManager;
  cryptoOrchestrator: CryptoOrchestrator;
  encryptionValidator: EncryptionValidator;
};

export const test = baseTest.extend<CryptographyFixtures>({
  cryptoService: async ({}, use) => {
    await use(new CryptoService());
  },
  encryptionManager: async ({}, use) => {
    await use(new EncryptionManager());
  },
  cryptoOrchestrator: async ({ encryptionManager }, use) => {
    await use(new CryptoOrchestrator(encryptionManager));
  },
  encryptionValidator: async ({ encryptionManager }, use) => {
    await use(new EncryptionValidator(encryptionManager));
  },
});

export const expect = baseTest.expect;
