import { ErrorCategories } from "../../types/errorHandling/error-categories.enum";
import { ErrorPatternGroup } from "../../types/errorHandling/error-handler.types";
import ApiNetworkPatterns from "./patterns/apiNetworkPatterns";
import DatabasePatterns from "./patterns/databasePatterns";
import EnvironmentPatterns from "./patterns/environmentPatterns";
import FileSystemPatterns from "./patterns/fileSystemPatterns";
import FrontendErrorPatterns from "./patterns/frontendErrorPatterns";
import ResourcePatterns from "./patterns/resourcesPatterns";
import SecurityAccessPatterns from "./patterns/securityAccessPatterns";
import RuntimeErrorPatterns from "./patterns/runtimeErrorPatterns";

// Pre-compiled system error mappings - fast O(1) lookups
export const SYSTEM_ERROR_MAP = new Map([
  // File system errors
  ["ENOENT", { category: ErrorCategories.FILE_SYSTEM, context: "File Not Found Error" }],
  ["EEXIST", { category: ErrorCategories.FILE_SYSTEM, context: "File Already Exists Error" }],
  ["EACCES", { category: ErrorCategories.FILE_SYSTEM, context: "File Access Denied Error" }],
  ["EFBIG", { category: ErrorCategories.FILE_SYSTEM, context: "File Too Large Error" }],
  ["EPERM", { category: ErrorCategories.FILE_SYSTEM, context: "Permission Denied Error" }],

  // Network errors
  [
    "ECONNREFUSED",
    { category: ErrorCategories.API_AND_NETWORK, context: "Connection Refused Error" },
  ],
  ["ECONNRESET", { category: ErrorCategories.API_AND_NETWORK, context: "Connection Reset Error" }],
  ["ETIMEDOUT", { category: ErrorCategories.API_AND_NETWORK, context: "Connection Timeout Error" }],
  [
    "EHOSTUNREACH",
    { category: ErrorCategories.API_AND_NETWORK, context: "Host Unreachable Error" },
  ],
  [
    "ENETUNREACH",
    { category: ErrorCategories.API_AND_NETWORK, context: "Network Unreachable Error" },
  ],
]);

// Runtime error type mappings - moderate frequency
export const RUNTIME_ERROR_MAP = new Map([
  ["TypeError", { category: ErrorCategories.RUNTIME, context: "Type Error" }],
  ["ReferenceError", { category: ErrorCategories.RUNTIME, context: "Reference Error" }],
  ["SyntaxError", { category: ErrorCategories.RUNTIME, context: "Syntax Error" }],
  ["RangeError", { category: ErrorCategories.RUNTIME, context: "Range Error" }],
]);

// HTTP status code mappings - moderate frequency
export const HTTP_STATUS_MAP = new Map<number, { category: ErrorCategories; context: string }>([
  [400, { category: ErrorCategories.SECURITY_AND_ACCESS, context: "Bad Request (400)" }],
  [401, { category: ErrorCategories.SECURITY_AND_ACCESS, context: "Authentication Error (401)" }],
  [403, { category: ErrorCategories.SECURITY_AND_ACCESS, context: "Authorization Error (403)" }],
  [404, { category: ErrorCategories.API_AND_NETWORK, context: "Not Found Error (404)" }],
  [408, { category: ErrorCategories.API_AND_NETWORK, context: "Timeout (408)" }],
  [409, { category: ErrorCategories.API_AND_NETWORK, context: "Conflict Error (409)" }],
  [422, { category: ErrorCategories.API_AND_NETWORK, context: "Unprocessable Entity (422)" }],
  [429, { category: ErrorCategories.API_AND_NETWORK, context: "Rate Limit Error (429)" }],
  [500, { category: ErrorCategories.API_AND_NETWORK, context: "Server Error (500)" }],
  [501, { category: ErrorCategories.API_AND_NETWORK, context: "Not Implemented (501)" }],
  [502, { category: ErrorCategories.API_AND_NETWORK, context: "Bad Gateway (502)" }],
  [503, { category: ErrorCategories.API_AND_NETWORK, context: "Service Unavailable (503)" }],
  [504, { category: ErrorCategories.API_AND_NETWORK, context: "Gateway Timeout (504)" }],
]);

// Optimized pattern groups ordered by frequency/priority
export const PRIORITIZED_PATTERN_GROUPS: ErrorPatternGroup[] = [
  EnvironmentPatterns.ENVIRONMENT_AND_DEPENDENCIES,
  SecurityAccessPatterns.SECURITY_AND_ACCESS,
  RuntimeErrorPatterns.RUNTIME,
  FrontendErrorPatterns.UI_AND_BROWSER,
  ApiNetworkPatterns.NETWORK,
  ResourcePatterns.RESOURCE,
  FileSystemPatterns.FILE_SYSTEM,
  DatabasePatterns.DATABASE,
];
