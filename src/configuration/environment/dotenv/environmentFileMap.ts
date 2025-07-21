import { ENVIRONMENT_STAGES } from "./environment.types";
import EnvironmentPathUtils from "../../../utils/environment/environmentPathUtils";

export const EnvironmentFilePaths = EnvironmentPathUtils.createImmutableMapping(
  ENVIRONMENT_STAGES,
  EnvironmentPathUtils.getEnvironmentFilePath,
);

export const SecretKeyVariables = EnvironmentPathUtils.createImmutableMapping(
  ENVIRONMENT_STAGES,
  EnvironmentPathUtils.getSecretKeyVariable,
);
