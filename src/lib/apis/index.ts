// Blotato API Integration
export {
  BlotatoClient,
  createBlotatoClient,
  type BlotatoConfig,
  type SocialPlatform,
  type PostContent,
  type PostRequest,
  type PublishRequest,
  type BlotatoApiResponse,
  type VideoCreationRequest,
  type VideoCreationResponse,
  type MediaUploadRequest,
  type MediaUploadResponse,
  type ConnectedAccount,
  type PostTarget,
} from "./blotato-client";

export {
  BlotatoConfigBuilder,
  BlotatoConfigLoader,
  BlotatoConfigValidator,
  createBlotatoConfig,
  loadBlotatoConfig,
  validateBlotatoConfig,
  PLATFORM_CONFIGS,
  getPlatformConfig,
  type BlotatoEnvConfig,
  type AccountConfig,
  type PublishingConfig,
  type BlotatoIntegrationConfig,
  type PlatformConfig,
} from "./blotato-config";
