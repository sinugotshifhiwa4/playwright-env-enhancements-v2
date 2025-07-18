import { ErrorPatternGroup } from "../../../types/errorHandling/error-handler.types";

export default class SecurityAccessPatterns {
  static readonly SECURITY_AND_ACCESS: ErrorPatternGroup = {
    category: "SECURITY_AND_ACCESS",
    context: "Security and Access Error",
    patterns: [
      // Authentication
      /\bauthentication\s+(?:failed|error|required|invalid)\b/i,
      /\blogin\s+(?:failed|error|required|invalid)\b/i,
      /\binvalid\s+(?:credentials|username|password)\b/i,
      /\bauth\s+(?:token|session)\s+(?:invalid|expired|missing)\b/i,
      /\b(?:signin|sign-in)\s+(?:failed|error|required)\b/i,
      /\buser\s+(?:credentials|authentication)\s+(?:invalid|failed|error)\b/i,
      /\bpassword\s+(?:incorrect|invalid|mismatch|expired)\b/i,
      /\busername\s+(?:not\s+found|invalid|unknown)\b/i,
      /\bauth\s+(?:challenge|verification)\s+(?:failed|error)\b/i,
      /\b2fa\s+(?:required|failed|invalid|timeout)\b/i,
      /\bmfa\s+(?:required|failed|invalid|timeout)\b/i,

      // Authorization
      /\bauthorization\s+(?:failed|error|required|denied)\b/i,
      /\baccess\s+(?:denied|forbidden|restricted)\b/i,
      /\bpermission\s+(?:denied|required|insufficient)\b/i,
      /\bunauthorized\s+(?:access|operation|request)\b/i,
      /\bprivileges?\s+(?:insufficient|required|missing)\b/i,
      /\brole\s+(?:required|insufficient|missing|invalid)\b/i,
      /\bscope\s+(?:required|insufficient|missing|invalid)\b/i,
      /\baccess\s+(?:rights|level)\s+(?:insufficient|required)\b/i,
      /\buser\s+(?:role|permissions)\s+(?:insufficient|invalid)\b/i,
      /\bresource\s+(?:access|permission)\s+(?:denied|restricted)\b/i,

      // Token Expiration
      /\btoken\s+(?:expired|invalid|missing|malformed)\b/i,
      /\bjwt\s+(?:expired|invalid|malformed|signature\s+verification\s+failed)\b/i,
      /\baccess\s+token\s+(?:expired|invalid|revoked)\b/i,
      /\brefresh\s+token\s+(?:expired|invalid|missing)\b/i,
      /\bbearer\s+token\s+(?:invalid|expired|missing)\b/i,
      /\bapi\s+(?:key|token)\s+(?:expired|invalid|revoked)\b/i,
      /\bauth\s+token\s+(?:expired|invalid|missing|malformed)\b/i,
      /\btoken\s+(?:validation|verification)\s+(?:failed|error)\b/i,
      /\btoken\s+(?:signature|payload)\s+(?:invalid|corrupted)\b/i,
      /\btoken\s+(?:not\s+before|issued\s+at)\s+(?:invalid|error)\b/i,

      // Session
      /\bsession\s+(?:expired|invalid|not\s+found|timeout|destroyed)\b/i,
      /\bsession\s+(?:failed|error|corrupted)\b/i,
      /\bsession\s+(?:storage|management)\s+(?:error|failed)\b/i,
      /\buser\s+session\s+(?:terminated|invalid|expired)\b/i,
      /\bsession\s+(?:restore|recovery)\s+(?:failed|error)\b/i,
      /\bsession\s+(?:timeout|idle\s+timeout|max\s+age)\s+(?:reached|exceeded)\b/i,
      /\bsession\s+(?:cookie|identifier)\s+(?:invalid|missing|expired)\b/i,
      /\bsession\s+(?:hijacking|fixation)\s+(?:detected|prevented)\b/i,
      /\bsession\s+(?:state|data)\s+(?:corrupted|invalid|lost)\b/i,

      // Cookie
      /\bcookie\s+(?:failed|error|invalid|expired|blocked)\b/i,
      /\bset\s+cookie\s+(?:failed|error|rejected)\b/i,
      /\bcookie\s+(?:not\s+found|missing|unavailable)\b/i,
      /\bcookie\s+(?:security|samesite|httponly)\s+(?:error|violation)\b/i,
      /\bcookie\s+(?:domain|path)\s+(?:mismatch|error)\b/i,
      /\bauth\s+cookie\s+(?:invalid|expired|missing|tampered)\b/i,
      /\bcookie\s+(?:consent|policy)\s+(?:required|blocked)\b/i,
      /\bcookie\s+(?:size|limit)\s+(?:exceeded|error)\b/i,
      /\bthird\s+party\s+cookies?\s+(?:blocked|disabled)\b/i,

      // OAuth
      /\boauth\s+(?:error|failed|invalid|expired)\b/i,
      /\boauth\s+(?:token|access\s+token|refresh\s+token)\s+(?:invalid|expired|revoked)\b/i,
      /\boauth\s+(?:authorization|authentication)\s+(?:failed|error|denied)\b/i,
      /\boauth\s+(?:callback|redirect)\s+(?:error|failed|mismatch)\b/i,
      /\boauth\s+(?:scope|permission)\s+(?:insufficient|denied|invalid)\b/i,
      /\boauth\s+(?:client|app)\s+(?:unauthorized|invalid|suspended)\b/i,
      /\boauth\s+(?:state|nonce)\s+(?:mismatch|invalid|missing)\b/i,
      /\boauth\s+(?:provider|server)\s+(?:error|unavailable|timeout)\b/i,
      /\boauth\s+(?:grant|flow)\s+(?:invalid|unsupported|failed)\b/i,

      // SAML
      /\bsaml\s+(?:error|failed|invalid|assertion)\b/i,
      /\bsaml\s+(?:response|assertion)\s+(?:invalid|expired|malformed)\b/i,
      /\bsaml\s+(?:signature|certificate)\s+(?:invalid|verification\s+failed)\b/i,
      /\bsaml\s+(?:authentication|authorization)\s+(?:failed|error|denied)\b/i,
      /\bsaml\s+(?:metadata|configuration)\s+(?:invalid|error|missing)\b/i,
      /\bsaml\s+(?:binding|protocol)\s+(?:error|not\s+supported)\b/i,
      /\bsaml\s+(?:idp|sp)\s+(?:error|configuration|mismatch)\b/i,
      /\bsaml\s+(?:logout|slo)\s+(?:failed|error|timeout)\b/i,

      // BRBAC
      /\brbac\s+(?:error|violation|denied|failed)\b/i,
      /\brole\s+(?:assignment|membership)\s+(?:error|invalid|denied)\b/i,
      /\buser\s+(?:role|group)\s+(?:invalid|insufficient|not\s+assigned)\b/i,
      /\bpermission\s+(?:matrix|hierarchy)\s+(?:error|violation)\b/i,
      /\baccess\s+control\s+(?:list|policy)\s+(?:violation|error)\b/i,
      /\brole\s+(?:inheritance|delegation)\s+(?:error|failed)\b/i,
      /\bprincipal\s+(?:identity|role)\s+(?:invalid|not\s+found)\b/i,
      /\bsubject\s+(?:authorization|permission)\s+(?:denied|failed)\b/i,

      // CAPTCHA
      /\bcaptcha\s+(?:failed|error|invalid|expired|required)\b/i,
      /\brecaptcha\s+(?:failed|error|invalid|expired|verification\s+failed)\b/i,
      /\bhuman\s+verification\s+(?:failed|required|error)\b/i,
      /\bbot\s+(?:detection|prevention)\s+(?:triggered|failed)\b/i,
      /\bcaptcha\s+(?:challenge|response)\s+(?:invalid|incorrect|missing)\b/i,
      /\bspam\s+(?:protection|filter)\s+(?:triggered|failed)\b/i,
      /\brate\s+limiting\s+(?:captcha|challenge)\s+(?:required|failed)\b/i,

      // Biometric
      /\bbiometric\s+(?:authentication|verification)\s+(?:failed|error|not\s+available)\b/i,
      /\bfingerprint\s+(?:recognition|scan)\s+(?:failed|error|not\s+recognized)\b/i,
      /\bface\s+(?:recognition|id)\s+(?:failed|error|not\s+recognized)\b/i,
      /\bvoice\s+(?:recognition|authentication)\s+(?:failed|error|not\s+recognized)\b/i,
      /\biris\s+(?:scan|recognition)\s+(?:failed|error|not\s+available)\b/i,
      /\bbiometric\s+(?:sensor|device)\s+(?:not\s+available|error|failed)\b/i,
      /\bbiometric\s+(?:data|template)\s+(?:corrupted|invalid|missing)\b/i,
      /\bbiometric\s+(?:enrollment|registration)\s+(?:failed|error|required)\b/i,

      // Sanitization
      /\bsanitization\s+(?:failed|error|missing|skipped)\b/i,
      /\binput\s+(?:not\s+sanitized|unescaped|unsafe)\b/i,
      /\boutput\s+(?:not\s+encoded|unescaped|unsafe)\b/i,
      /\bhtml\s+(?:injection|escape)\s+(?:failed|missing)\b/i,
      /\bscript\s+(?:injection|escaping)\s+(?:failed|error|missing)\b/i,
      /\buser\s+input\s+(?:not\s+validated|unsafe|unsanitized)\b/i,
      /\bunsanitized\s+(?:data|input|value)\b/i,
      /\bsql\s+injection\s+(?:risk|attempt|vulnerability)\b/i,
      /\bxss\s+(?:risk|detected|attempt)\b/i,
    ],
  };
}
