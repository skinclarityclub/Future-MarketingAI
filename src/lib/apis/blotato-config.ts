import { logger } from "../logger";
import type { BlotatoConfig, SocialPlatform } from "./blotato-client";

// Environment variables for Blotato
export interface BlotatoEnvConfig {
  BLOTATO_API_KEY?: string;
  BLOTATO_BASE_URL?: string;
  BLOTATO_DEFAULT_ACCOUNT_ID?: string;
}

// Account Configuration
export interface AccountConfig {
  id: string;
  platform: SocialPlatform;
  username: string;
  pageId?: string;
  isDefault?: boolean;
  isActive?: boolean;
}

// Publishing Configuration
export interface PublishingConfig {
  defaultPlatforms: SocialPlatform[];
  schedulingOptions: {
    timezone: string;
    businessHours: {
      start: string; // HH:mm format
      end: string;
    };
    preferredDays: string[]; // ['monday', 'tuesday', ...]
  };
  retryOptions: {
    maxRetries: number;
    retryDelay: number; // milliseconds
    backoffMultiplier: number;
  };
  rateLimiting: {
    enabled: boolean;
    requestsPerMinute: number;
    burstLimit: number;
  };
}

// Complete Blotato Configuration
export interface BlotatoIntegrationConfig {
  api: BlotatoConfig;
  accounts: AccountConfig[];
  publishing: PublishingConfig;
  features: {
    autoUploadMedia: boolean;
    enableVideoGeneration: boolean;
    enableThreadSupport: boolean;
    enableScheduling: boolean;
    enableAnalytics: boolean;
  };
}

// Default Configuration
const DEFAULT_CONFIG: Partial<BlotatoIntegrationConfig> = {
  publishing: {
    defaultPlatforms: ["twitter", "linkedin"],
    schedulingOptions: {
      timezone: "Europe/Amsterdam",
      businessHours: {
        start: "09:00",
        end: "17:00",
      },
      preferredDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    },
    retryOptions: {
      maxRetries: 3,
      retryDelay: 1000,
      backoffMultiplier: 2,
    },
    rateLimiting: {
      enabled: true,
      requestsPerMinute: 30,
      burstLimit: 10,
    },
  },
  features: {
    autoUploadMedia: true,
    enableVideoGeneration: true,
    enableThreadSupport: true,
    enableScheduling: true,
    enableAnalytics: true,
  },
};

// Configuration Builder
export class BlotatoConfigBuilder {
  private config: Partial<BlotatoIntegrationConfig> = {};

  constructor() {
    this.config = { ...DEFAULT_CONFIG };
  }

  withApiKey(apiKey: string): this {
    if (!this.config.api) this.config.api = { apiKey: "" };
    this.config.api.apiKey = apiKey;
    return this;
  }

  withBaseUrl(baseUrl: string): this {
    if (!this.config.api) this.config.api = { apiKey: "" };
    this.config.api.baseUrl = baseUrl;
    return this;
  }

  withAccount(account: AccountConfig): this {
    if (!this.config.accounts) this.config.accounts = [];
    this.config.accounts.push(account);
    return this;
  }

  withAccounts(accounts: AccountConfig[]): this {
    this.config.accounts = accounts;
    return this;
  }

  withDefaultPlatforms(platforms: SocialPlatform[]): this {
    if (!this.config.publishing)
      this.config.publishing = DEFAULT_CONFIG.publishing!;
    this.config.publishing.defaultPlatforms = platforms;
    return this;
  }

  withTimezone(timezone: string): this {
    if (!this.config.publishing)
      this.config.publishing = DEFAULT_CONFIG.publishing!;
    this.config.publishing.schedulingOptions.timezone = timezone;
    return this;
  }

  withBusinessHours(start: string, end: string): this {
    if (!this.config.publishing)
      this.config.publishing = DEFAULT_CONFIG.publishing!;
    this.config.publishing.schedulingOptions.businessHours = { start, end };
    return this;
  }

  enableFeature(feature: keyof BlotatoIntegrationConfig["features"]): this {
    if (!this.config.features) this.config.features = DEFAULT_CONFIG.features!;
    this.config.features[feature] = true;
    return this;
  }

  disableFeature(feature: keyof BlotatoIntegrationConfig["features"]): this {
    if (!this.config.features) this.config.features = DEFAULT_CONFIG.features!;
    this.config.features[feature] = false;
    return this;
  }

  build(): BlotatoIntegrationConfig {
    if (!this.config.api?.apiKey) {
      throw new Error("Blotato API key is required");
    }

    return {
      api: this.config.api,
      accounts: this.config.accounts || [],
      publishing: this.config.publishing!,
      features: this.config.features!,
    };
  }
}

// Configuration Loader
export class BlotatoConfigLoader {
  static fromEnvironment(
    env: BlotatoEnvConfig = process.env
  ): BlotatoIntegrationConfig {
    const builder = new BlotatoConfigBuilder();

    if (!env.BLOTATO_API_KEY) {
      throw new Error("BLOTATO_API_KEY environment variable is required");
    }

    builder.withApiKey(env.BLOTATO_API_KEY);

    if (env.BLOTATO_BASE_URL) {
      builder.withBaseUrl(env.BLOTATO_BASE_URL);
    }

    logger.info("Loaded Blotato configuration from environment", {
      hasApiKey: !!env.BLOTATO_API_KEY,
      hasCustomBaseUrl: !!env.BLOTATO_BASE_URL,
      hasDefaultAccount: !!env.BLOTATO_DEFAULT_ACCOUNT_ID,
    });

    return builder.build();
  }

