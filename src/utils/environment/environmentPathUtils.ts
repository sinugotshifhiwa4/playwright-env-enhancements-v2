import { ENVIRONMENT_FILE_CONFIG } from "../../configuration/environment/dotenv/environment.constants";
import PathUtils from "../fileManager/pathUtils";
import type { EnvironmentStage } from "../../configuration/environment/dotenv/environment.types";

export default class EnvironmentPathUtils {
  private static readonly ENV_DIRECTORY: string = PathUtils.resolvePath(
    ENVIRONMENT_FILE_CONFIG.ROOT_DIRECTORY,
  );
  /**
   * Creates an immutable mapping between keys and values, using the given value mapper to map each key to its value.
   * The returned object is frozen and has the same type as the keys (K) and values (V), and is effectively a const enum.
   * @param keys - The keys in the mapping
   * @param valueMapper - A function that takes a key and returns its value
   * @returns An immutable mapping between the keys and values
   */
  public static createImmutableMapping<K extends string | number | symbol, V>(
    keys: readonly K[],
    valueMapper: (key: K) => V,
  ): Readonly<Record<K, V>> {
    return Object.freeze(
      Object.fromEntries(keys.map((key) => [key, valueMapper(key)])) as Record<K, V>,
    );
  }

  public static getEnvironmentFilePath(stage: EnvironmentStage): string {
    return PathUtils.joinPath(
      EnvironmentPathUtils.ENV_DIRECTORY,
      `${ENVIRONMENT_FILE_CONFIG.BASE_ENV_FILE}.${stage}`,
    );
  }

  public static getSecretKeyVariable(stage: EnvironmentStage): string {
    return `${ENVIRONMENT_FILE_CONFIG.SECRET_KEY_PREFIX}_${stage.toUpperCase()}`;
  }

  /**
   * Returns the base .env file path (e.g., envs/.env).
   */
  public static getBaseEnvFilePath(): string {
    return PathUtils.joinPath(
      EnvironmentPathUtils.ENV_DIRECTORY,
      ENVIRONMENT_FILE_CONFIG.BASE_ENV_FILE,
    );
  }
}
