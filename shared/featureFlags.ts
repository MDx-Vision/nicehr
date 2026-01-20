// =============================================================================
// Feature Flags
// =============================================================================
// Control feature rollout with environment variables
// Set ENABLE_<FEATURE>=true in .env to enable

export const FEATURES = {
  TDR_MODULE: process.env.ENABLE_TDR === 'true',
  EXECUTIVE_METRICS: process.env.ENABLE_EXECUTIVE_METRICS === 'true',
  CHANGE_MANAGEMENT: process.env.ENABLE_CHANGE_MANAGEMENT === 'true',
  CRM_MODULE: process.env.ENABLE_CRM === 'true',
  LEGACY_INTEGRATION: process.env.ENABLE_LEGACY_INTEGRATION === 'true',
};

// Helper to check if a feature is enabled
export function isFeatureEnabled(feature: keyof typeof FEATURES): boolean {
  return FEATURES[feature] ?? false;
}
