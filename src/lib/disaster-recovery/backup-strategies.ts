/**
 * Multi-Region Backup Strategies Configuration
 * Enterprise-grade disaster recovery backup system for Fortune 500 compliance
 */

export interface BackupRegion {
  id: string;
  name: string;
  provider: "aws" | "azure" | "gcp";
  location: string;
  isPrimary: boolean;
  priority: number;
  endpoint?: string;
  replicationTargets?: string[];
}

export interface BackupStrategy {
  id: string;
  name: string;
  description: string;
  frequency: "realtime" | "hourly" | "daily" | "weekly";
  retentionPeriod: number; // in days
  encryption: {
    enabled: boolean;
    algorithm: "AES-256" | "AES-128";
    keyRotationDays: number;
  };
  compression: {
    enabled: boolean;
    algorithm: "gzip" | "lz4" | "zstd";
  };
  regions: BackupRegion[];
  dataTypes: string[];
  rto: number; // Recovery Time Objective in minutes
  rpo: number; // Recovery Point Objective in minutes
}

export interface BackupConfiguration {
  environment: "production" | "staging" | "development";
  strategies: BackupStrategy[];
  monitoring: {
    healthCheckInterval: number; // in minutes
    alertThresholds: {
      failureRate: number; // percentage
      latency: number; // in milliseconds
      storageUsage: number; // percentage
    };
  };
  compliance: {
    gdprCompliant: boolean;
    soc2Compliant: boolean;
    iso27001Compliant: boolean;
    hipaaCompliant: boolean;
  };
}

// Default backup regions configuration
export const BACKUP_REGIONS: BackupRegion[] = [
  // AWS Regions
  {
    id: "aws-us-east-1",
    name: "AWS US East (N. Virginia)",
    provider: "aws",
    location: "us-east-1",
    isPrimary: true,
    priority: 1,
    replicationTargets: ["aws-eu-west-1", "aws-ap-southeast-1"],
  },
  {
    id: "aws-eu-west-1",
    name: "AWS Europe (Ireland)",
    provider: "aws",
    location: "eu-west-1",
    isPrimary: false,
    priority: 2,
    replicationTargets: ["aws-us-east-1", "aws-ap-southeast-1"],
  },
  {
    id: "aws-ap-southeast-1",
    name: "AWS Asia Pacific (Singapore)",
    provider: "aws",
    location: "ap-southeast-1",
    isPrimary: false,
    priority: 3,
    replicationTargets: ["aws-us-east-1", "aws-eu-west-1"],
  },
  // Azure Regions
  {
    id: "azure-east-us",
    name: "Azure East US",
    provider: "azure",
    location: "eastus",
    isPrimary: false,
    priority: 4,
    replicationTargets: ["azure-west-europe", "azure-southeast-asia"],
  },
  {
    id: "azure-west-europe",
    name: "Azure West Europe",
    provider: "azure",
    location: "westeurope",
    isPrimary: false,
    priority: 5,
    replicationTargets: ["azure-east-us", "azure-southeast-asia"],
  },
  {
    id: "azure-southeast-asia",
    name: "Azure Southeast Asia",
    provider: "azure",
    location: "southeastasia",
    isPrimary: false,
    priority: 6,
    replicationTargets: ["azure-east-us", "azure-west-europe"],
  },
];

