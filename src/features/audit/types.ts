/**
 * Audit Types — Pure Projection Layer
 *
 * camelCase — matches what the backend actually sends. The API's
 * CamelCasePlugin (createDbConnection) has been unconditionally active
 * since before this type existed; it was declared snake_case anyway, so
 * every field with an underscore (witnessed_at, occurred_at, actor_id,
 * etc.) read as undefined at runtime. Found verifying the audit trail
 * display path during Phase 2A — see the Phase 2 report.
 */
export interface AuditRecord {
  id: string;
  companyId: string;
  actorId: string | null;
  action: string;
  targetId: string | null;
  contextId: string | null;
  metadata: Record<string, string | number | boolean | null>;
  occurredAt: string;
  witnessedAt: string;
  signature: string;
}