  static fromConfig(
    config: Partial<BlotatoIntegrationConfig>
  ): BlotatoIntegrationConfig {
    const builder = new BlotatoConfigBuilder();

    if (config.api) {
      if (config.api.apiKey) builder.withApiKey(config.api.apiKey);
      if (config.api.baseUrl) builder.withBaseUrl(config.api.baseUrl);
    }

    if (config.accounts) {
      builder.withAccounts(config.accounts);
    }

    if (config.publishing?.defaultPlatforms) {
      builder.withDefaultPlatforms(config.publishing.defaultPlatforms);
    }

    if (config.publishing?.schedulingOptions?.timezone) {
      builder.withTimezone(config.publishing.schedulingOptions.timezone);
    }

    if (config.features) {
      Object.entries(config.features).forEach(([feature, enabled]) => {
        if (enabled) {
          builder.enableFeature(
            feature as keyof BlotatoIntegrationConfig["features"]
          );
        } else {
          builder.disableFeature(
            feature as keyof BlotatoIntegrationConfig["features"]
          );
        }
      });
    }

    return builder.build();
  }
}

// Validation
export class BlotatoConfigValidator {
  static validate(config: BlotatoIntegrationConfig): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // API validation
    if (!config.api.apiKey) {
      errors.push("API key is required");
    }

    if (config.api.apiKey && config.api.apiKey.length < 10) {
      warnings.push("API key seems unusually short");
    }

    // Account validation
    if (config.accounts.length === 0) {
      warnings.push("No social media accounts configured");
    }

    const accountIds = config.accounts.map(acc => acc.id);
    const duplicateIds = accountIds.filter(
      (id, index) => accountIds.indexOf(id) !== index
    );
    if (duplicateIds.length > 0) {
      errors.push(`Duplicate account IDs found: ${duplicateIds.join(", ")}`);
    }

    // Publishing configuration validation
    if (config.publishing.defaultPlatforms.length === 0) {
      warnings.push("No default platforms configured");
    }

    if (config.publishing.retryOptions.maxRetries > 10) {
      warnings.push("High retry count may cause performance issues");
    }

    if (config.publishing.rateLimiting.requestsPerMinute > 100) {
      warnings.push("High rate limit may exceed API limits");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

// Utility Functions
export function createBlotatoConfig(): BlotatoConfigBuilder {
  return new BlotatoConfigBuilder();
}

export function loadBlotatoConfig(
  source?: "env" | Partial<BlotatoIntegrationConfig>
): BlotatoIntegrationConfig {
  if (source === "env" || !source) {
    return BlotatoConfigLoader.fromEnvironment();
  }
  return BlotatoConfigLoader.fromConfig(source);
}

export function validateBlotatoConfig(config: BlotatoIntegrationConfig) {
  const validation = BlotatoConfigValidator.validate(config);

  if (validation.warnings.length > 0) {
    logger.warn("Blotato configuration warnings", {
      warnings: validation.warnings,
    });
  }

  if (!validation.isValid) {
    logger.error("Blotato configuration errors", { errors: validation.errors });
    throw new Error(
      `Invalid Blotato configuration: ${validation.errors.join(", ")}`
    );
  }

  logger.info("Blotato configuration validated successfully");
  return true;
}

// Platform-specific configurations
export const PLATFORM_CONFIGS = {
  twitter: {
    maxTextLength: 280,
    maxImages: 4,
    maxVideos: 1,
    supportedFormats: ["jpg", "jpeg", "png", "gif", "webp", "mp4", "mov"],
    threadSupport: true,
  },
  linkedin: {
    maxTextLength: 3000,
    maxImages: 20,
    maxVideos: 1,
    supportedFormats: [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "mp4",
      "mov",
      "wmv",
      "flv",
      "avi",
    ],
    threadSupport: false,
  },
  facebook: {
    maxTextLength: 63206,
    maxImages: 30,
    maxVideos: 1,
    supportedFormats: [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "bmp",
      "tiff",
      "mp4",
      "mov",
      "avi",
      "wmv",
    ],
    threadSupport: false,
  },
  instagram: {
    maxTextLength: 2200,
    maxImages: 10,
    maxVideos: 1,
    supportedFormats: ["jpg", "jpeg", "png", "mp4", "mov"],
    threadSupport: false,
  },
  tiktok: {
    maxTextLength: 150,
    maxImages: 35,
    maxVideos: 1,
    supportedFormats: [
      "jpg",
      "jpeg",
      "png",
      "webp",
      "mp4",
      "mov",
      "avi",
      "wmv",
    ],
    threadSupport: false,
  },
  youtube: {
    maxTextLength: 5000,
    maxImages: 1, // thumbnail
    maxVideos: 1,
    supportedFormats: [
      "jpg",
      "jpeg",
      "png",
      "bmp",
      "mp4",
      "mov",
      "avi",
      "wmv",
      "flv",
      "webm",
    ],
    threadSupport: false,
  },
  bluesky: {
    maxTextLength: 300,
    maxImages: 4,
    maxVideos: 1,
    supportedFormats: ["jpg", "jpeg", "png", "gif", "webp", "mp4", "mov"],
    threadSupport: true,
  },
} as const;

export type PlatformConfig =
  (typeof PLATFORM_CONFIGS)[keyof typeof PLATFORM_CONFIGS];

export function getPlatformConfig(platform: SocialPlatform): PlatformConfig {
  return PLATFORM_CONFIGS[platform];
}

export default {
  BlotatoConfigBuilder,
  BlotatoConfigLoader,
  BlotatoConfigValidator,
  createBlotatoConfig,
  loadBlotatoConfig,
  validateBlotatoConfig,
  PLATFORM_CONFIGS,
  getPlatformConfig,
};
