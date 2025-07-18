import type { EnvironmentStage } from "./environment.types";
import { ENVIRONMENT_STAGES } from "./environment.types";
import path from "path";

// Constants for environment config directory and base env filename
const ROOT_DIRECTORY = "envs";
const ENV_DIRECTORY = path.resolve(process.cwd(), ROOT_DIRECTORY);
export const BASE_ENV_FILE = ".env";

// Base environment file path (absolute)
export const BaseEnvironmentFilePath = path.join(ENV_DIRECTORY, BASE_ENV_FILE);

/**
 * Immutable mapping from each environment stage to its corresponding env file path
 * Example: { dev: "/abs/path/envs/.env.dev", qa: "/abs/path/envs/.env.qa", ... }
 */
export const EnvironmentFilePaths: Record<EnvironmentStage, string> = Object.freeze(
  Object.fromEntries(
    ENVIRONMENT_STAGES.map((stage) => [
      stage,
      path.join(ENV_DIRECTORY, `${BASE_ENV_FILE}.${stage}`),
    ]),
  ) as Record<EnvironmentStage, string>,
);

/**
 * Immutable mapping from each environment stage to its corresponding secret key variable name
 * Example: { dev: "SECRET_KEY_DEV", qa: "SECRET_KEY_QA", ... }
 */
export const SecretKeyVariables: Record<EnvironmentStage, string> = {
  dev: "SECRET_KEY_DEV",
  qa: "SECRET_KEY_QA",
  uat: "SECRET_KEY_UAT",
  preprod: "SECRET_KEY_PREPROD",
  prod: "SECRET_KEY_PROD",
} as const;
