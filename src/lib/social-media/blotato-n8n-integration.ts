/**
 * Blotato + n8n Social Media Integration
 *
 * Dit systeem verbindt social media accounts met Blotato workflows
 * zodat content automatisch wordt gegenereerd en gepost via n8n
 */

interface SocialMediaConnection {
  platform:
    | "facebook"
    | "instagram"
    | "twitter"
    | "linkedin"
    | "youtube"
    | "tiktok";
  accountId: string;
  accountName: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  n8nWorkflowId?: string;
  blotoatoCampaignId?: string;
  status: "connected" | "pending" | "error" | "disconnected";
  permissions: string[];
}

interface BlototoWorkflowConfig {
  campaignId: string;
  contentTypes: ("text" | "image" | "video" | "carousel")[];
  postingSchedule: {
    frequency: "daily" | "weekly" | "custom";
    times: string[]; // ['09:00', '14:00', '18:00']
    timezone: string;
  };
  contentParams: {
    tone: string;
    hashtags: string[];
    mentions: string[];
    targetAudience: string;
  };
}

interface N8nWorkflowTrigger {
  workflowId: string;
  webhookUrl: string;
  triggerType: "schedule" | "webhook" | "manual";
  config: BlototoWorkflowConfig;
}

export class BlotoatoN8nIntegration {
  private baseUrl: string;
  private apiKey: string;
  private n8nBaseUrl: string;

  constructor() {
    this.baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
    this.apiKey = process.env.BLOTATO_API_KEY || "";
    this.n8nBaseUrl = process.env.N8N_BASE_URL || "http://localhost:5678";
  }

