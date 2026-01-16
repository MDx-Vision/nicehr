// =============================================================================
// Feature Flags
// =============================================================================
// Control feature rollout with environment variables
// Set ENABLE_<FEATURE>=true in .env to enable

export const FEATURES = {
  TDR_MODULE: process.env.ENABLE_TDR === 'true',
  EXECUTIVE_METRICS: process.env.ENABLE_EXECUTIVE_METRICS === 'true',
};

// Helper to check if a feature is enabled
export function isFeatureEnabled(feature: keyof typeof FEATURES): boolean {
  return FEATURES[feature] ?? false;
}
