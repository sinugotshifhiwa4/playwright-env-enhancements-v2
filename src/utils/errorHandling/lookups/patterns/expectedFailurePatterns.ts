import { ErrorPatternGroup } from "../../../types/errorHandling/error-handler.types";
import ApiTestExpectation from "../../../../layers/api/validators/internal/apiTestExpectation";

/**
 * ExpectedFailurePatterns - Pattern matcher for negative test confirmations.
 *
 * This class provides strict pattern matching logic to help identify and categorize
 * expected failures in API, network, and validation layers during negative tests.
 */
export default class ExpectedFailurePatterns {
  private static readonly CORE_PATTERNS: ErrorPatternGroup = {
    category: "EXPECTED_FAILURE",
    context: "Negative Test Validation",
    patterns: [
      // Confirmations of intentional or expected failure
      /\bexpected\s+(?:failure|error|status)\b/i,
      /\bnegative\s+test\s+(?:passed|verified|completed)\b/i,
      /\bforced\s+(?:error|failure)\b/i,
      /\bsimulated\s+(?:error|failure|condition)\b/i,
      /\bdeliberate\s+(?:error|failure)\b/i,
      /\bintentional\s+(?:error|failure)\b/i,
      /\btest\s+failure\s+(?:achieved|reached|confirmed)\b/i,
      /\bexpected\s+(?:outcome|result)\s+occurred\b/i,
      /\bfailure\s+condition\s+met\b/i,

      // Dynamic patterns (lookaheads apply)
      ...this.getNetworkPatterns(),
      ...this.getHttpPatterns(),
      ...this.getApiPatterns(),
    ],
  };

  /**
   * Returns an ErrorPatternGroup customized for the given context.
   * Adds status code patterns only if the context is a registered negative test.
   */
  public static getPatternsForContext(contextKey?: string): ErrorPatternGroup {
    const patterns = [...this.CORE_PATTERNS.patterns];

    if (contextKey && ApiTestExpectation.isNegativeTest(contextKey)) {
      const expectation = ApiTestExpectation.getExpectation(contextKey);

      if (expectation?.expectedStatusCodes?.length) {
        patterns.push(
          new RegExp(`\\b(?:${expectation.expectedStatusCodes.join("|")})\\b`),
          /\bexpected\s+status\b/i,
        );
      }
    }

    return {
      ...this.CORE_PATTERNS,
      patterns,
    };
  }

  /**
   * Network-related failure patterns, only match when used in expected/negative context.
   */
  private static getNetworkPatterns(): RegExp[] {
    const lookahead = "(?=\\s+\\[expected\\]|\\s+in negative test)";
    return [
      /\bnetwork\s+(?:error|failure)\b/,
      /\bdns\s+(?:error|failure)\b/,
      /\bconnection\s+(?:refused|reset)\b/,
      /\bECONNREFUSED\b/,
      /\bECONNRESET\b/,
      /\bsocket\s+error\b/,
      /\btimeout\s+(?:exceeded|reached)\b/,
      /\bETIMEDOUT\b/,
      /\brequest\s+timeout\b/,
      /\bssl\s+(?:error|handshake)\b/,
      /\btls\s+(?:error|handshake)\b/,
      /\bcertificate\s+(?:error|invalid)\b/,
    ].map((re) => new RegExp(re.source + lookahead, "i"));
  }

  /**
   * HTTP-related failure patterns (client/server/status), limited to expected/negative markers.
   */
  private static getHttpPatterns(): RegExp[] {
    const lookahead = "(?=\\s+\\[expected\\]|\\s+as negative test)";
    return [
      /\b(?:400|401|403|404|405|406|407|408|409|410|411|412|413|414|415|416|417|418|422|423|424|425|426|428|429|431|451)\b/,
      /\bclient\s+error\b/,
      /\bbad\s+request\b/,
      /\bunauthorized\b/,
      /\bforbidden\b/,
      /\b(?:500|502|503|504)\b/,
      /\bserver\s+error\b/,
      /\binternal\s+server\s+error\b/,
      /\bservice\s+unavailable\b/,
      /\bbad\s+gateway\b/,
      /\b429\b/,
      /\brate\s+limit\b/,
      /\btoo\s+many\s+requests\b/,
    ].map((re) => new RegExp(re.source + lookahead, "i"));
  }

  /**
   * API-related or payload-specific failure patterns, scoped with expected/negative markers.
   */
  private static getApiPatterns(): RegExp[] {
    const lookahead = "(?=\\s+\\[expected\\]|\\s+for negative verification)";
    return [
      /\bapi\s+(?:error|failure)\b/,
      /\brest\s+(?:error|failure)\b/,
      /\bgraphql\s+(?:error|failure)\b/,
      /\bendpoint\s+(?:error|failure)\b/,
      /\bwebhook\s+(?:error|failure)\b/,
      /\bpayload\s+(?:error|invalid)\b/,
      /\bjson\s+(?:parse|syntax)\s+error\b/,
      /\bmalformed\s+(?:json|request)\b/,
      /\binvalid\s+(?:json|format)\b/,
    ].map((re) => new RegExp(re.source + lookahead, "i"));
  }
}
