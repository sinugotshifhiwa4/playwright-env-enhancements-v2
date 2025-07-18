import { ErrorPatternGroup } from "../../../types/errorHandling/error-handler.types";

export default class FileSystemPatterns {
  public static readonly FILE_SYSTEM: ErrorPatternGroup = {
    category: "FILE_SYSTEM",
    context: "File System Error",
    patterns: [
      // FILE_NOT_FOUND
      /\bfile\s+(?:not\s+found|missing|does\s+not\s+exist)\b/i,
      /\bno\s+such\s+file\s+or\s+directory\b/i,
      /\bfile\s+path\s+(?:invalid|unresolved|not\s+found)\b/i,
      /\bENOENT\b/i,

      // FILE_EXISTS
      /\bfile\s+already\s+exists\b/i,
      /\bEEXIST\b/i,

      // ACCESS_DENIED
      /\bpermission\s+denied\b/i,
      /\baccess\s+denied\b/i,
      /\bunauthorized\s+access\b/i,
      /\bread-only\s+file\s+system\b/i,
      /\bEPERM\b/i,
      /\bEACCES\b/i,

      // FILE_TOO_LARGE
      /\bfile\s+too\s+large\b/i,
      /\bexceeds\s+(?:size|limit|quota)\b/i,
      /\bEMFILE\b/i,
      /\bno\s+space\s+left\s+on\s+device\b/i,

      // IO
      /\bio\s+error\b/i,
      /\binput\/output\s+(?:error|failure|issue)\b/i,
      /\bread\s+error\b/i,
      /\bwrite\s+error\b/i,
      /\bio\s+operation\s+(?:failed|timeout|interrupted)\b/i,
      /\bdevice\s+io\s+(?:error|failure|unavailable)\b/i,

      // SERIALIZATION_ERROR
      /\bserialization\s+(?:error|failed|invalid)\b/i,
      /\bunable\s+to\s+serialize\b/i,
      /\bobject\s+serialization\s+(?:error|failure|issue)\b/i,

      // ENCODING_ERROR
      /\bencoding\s+(?:error|failed|invalid|unsupported)\b/i,
      /\bcharacter\s+encoding\s+(?:issue|error|mismatch)\b/i,
      /\bunicode\s+(?:error|mismatch|unsupported)\b/i,
      /\btext\s+encoding\s+(?:failed|error|invalid)\b/i,

      // DECODING_ERROR
      /\bdecoding\s+(?:error|failed|invalid|unsupported)\b/i,
      /\bfailed\s+to\s+decode\b/i,
      /\bdecode\s+(?:operation|process)\s+(?:failed|error|interrupted)\b/i,
      /\bbase64\s+decode\s+(?:failed|error|invalid)\b/i,
      /\bjson\s+decode\s+(?:failed|error|invalid|unexpected\s+token)\b/i,
      /\bdeserialization\s+(?:error|failed|invalid)\b/i,
    ],
  };
}
