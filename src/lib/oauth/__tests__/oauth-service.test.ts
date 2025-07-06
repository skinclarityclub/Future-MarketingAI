import { describe, it, expect, beforeEach, vi } from "vitest";
import { OAuthService } from "../oauth-service";

// Mock Next.js cookies
vi.mock("next/headers", () => ({
  cookies: () => ({
    get: vi.fn(),
  }),
}));

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn(() => ({
    insert: vi.fn(),
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(() => ({
          gt: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
      })),
    })),
    upsert: vi.fn(),
    delete: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(),
      })),
    })),
  })),
};

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => mockSupabaseClient),
}));

describe("OAuthService", () => {
  let oauthService: OAuthService;

  beforeEach(() => {
    oauthService = new OAuthService();
    vi.clearAllMocks();
  });

  describe("generateState", () => {
    it("should generate a state string", () => {
      const state = oauthService.generateState();
      expect(typeof state).toBe("string");
      expect(state.length).toBeGreaterThan(0);
    });

    it("should generate unique states", () => {
      const state1 = oauthService.generateState();
      const state2 = oauthService.generateState();
      expect(state1).not.toBe(state2);
    });
  });

  describe("storeOAuthState", () => {
    it("should store OAuth state successfully", async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      mockSupabaseClient.from.mockReturnValue({
        insert: mockInsert,
      });

      await oauthService.storeOAuthState(
        "test-state",
        "google_ads",
        "user-123"
      );

      expect(mockSupabaseClient.from).toHaveBeenCalledWith("oauth_states");
      expect(mockInsert).toHaveBeenCalledWith({
        state_value: "test-state",
        provider: "google_ads",
        user_id: "user-123",
        redirect_uri: undefined,
        expires_at: expect.any(String),
      });
    });

    it("should throw error when storage fails", async () => {
      const mockInsert = vi.fn().mockResolvedValue({
        error: { message: "Storage failed" },
      });
      mockSupabaseClient.from.mockReturnValue({
        insert: mockInsert,
      });

      await expect(
        oauthService.storeOAuthState("test-state", "google_ads", "user-123")
      ).rejects.toThrow("Failed to store OAuth state: Storage failed");
    });
  });

  describe("validateOAuthState", () => {
    it("should validate OAuth state successfully", async () => {
      const mockStateData = {
        id: "state-id",
        state_value: "test-state",
        provider: "google_ads",
        user_id: "user-123",
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      };

      const mockSingle = vi.fn().mockResolvedValue({
        data: mockStateData,
        error: null,
      });
      const mockDelete = vi.fn().mockResolvedValue({ error: null });

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              gt: jest.fn(() => ({
                single: mockSingle,
              })),
            })),
          })),
        })),
        delete: jest.fn(() => ({
          eq: mockDelete,
        })),
      });

      const result = await oauthService.validateOAuthState(
        "test-state",
        "google_ads"
      );

      expect(result).toEqual(mockStateData);
      expect(mockSingle).toHaveBeenCalled();
    });

    it("should return null for invalid state", async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "No matching state" },
      });

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              gt: jest.fn(() => ({
                single: mockSingle,
              })),
            })),
          })),
        })),
      });

      const result = await oauthService.validateOAuthState(
        "invalid-state",
        "google_ads"
      );

      expect(result).toBeNull();
    });
  });

  describe("storeAccessToken", () => {
    it("should store access token successfully", async () => {
      const mockUpsert = vi.fn().mockResolvedValue({ error: null });
      mockSupabaseClient.from.mockReturnValue({
        upsert: mockUpsert,
      });

      await oauthService.storeAccessToken(
        "user-123",
        "google_ads",
        "access-token",
        "refresh-token",
        3600,
        "ads_read"
      );

      expect(mockSupabaseClient.from).toHaveBeenCalledWith("oauth_tokens");
      expect(mockUpsert).toHaveBeenCalledWith(
        {
          user_id: "user-123",
          provider: "google_ads",
          access_token: "access-token",
          refresh_token: "refresh-token",
          token_type: "Bearer",
          expires_at: expect.any(String),
          scope: "ads_read",
        },
        {
          onConflict: "user_id, provider",
        }
      );
    });

    it("should throw error when storage fails", async () => {
      const mockUpsert = vi.fn().mockResolvedValue({
        error: { message: "Storage failed" },
      });
      mockSupabaseClient.from.mockReturnValue({
        upsert: mockUpsert,
      });

      await expect(
        oauthService.storeAccessToken("user-123", "google_ads", "access-token")
      ).rejects.toThrow("Failed to store access token: Storage failed");
    });
  });

  describe("hasValidConnection", () => {
    it("should return true when valid connection exists", async () => {
      const mockTokenData = {
        id: "token-id",
        user_id: "user-123",
        provider: "google_ads",
        access_token: "valid-token",
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      };

      const mockSingle = vi.fn().mockResolvedValue({
        data: mockTokenData,
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: mockSingle,
            })),
          })),
        })),
      });

      const result = await oauthService.hasValidConnection(
        "user-123",
        "google_ads"
      );

      expect(result).toBe(true);
    });

    it("should return false when no connection exists", async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "No token found" },
      });

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: mockSingle,
            })),
          })),
        })),
      });

      const result = await oauthService.hasValidConnection(
        "user-123",
        "google_ads"
      );

      expect(result).toBe(false);
    });
  });
});
