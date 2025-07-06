/**
 * Disaster Recovery Module
 * Multi-region backup strategies and management for enterprise-grade disaster recovery
 */

// Only export working modules to fix build
export * from "./dr-testing-protocols";
export * from "./compliance-documentation";

// Re-export key components that are confirmed to work
export {
  drTestingManager,
  DRTestingProtocolsManager,
  DEFAULT_DR_TESTING_CONFIG,
  DEFAULT_DR_SCENARIOS,
  DR_TEST_FREQUENCIES,
  COMPLIANCE_STANDARDS,
} from "./dr-testing-protocols";

export {
  complianceManager,
  ComplianceDocumentationManager,
} from "./compliance-documentation";