  /**
   * Initieer OAuth flow voor social media platform
   */
  async initiatePlatformConnection(
    platform: string,
    redirectUrl: string
  ): Promise<string> {
    const response = await fetch(
      `${this.baseUrl}/api/social-media/oauth/initiate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          platform,
          redirectUrl,
          scopes: this.getPlatformScopes(platform),
        }),
      }
    );

    const data = await response.json();
    return data.authUrl;
  }

  /**
   * Voltooi OAuth en stel n8n workflow in
   */
  async completePlatformConnection(
    platform: string,
    authCode: string,
    workflowConfig: BlototoWorkflowConfig
  ): Promise<SocialMediaConnection> {
    // 1. Voltooi OAuth
    const tokenResponse = await fetch(
      `${this.baseUrl}/api/social-media/oauth/callback`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          platform,
          code: authCode,
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    // 2. Maak n8n workflow aan
    const workflowId = await this.createN8nWorkflow(
      platform,
      tokenData.accountId,
      workflowConfig
    );

    // 3. Verbind met Blotato campaign
    const campaignId = await this.createBlotoatoCampaign(
      platform,
      tokenData.accountId,
      workflowConfig
    );

    // 4. Sla connectie op
    const connection: SocialMediaConnection = {
      platform: platform as any,
      accountId: tokenData.accountId,
      accountName: tokenData.accountName,
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      expiresAt: tokenData.expiresAt
        ? new Date(tokenData.expiresAt)
        : undefined,
      n8nWorkflowId: workflowId,
      blotoatoCampaignId: campaignId,
      status: "connected",
      permissions: tokenData.permissions || [],
    };

    await this.saveConnection(connection);
    return connection;
  }

  /**
   * Maak n8n workflow voor automatische posting
   */
  private async createN8nWorkflow(
    platform: string,
    accountId: string,
    config: BlototoWorkflowConfig
  ): Promise<string> {
    const workflowDefinition = {
      name: `SKC Social Media - ${platform} - ${accountId}`,
      nodes: [
        {
          // Blotato Trigger - content generatie
          name: "Blotato Content Generator",
          type: "Webhook",
          parameters: {
            httpMethod: "POST",
            path: `blotato-trigger-${accountId}`,
          },
          position: [250, 300],
        },
        {
          // Content Processing
          name: "Process Content",
          type: "Function",
          parameters: {
            functionCode: `
              // Verwerk Blotato content voor ${platform}
              const content = items[0].json;
              
              // Platform-specifieke aanpassingen
              let processedContent = {
                text: content.text,
                images: content.images || [],
                hashtags: ${JSON.stringify(config.contentParams.hashtags)},
                platform: "${platform}",
                accountId: "${accountId}"
              };
              
              // Platform limits toepassen
              if ("${platform}" === "twitter") {
                processedContent.text = processedContent.text.substring(0, 280);
              }
              
              return [{ json: processedContent }];
            `,
          },
          position: [450, 300],
        },
        {
          // Social Media Poster
          name: `Post to ${platform}`,
          type:
            platform === "instagram"
              ? "Instagram"
              : platform === "facebook"
                ? "Facebook"
                : platform === "twitter"
                  ? "Twitter"
                  : platform === "linkedin"
                    ? "LinkedIn"
                    : "HTTP Request",
          parameters: this.getPlatformPostingParams(platform, accountId),
          position: [650, 300],
        },
        {
          // Webhook naar SKC Dashboard
          name: "Update SKC Dashboard",
          type: "HTTP Request",
          parameters: {
            url: `${this.baseUrl}/api/social-media/post-callback`,
            method: "POST",
            body: "={{ JSON.stringify($json) }}",
            headers: {
              "Content-Type": "application/json",
            },
          },
          position: [850, 300],
        },
      ],
      connections: {
        "Blotato Content Generator": {
          main: [["Process Content"]],
        },
        "Process Content": {
          main: [[`Post to ${platform}`]],
        },
        [`Post to ${platform}`]: {
          main: [["Update SKC Dashboard"]],
        },
      },
      active: true,
      settings: {
        timezone: config.postingSchedule.timezone,
      },
    };

    const response = await fetch(`${this.n8nBaseUrl}/api/v1/workflows`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-N8N-API-KEY": process.env.N8N_API_KEY || "",
      },
      body: JSON.stringify(workflowDefinition),
    });

    const workflow = await response.json();
    return workflow.id;
  }

  /**
   * Maak Blotato campaign voor content generatie
   */
  private async createBlotoatoCampaign(
    platform: string,
    accountId: string,
    config: BlototoWorkflowConfig
  ): Promise<string> {
    const campaignConfig = {
      name: `SKC ${platform} Content - ${accountId}`,
      platform: platform,
      contentTypes: config.contentTypes,
      schedule: config.postingSchedule,
      parameters: {
        ...config.contentParams,
        webhookUrl: `${this.n8nBaseUrl}/webhook/blotato-trigger-${accountId}`,
        brand: "SKC Business Intelligence",
        industry: "Business Intelligence & Analytics",
        targetAudience: config.contentParams.targetAudience,
      },
    };

    // Hier zou je de Blotato API aanroepen
    // Voor nu simuleren we een campaign ID
    const campaignId = `blotato_${platform}_${accountId}_${Date.now()}`;

    return campaignId;
  }

  /**
   * Platform-specifieke OAuth scopes
   */
  private getPlatformScopes(platform: string): string[] {
    const scopeMap = {
      instagram: [
        "instagram_basic",
        "instagram_content_publish",
        "pages_read_engagement",
      ],
      facebook: [
        "pages_manage_posts",
        "pages_read_engagement",
        "publish_to_groups",
      ],
      twitter: ["tweet.read", "tweet.write", "users.read", "offline.access"],
      linkedin: ["w_member_social", "r_basicprofile", "r_organization_social"],
      youtube: ["youtube.upload", "youtube.readonly"],
      tiktok: ["video.list", "video.upload"],
    };

    return scopeMap[platform as keyof typeof scopeMap] || [];
  }

  /**
   * Platform-specifieke posting parameters
   */
  private getPlatformPostingParams(platform: string, accountId: string): any {
    const paramMap = {
      instagram: {
        accessToken: "={{ $node['Process Content'].json.accessToken }}",
        mediaType: "IMAGE",
        caption: "={{ $node['Process Content'].json.text }}",
        imageUrl: "={{ $node['Process Content'].json.images[0] }}",
      },
      facebook: {
        accessToken: "={{ $node['Process Content'].json.accessToken }}",
        pageId: accountId,
        message: "={{ $node['Process Content'].json.text }}",
      },
      twitter: {
        consumerKey: process.env.TWITTER_CONSUMER_KEY,
        consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
        accessToken: "={{ $node['Process Content'].json.accessToken }}",
        accessTokenSecret:
          "={{ $node['Process Content'].json.accessTokenSecret }}",
        text: "={{ $node['Process Content'].json.text }}",
      },
      linkedin: {
        accessToken: "={{ $node['Process Content'].json.accessToken }}",
        personUrn: accountId,
        text: "={{ $node['Process Content'].json.text }}",
      },
    };

    return paramMap[platform as keyof typeof paramMap] || {};
  }

  /**
   * Sla connectie op in database
   */
  private async saveConnection(
    connection: SocialMediaConnection
  ): Promise<void> {
    await fetch(`${this.baseUrl}/api/social-media/connections`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(connection),
    });
  }

  /**
   * Activeer/deactiveer automatische posting
   */
  async toggleAutomation(accountId: string, enabled: boolean): Promise<void> {
    const connection = await this.getConnection(accountId);

    if (connection?.n8nWorkflowId) {
      await fetch(
        `${this.n8nBaseUrl}/api/v1/workflows/${connection.n8nWorkflowId}/activate`,
        {
          method: "POST",
          headers: {
            "X-N8N-API-KEY": process.env.N8N_API_KEY || "",
          },
          body: JSON.stringify({ active: enabled }),
        }
      );
    }
  }

  /**
   * Haal connectie op
   */
  private async getConnection(
    accountId: string
  ): Promise<SocialMediaConnection | null> {
    const response = await fetch(
      `${this.baseUrl}/api/social-media/connections/${accountId}`
    );
    return response.ok ? await response.json() : null;
  }

  /**
   * Test posting (handmatig)
   */
  async testPost(accountId: string, content: string): Promise<boolean> {
    const connection = await this.getConnection(accountId);

    if (!connection?.n8nWorkflowId) {
      throw new Error("No workflow found for account");
    }

    const response = await fetch(
      `${this.n8nBaseUrl}/api/v1/workflows/${connection.n8nWorkflowId}/execute`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-N8N-API-KEY": process.env.N8N_API_KEY || "",
        },
        body: JSON.stringify({
          startNodes: ["Blotato Content Generator"],
          runData: {
            "Blotato Content Generator": [
              {
                json: {
                  text: content,
                  platform: connection.platform,
                  accountId: connection.accountId,
                  accessToken: connection.accessToken,
                },
              },
            ],
          },
        }),
      }
    );

    return response.ok;
  }
}

// Export singleton instance
export const blotato_n8n = new BlotoatoN8nIntegration();
