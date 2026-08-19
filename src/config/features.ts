/**
 * Feature flags for beta v1.0.
 * false = gated behind ComingSoon. Do not enable without a matching backend endpoint.
 */
export const FEATURES = {
  securityAuditLog: false,      // needs GET /audit/security-violations in API
  generalProfileSettings: false, // settings save not wired to any endpoint
  capacitySettingsPanel: false,  // shows hardcoded values; real config endpoint not built
} as const;

export type FeatureKey = keyof typeof FEATURES;
