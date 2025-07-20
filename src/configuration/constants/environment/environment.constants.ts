import type { EnvironmentStage } from "../../types/environment/environment.types";
import { ENVIRONMENT_STAGES } from "../../types/environment/environment.types";
import FileManager from "../../../utils/fileManager/fileManager";

/**
 * Configuration object for environment-related paths and settings
 */
const ENV_CONFIG = {
  ROOT_DIRECTORY: "envs",
  BASE_ENV_FILE: ".env",
  SECRET_KEY_PREFIX: "SECRET_KEY",
} as const;

// Computed paths based on configuration
const ENV_DIRECTORY = FileManager.getRelativePath(ENV_CONFIG.ROOT_DIRECTORY);
export const BASE_ENV_FILE_PATH = FileManager.joinPath(ENV_DIRECTORY, ENV_CONFIG.BASE_ENV_FILE);

// ===== Immutable Mappings =====
/**
 * Immutable mapping from each environment stage to its corresponding env file path
 * Example: { dev: "/abs/path/envs/.env.dev", qa: "/abs/path/envs/.env.qa", ... }
 */
export const EnvironmentFilePaths: Record<EnvironmentStage, string> = Object.freeze(
  Object.fromEntries(
    ENVIRONMENT_STAGES.map((stage) => [stage, getEnvironmentFilePath(stage)]),
  ) as Record<EnvironmentStage, string>,
);

/**
 * Immutable mapping from each environment stage to its corresponding secret key variable name
 * Example: { dev: "SECRET_KEY_DEV", qa: "SECRET_KEY_QA", ... }
 */
export const SecretKeyVariables: Record<EnvironmentStage, string> = Object.freeze(
  Object.fromEntries(
    ENVIRONMENT_STAGES.map((stage) => [stage, getSecretKeyVariable(stage)]),
  ) as Record<EnvironmentStage, string>,
);

function getEnvironmentFilePath(stage: EnvironmentStage): string {
  return FileManager.joinPath(ENV_DIRECTORY, `${ENV_CONFIG.BASE_ENV_FILE}.${stage}`);
}

function getSecretKeyVariable(stage: EnvironmentStage): string {
  return `${ENV_CONFIG.SECRET_KEY_PREFIX}_${stage.toUpperCase()}`;
}
