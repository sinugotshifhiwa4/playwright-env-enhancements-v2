import { ErrorPatternGroup } from "../../../types/errorHandling/error-handler.types";

export default class EnvironmentPatterns {
  public static readonly ENVIRONMENT_AND_DEPENDENCIES: ErrorPatternGroup = {
    category: "ENVIRONMENT_AND_DEPENDENCIES",
    context: "Environment and Dependency Error",
    patterns: [
      // ENVIRONMENT
      /\benvironment\s+(?:not\s+set|missing|invalid|error|failed)\b/i,
      /\benvironment\s+file\s+(?:not\s+found|missing|invalid|error|failed)\b/i,
      /\benv\s+file\s+(?:not\s+found|missing|invalid|error|failed)\b/i,
      /\b\.env\s+(?:not\s+found|missing|invalid|error|failed)\b/i,
      /\bfailed\s+to\s+(?:read|load|find)\s+environment\s+file\b/i,
      /\bfailed\s+to\s+(?:encrypt|decrypt)\s+environment\s+variables?\b/i,
      /\bruntime\s+environment\s+(?:error|invalid|unsupported)\b/i,
      /\bnode\s+environment\s+(?:mismatch|not\s+found|unsupported)\b/i,
      /\benvironment\s+variable[s]?\s+(?:missing|not\s+found|undefined|invalid)\b/i,
      /\bprocess\.env\.\w+\s+(?:undefined|not\s+set|error)\b/i,
      /\benvironment\s+(?:mismatch|conflict|incompatible)\b/i,
      /\btest\s+environment\s+(?:failed|setup\s+error|not\s+initialized)\b/i,

      // ENCRYPTION / DECRYPTION FORMAT
      /\bencrypted\s+format\s+(?:invalid|missing|error|failed)\b/i,
      /\bmissing\s+prefix\b/i,
      /binvalid\s+encrypted\s+format\b/i,
      /bfailed\s+to\s+(?:encrypt|decrypt)(?:\s+\w+)?\b/i,
      /bauthentication\s+failed\s*:\s*hmac\s+mismatch\b/i,
      /bhmac\s+(?:error|invalid|mismatch|failed)\b/i,

      // CONFIGURATION
      /\bconfiguration\s+(?:missing|invalid|error|failed)\b/i,
      /\bconfig\s+file\s+(?:not\s+found|missing|invalid|corrupted)\b/i,
      /\bfailed\s+to\s+(?:read|load|find)\s+config\s+file\b/i, // NEW: Covers "Failed to read config file"
      /\bconfiguration\s+value\s+(?:missing|incorrect|unexpected|undefined)\b/i,
      /\bconfiguration\s+setting\s+(?:error|mismatch|not\s+set)\b/i,
      /\bload\s+configuration\s+(?:failed|error|timeout)\b/i,
      /\bapplication\s+config\s+(?:invalid|missing|corrupt|error)\b/i,
      /\bproperty\s+file\s+(?:missing|invalid|error|failed)\b/i,

      // DEPENDENCY
      /\bdependency\s+(?:error|missing|not\s+found|unresolved)\b/i,
      /\bmodule\s+(?:not\s+found|cannot\s+find|missing|error)\b/i,
      /\bpackage\s+(?:missing|invalid|not\s+installed|error)\b/i,
      /\bnode\s+module[s]?\s+(?:missing|not\s+found|incompatible)\b/i,
      /\bfailed\s+to\s+(?:resolve|load|install)\s+dependency\b/i,
      /\bdependency\s+(?:version|conflict|mismatch|incompatible)\b/i,
      /\bpackage\.json\s+(?:dependency|script)\s+(?:error|invalid|missing)\b/i,
      /\bnpm\s+(?:install|run|script)\s+(?:failed|error|crash)\b/i,
      /\byarn\s+(?:install|run)\s+(?:failed|error|missing)\b/i,
      /\bmissing\s+(?:peer|required|optional)\s+dependency\b/i,
    ],
  };
}
