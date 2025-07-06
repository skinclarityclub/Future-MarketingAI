/**
 * AI Configuration API Client
 * Handles API calls with proper URL resolution for both client and server contexts
 */

// Get the base URL for API calls
function getBaseUrl(): string {
  // In browser, use relative URLs
  if (typeof window !== "undefined") {
    return "";
  }

  // In server context, need absolute URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // Fallback for development
  return `http://localhost:${process.env.PORT || 3000}`;
}

// Create fetch wrapper that handles URLs properly
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

// AI Configuration specific API calls
export const aiConfigApi = {
  async getPersonalityProfiles() {
    return apiRequest("/api/ai-configuration/personalities");
  },

  async getSystemMessages() {
    return apiRequest("/api/ai-configuration/system-messages");
  },

  async getActiveProfile() {
    return apiRequest("/api/ai-configuration/active-profile");
  },

  async saveConfiguration(config: {
    personalityProfiles: any[];
    systemMessages: any[];
    activeProfileId: string;
  }) {
    return apiRequest("/api/ai-configuration/save", {
      method: "POST",
      body: JSON.stringify(config),
    });
  },

  async setActiveProfile(activeProfileId: string) {
    return apiRequest("/api/ai-configuration/active-profile", {
      method: "POST",
      body: JSON.stringify({ activeProfileId }),
    });
  },
};
