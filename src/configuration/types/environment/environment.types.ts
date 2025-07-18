// List of valid environment stages as a tuple of string literals
export const ENVIRONMENT_STAGES = ["dev", "qa", "uat", "preprod", "prod"] as const;

// Type alias representing any one of the environment stages
export type EnvironmentStage = (typeof ENVIRONMENT_STAGES)[number];

/**
 * Type guard to check if a given value is a valid EnvironmentStage
 * @param value - value to check
 * @returns true if value is one of the EnvironmentStage strings
 */
export function isEnvironmentStage(value: unknown): value is EnvironmentStage {
  return typeof value === "string" && ENVIRONMENT_STAGES.includes(value as EnvironmentStage);
}
