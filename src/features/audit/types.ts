/**
 * Audit Types — Pure Projection Layer
 */

export interface AuditRecord {
  id: string;
  company_id: string;
  actor_id: string | null;
  action: string;
  target_id: string | null;
  context_id: string | null;
  metadata: Record<string, string | number | boolean | null>;
  occurred_at: string;
  witnessed_at: string;
  signature: string;
}