// Production backup configuration for Fortune 500 compliance
export const PRODUCTION_BACKUP_CONFIG: BackupConfiguration = {
  environment: "production",
  strategies: [
    // Critical real-time backup strategy
    {
      id: "critical-realtime",
      name: "Critical Data Real-time Backup",
      description:
        "Real-time replication of critical business data across multiple regions",
      frequency: "realtime",
      retentionPeriod: 2555, // 7 years for compliance
      encryption: {
        enabled: true,
        algorithm: "AES-256",
        keyRotationDays: 30,
      },
      compression: {
        enabled: true,
        algorithm: "zstd",
      },
      regions: [
        BACKUP_REGIONS.find(r => r.id === "aws-us-east-1")!,
        BACKUP_REGIONS.find(r => r.id === "aws-eu-west-1")!,
        BACKUP_REGIONS.find(r => r.id === "azure-east-us")!,
      ],
      dataTypes: [
        "user_data",
        "financial_data",
        "audit_logs",
        "transaction_records",
      ],
      rto: 240, // 4 hours
      rpo: 60, // 1 hour
    },
    // Standard daily backup strategy
    {
      id: "standard-daily",
      name: "Standard Daily Backup",
      description: "Daily backup of application data and configurations",
      frequency: "daily",
      retentionPeriod: 90,
      encryption: {
        enabled: true,
        algorithm: "AES-256",
        keyRotationDays: 90,
      },
      compression: {
        enabled: true,
        algorithm: "gzip",
      },
      regions: [
        BACKUP_REGIONS.find(r => r.id === "aws-us-east-1")!,
        BACKUP_REGIONS.find(r => r.id === "aws-eu-west-1")!,
      ],
      dataTypes: ["application_data", "configuration_data", "user_preferences"],
      rto: 480, // 8 hours
      rpo: 1440, // 24 hours
    },
    // Archive weekly backup strategy
    {
      id: "archive-weekly",
      name: "Archive Weekly Backup",
      description: "Weekly archive backup for long-term retention",
      frequency: "weekly",
      retentionPeriod: 1825, // 5 years
      encryption: {
        enabled: true,
        algorithm: "AES-256",
        keyRotationDays: 180,
      },
      compression: {
        enabled: true,
        algorithm: "lz4",
      },
      regions: [
        BACKUP_REGIONS.find(r => r.id === "aws-ap-southeast-1")!,
        BACKUP_REGIONS.find(r => r.id === "azure-west-europe")!,
      ],
      dataTypes: ["archive_data", "historical_reports", "compliance_data"],
      rto: 2880, // 48 hours
      rpo: 10080, // 7 days
    },
  ],
  monitoring: {
    healthCheckInterval: 5, // every 5 minutes
    alertThresholds: {
      failureRate: 1, // 1% failure rate triggers alert
      latency: 30000, // 30 seconds latency threshold
      storageUsage: 85, // 85% storage usage triggers alert
    },
  },
  compliance: {
    gdprCompliant: true,
    soc2Compliant: true,
    iso27001Compliant: true,
    hipaaCompliant: true,
  },
};

// Cloud provider specific configurations
export const AWS_S3_CONFIG = {
  buckets: {
    primary: "skc-bi-dashboard-backup-primary",
    secondary: "skc-bi-dashboard-backup-secondary",
    archive: "skc-bi-dashboard-backup-archive",
  },
  storageClasses: {
    realtime: "STANDARD",
    daily: "STANDARD_IA",
    archive: "GLACIER",
  },
  versioning: {
    enabled: true,
    maxVersions: 100,
  },
  lifecycle: {
    enabled: true,
    rules: [
      {
        id: "transition-to-ia",
        transitionDays: 30,
        storageClass: "STANDARD_IA",
      },
      {
        id: "transition-to-glacier",
        transitionDays: 90,
        storageClass: "GLACIER",
      },
      {
        id: "delete-old-versions",
        expireDays: 365,
      },
    ],
  },
};

export const AZURE_BLOB_CONFIG = {
  storageAccounts: {
    primary: "skcbiprimary",
    secondary: "skcbisecondary",
    archive: "skcbiarchive",
  },
  accessTiers: {
    realtime: "Hot",
    daily: "Cool",
    archive: "Archive",
  },
  redundancy: {
    local: "LRS", // Locally Redundant Storage
    zone: "ZRS", // Zone Redundant Storage
    geo: "GRS", // Geo Redundant Storage
  },
  lifecycle: {
    enabled: true,
    rules: [
      {
        name: "transition-to-cool",
        daysAfterModification: 30,
        tierToCool: true,
      },
      {
        name: "transition-to-archive",
        daysAfterModification: 90,
        tierToArchive: true,
      },
      {
        name: "delete-old-blobs",
        daysAfterModification: 2555,
        deleteBlob: true,
      },
    ],
  },
};

export default {
  BACKUP_REGIONS,
  PRODUCTION_BACKUP_CONFIG,
  AWS_S3_CONFIG,
  AZURE_BLOB_CONFIG,
};
