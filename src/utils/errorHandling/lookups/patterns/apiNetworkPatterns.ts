import { ErrorPatternGroup } from "../../../types/errorHandling/error-handler.types";

/**
 * ApiNetworkPatterns - API and Network Error Pattern Repository
 *
 * Contains error patterns for network connections, HTTP status codes,
 * API failures, CORS issues, and network timeouts.
 */
export default class ApiNetworkPatterns {
  public static readonly NETWORK: ErrorPatternGroup = {
    category: "API_AND_NETWORK",
    context: "API and Network Error",
    patterns: [
      // Network
      /\bnetwork\s+(?:error|failure|timeout|unavailable)\b/i,
      /\bdns\s+(?:error|failure|resolution\s+failed|lookup\s+failed)\b/i,
      /\bhost\s+(?:unreachable|not\s+found|unavailable)\b/i,
      /\bconnection\s+(?:refused|reset|failed|timeout|lost)\b/i,
      /\bnetwork\s+(?:connectivity|connection)\s+(?:lost|error)\b/i,
      /\bECONNREFUSED\b/,
      /\bECONNRESET\b/,
      /\bcannot\s+connect\s+to\s+(?:server|host|api)\b/i,
      /\bsocket\s+(?:error|timeout|connection\s+failed)\b/i,
      /\bpeer\s+(?:reset|closed)\s+connection\b/i,

      // Http
      /\b(?:400|401|403|404|405|406|407|408|409|410|411|412|413|414|415|416|417|418|422|423|424|425|426|428|429|431|451)\b/,
      /\bclient\s+error\b/i,
      /\bbad\s+request\b/i,
      /\bunauthorized\b/i,
      /\bforbidden\b/i,
      /\bnot\s+found\b/i,
      /\bmethod\s+not\s+allowed\b/i,
      /\bconflict\b/i,
      /\btoo\s+many\s+requests\b/i,
      /\brequest\s+(?:timeout|entity\s+too\s+large|uri\s+too\s+long)\b/i,
      /\bunsupported\s+media\s+type\b/i,
      /\bunprocessable\s+entity\b/i,

      // Http server
      /\b(?:500|501|502|503|504|505|506|507|508|510|511)\b/,
      /\bserver\s+error\b/i,
      /\binternal\s+server\s+error\b/i,
      /\bservice\s+unavailable\b/i,
      /\bgateway\s+(?:timeout|error)\b/i,
      /\bbad\s+gateway\b/i,
      /\bnot\s+implemented\b/i,
      /\bhttp\s+version\s+not\s+supported\b/i,
      /\binsufficient\s+storage\b/i,
      /\bloop\s+detected\b/i,
      /\bnetwork\s+authentication\s+required\b/i,

      //   Timeouts
      /\btimeout\s+(?:exceeded|error|reached)\b/i,
      /\btimed\s+out\b/i,
      /\brequest\s+timeout\b/i,
      /\bconnection\s+timeout\b/i,
      /\bread\s+timeout\b/i,
      /\bwrite\s+timeout\b/i,
      /\bapi\s+(?:timeout|call\s+timeout)\b/i,
      /\bresponse\s+timeout\b/i,
      /\boperation\s+(?:timed\s+out|timeout)\b/i,
      /\b\d+ms\s+timeout\b/i,
      /\bETIMEDOUT\b/,

      // Rate Limit
      /\brate\s+limit\s+(?:exceeded|reached|hit)\b/i,
      /\btoo\s+many\s+(?:requests|calls|attempts)\b/i,
      /\bthrottled\b/i,
      /\bquota\s+(?:exceeded|reached|limit)\b/i,
      /\bapi\s+(?:rate\s+limit|quota)\s+(?:exceeded|reached)\b/i,
      /\brequest\s+(?:rate|frequency)\s+(?:limit|exceeded)\b/i,
      /\b429\s+(?:too\s+many\s+requests|rate\s+limit)\b/i,
      /\bbackoff\s+(?:required|needed|period)\b/i,
      /\bretry\s+(?:after|limit|quota)\b/i,

      // Cors
      /\bcors\s+(?:error|policy|violation)\b/i,
      /\bcross-origin\s+(?:request|error|blocked)\b/i,
      /\baccess-control-allow-origin\b/i,
      /\bcors\s+(?:preflight|header)\s+(?:failed|error)\b/i,
      /\borigin\s+(?:not\s+allowed|blocked|rejected)\b/i,
      /\bblocked\s+by\s+cors\s+policy\b/i,
      /\bmissing\s+(?:access-control|cors)\s+(?:header|policy)\b/i,
      /\bpreflight\s+request\s+(?:failed|error|blocked)\b/i,

      // SSL and TLC
      /\bssl\s+(?:error|certificate|handshake)\s+(?:failed|error)\b/i,
      /\btls\s+(?:error|handshake|certificate)\s+(?:failed|error)\b/i,
      /\bcertificate\s+(?:error|invalid|expired|self-signed)\b/i,
      /\bssl\s+(?:verification|validation)\s+(?:failed|error)\b/i,
      /\bhandshake\s+(?:failure|error|timeout)\b/i,
      /\bssl\s+(?:version|protocol)\s+(?:error|not\s+supported)\b/i,
      /\bcertificate\s+(?:authority|chain)\s+(?:error|invalid)\b/i,
      /\bssl\s+(?:connection|secure\s+connection)\s+(?:failed|error)\b/i,

      // Api
      /\bapi\s+(?:error|failed|timeout|unavailable)\b/i,
      /\brest\s+(?:api|error|failed|timeout)\b/i,
      /\bgraphql\s+(?:error|failed|timeout)\b/i,
      /\bapi\s+(?:call|request|response)\s+(?:failed|error|timeout)\b/i,
      /\bapi\s+(?:endpoint|service)\s+(?:not\s+found|unavailable|error)\b/i,
      /\bapi\s+(?:key|token|authentication)\s+(?:invalid|expired|missing)\b/i,
      /\bapi\s+(?:version|compatibility)\s+(?:error|mismatch)\b/i,
      /\bapi\s+(?:quota|limit|throttle)\s+(?:exceeded|reached)\b/i,
      /\bwebhook\s+(?:error|failed|timeout|delivery\s+failed)\b/i,

      // Payload
      /\bpayload\s+(?:too\s+large|size\s+exceeded|invalid)\b/i,
      /\brequest\s+(?:body|payload)\s+(?:too\s+large|malformed|invalid)\b/i,
      /\bjson\s+(?:parse|parsing|syntax)\s+error\b/i,
      /\bxml\s+(?:parse|parsing|syntax)\s+error\b/i,
      /\bmalformed\s+(?:json|xml|data|request)\b/i,
      /\binvalid\s+(?:json|xml|data|format)\b/i,
      /\bcontent\s+type\s+(?:mismatch|not\s+supported|invalid)\b/i,
      /\bencoding\s+(?:error|not\s+supported|invalid)\b/i,

      // Intercept
      /\bpage\.route\s+(?:failed|error|timeout)\b/i,
      /\brequest\s+interception\s+(?:failed|error|blocked)\b/i,
      /\bmock\s+response\s+(?:failed|error|invalid)\b/i,
      /\bnetwork\s+(?:mock|stub)\s+(?:failed|error)\b/i,
      /\broute\s+(?:handler|interceptor)\s+(?:failed|error)\b/i,
      /\bproxy\s+(?:error|failed|timeout|connection\s+failed)\b/i,
      /\binterceptor\s+(?:failed|error|timeout)\b/i,
      /\bmiddleware\s+(?:error|failed|timeout)\b/i,
    ],
  };
}
