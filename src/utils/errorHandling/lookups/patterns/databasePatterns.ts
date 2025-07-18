import { ErrorPatternGroup } from "../../../types/errorHandling/error-handler.types";

/**
 * DatabasePatterns - Database Error Pattern Repository
 *
 * Contains error patterns for database-related operations including
 * connections, queries, constraints, and transactions.
 */
export default class DatabasePatterns {
  public static readonly DATABASE: ErrorPatternGroup = {
    category: "CONNECTION",
    context: "Database Connection Error",
    patterns: [
      // Connection
      /\bdatabase\s+(?:connection|connect)\s+(?:failed|error|timeout|refused)\b/i,
      /\bconnection\s+(?:pool|timeout|exhausted|failed)\b/i,
      /\bdb\s+(?:connection|connect)\s+(?:failed|error|lost|dropped)\b/i,
      /\bsql\s+(?:connection|server)\s+(?:error|unavailable|timeout)\b/i,
      /\bmongodb\s+(?:connection|connect)\s+(?:failed|error|timeout)\b/i,
      /\bpostgres\s+(?:connection|connect)\s+(?:failed|error|timeout)\b/i,
      /\bmysql\s+(?:connection|connect)\s+(?:failed|error|timeout)\b/i,
      /\bECONNREFUSED.*(?:database|db|sql|mongo|postgres|mysql)\b/i,

      // Query
      /\bquery\s+(?:failed|error|timeout|syntax\s+error)\b/i,
      /\bsql\s+(?:syntax|error|exception|statement)\b/i,
      /\binvalid\s+(?:query|sql|statement)\b/i,
      /\bquery\s+(?:execution|runtime)\s+(?:error|failed)\b/i,
      /\bselect\s+(?:error|failed|timeout)\b/i,
      /\binsert\s+(?:error|failed|timeout)\b/i,
      /\bupdate\s+(?:error|failed|timeout)\b/i,
      /\bdelete\s+(?:error|failed|timeout)\b/i,
      /\btable\s+(?:not\s+found|doesn't\s+exist|missing)\b/i,
      /\bcolumn\s+(?:not\s+found|doesn't\s+exist|invalid)\b/i,

      // Constraint
      /\bconstraint\s+(?:violation|error|failed)\b/i,
      /\bforeign\s+key\s+(?:constraint|violation|error)\b/i,
      /\bprimary\s+key\s+(?:constraint|violation|duplicate)\b/i,
      /\bunique\s+(?:constraint|violation|key)\b/i,
      /\bcheck\s+constraint\s+(?:violation|failed)\b/i,
      /\bnot\s+null\s+(?:constraint|violation)\b/i,
      /\bduplicate\s+(?:key|entry|value)\b/i,
      /\bintegrity\s+constraint\s+(?:violation|error)\b/i,
      /\breferential\s+integrity\s+(?:violation|error)\b/i,

      // Transaction
      /\btransaction\s+(?:failed|error|timeout|rollback|aborted)\b/i,
      /\bcommit\s+(?:failed|error|timeout)\b/i,
      /\brollback\s+(?:failed|error|timeout)\b/i,
      /\bdeadlock\s+(?:detected|error|timeout)\b/i,
      /\block\s+(?:timeout|wait|acquisition)\s+(?:error|failed)\b/i,
      /\btransaction\s+(?:isolation|level)\s+(?:error|conflict)\b/i,
      /\bconcurrency\s+(?:error|conflict|violation)\b/i,
      /\boptimistic\s+lock\s+(?:error|exception|failed)\b/i,
      /\bpessimistic\s+lock\s+(?:error|timeout|failed)\b/i,

      // Schema
      /\bschema\s+(?:validation|error|mismatch|invalid)\b/i,
      /\bmigration\s+(?:failed|error|timeout)\b/i,
      /\bschema\s+(?:migration|update)\s+(?:failed|error)\b/i,
      /\bindex\s+(?:creation|error|invalid|missing)\b/i,
      /\btable\s+(?:creation|schema|structure)\s+(?:error|failed)\b/i,
      /\bdata\s+type\s+(?:mismatch|error|invalid)\b/i,
      /\bschema\s+(?:compatibility|version)\s+(?:error|mismatch)\b/i,

      // Performance
      /\bquery\s+(?:timeout|slow|performance)\b/i,
      /\bconnection\s+pool\s+(?:exhausted|full|timeout)\b/i,
      /\bmemory\s+(?:limit|exhausted|out\s+of\s+memory).*(?:database|db)\b/i,
      /\bdisk\s+(?:full|space|quota).*(?:database|db)\b/i,
      /\bmax\s+(?:connections|queries|statements)\s+(?:reached|exceeded)\b/i,
      /\bperformance\s+(?:degradation|issue|problem).*(?:database|db)\b/i,
    ],
  };
}
