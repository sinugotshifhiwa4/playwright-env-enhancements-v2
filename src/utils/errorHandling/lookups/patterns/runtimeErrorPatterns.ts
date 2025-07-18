import { ErrorPatternGroup } from "../../../types/errorHandling/error-handler.types";

export default class RuntimeErrorPatterns {
  public static readonly RUNTIME: ErrorPatternGroup = {
    category: "RUNTIME",
    context: "Runtime Execution Error",
    patterns: [
      // Type Errors
      /\btypeof\s+.+?\s+is\s+not\s+function\b/i,
      /\bcannot\s+read\s+(?:properties?|method)\s+.+?\s+of\s+(?:undefined|null)\b/i,
      /\bundefined\s+is\s+not\s+a\s+function\b/i,
      /\b.+?\s+is\s+not\s+a\s+function\b/i,
      /\binvalid\s+.+?\s+type\b/i,
      /\bexpected\s+.+?\s+to\s+be\s+.+?\b/i,

      // Reference Errors
      /\b.+?\s+is\s+not\s+defined\b/i,
      /\bcannot\s+access\s+.+?\s+before\s+initialization\b/i,
      /\bundefined\s+variable\b/i,
      /\bunresolved\s+reference\b/i,
      /\bcircular\s+reference\b/i,

      // Syntax Errors
      /\bunexpected\s+(?:token|identifier)\b/i,
      /\bmissing\s+(?:paren|brace|bracket)\s+after\s+.+?\b/i,
      /\binvalid\s+(?:or\s+unexpected)?\s+token\b/i,
      /\bexpression\s+expected\b/i,
      /\bunexpected\s+end\s+of\s+(?:input|file)\b/i,
      /\bmissing\s+(?:semicolon|colon|comma)\b/i,

      // Range Errors
      /\bmaximum\s+call\s+stack\s+size\s+exceeded\b/i,
      /\binvalid\s+array\s+length\b/i,
      /\bvalue\s+out\s+of\s+range\b/i,
      /\bbuffer\s+size\s+exceeded\b/i,

      // Promise/Async Errors
      /\bunhandled\s+promise\s+rejection\b/i,
      /\bpromise\s+rejection\s+while\s+processing\b/i,
      /\bawait\s+is\s+only\s+valid\b/i,
      /\basync\s+function\s+error\b/i,

      // Execution Errors
      /\btimeout\s+exceeded\b/i,
      /\bscript\s+execution\s+interrupted\b/i,
      /\bexecution\s+context\s+not\s+available\b/i,
      /\btoo\s+much\s+recursion\b/i,

      // Memory Errors
      /\bout\s+of\s+memory\b/i,
      /\bheap\s+out\s+of\s+memory\b/i,
      /\bmemory\s+allocation\s+failed\b/i,

      // Module Errors
      /\bcannot\s+find\s+module\b/i,
      /\bmodule\s+not\s+found\b/i,
      /\bimport\s+not\s+resolved\b/i,
      /\bexport\s+.+?\s+not\s+found\b/i,
      /\bcircular\s+dependency\b/i,

      // JSON Errors
      /\binvalid\s+json\b/i,
      /\bunexpected\s+token\s+in\s+json\b/i,
      /\bjson\s+parse\s+error\b/i,
      /\bjson\s+stringify\s+error\b/i,

      // Iterator Errors
      /\biterator\s+result\s+is\s+not\s+an\s+object\b/i,
      /\biterator\s+.+?\s+not\s+implemented\b/i,
      /\biterable\s+expected\b/i,

      // Strict Mode Errors
      /\bassignment\s+to\s+(?:undeclared|immutable)\s+variable\b/i,
      /\bdelete\s+of\s+an\s+unqualified\s+identifier\b/i,
      /\bduplicate\s+parameter\b/i,
    ],
  };
}
