import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Types
interface PlatformAccount {
  id: string;
  platform:
    | "facebook"
    | "instagram"
    | "twitter"
    | "linkedin"
    | "youtube"
    | "tiktok";
  account_name: string;
  username: string;
  status: "connected" | "disconnected" | "error";
  followers_count: number;
  engagement_rate: number;
  posting_enabled: boolean;
  last_sync: Date;
}

interface PublishingPost {
  id: string;
  title: string;
  content: string;
  media_urls: string[];
  platforms: string[];
  scheduled_date?: Date;
  status:
    | "draft"
    | "queued"
    | "publishing"
    | "published"
    | "failed"
    | "cancelled";
  created_at: Date;
  engagement_prediction?: number;
  hashtags: string[];
  target_audience?: string;
  campaign_id?: string;
}

interface QueueItem {
  id: string;
  post_id: string;
  platform: string;
  account_id: string;
  scheduled_for: Date;
  status: "waiting" | "processing" | "completed" | "failed" | "retrying";
  attempts: number;
  error_message?: string;
  estimated_time?: Date;
  priority: "low" | "medium" | "high" | "urgent";
}

interface PublishingStats {
  total_posts_today: number;
  successful_publishes: number;
  failed_publishes: number;
  queue_length: number;
  average_engagement: number;
  top_performing_platform: string;
}

interface PlatformConfig {
  platform: string;
  enabled: boolean;
  api_config: Record<string, any>;
  rate_limits: {
    posts_per_hour: number;
    posts_per_day: number;
    requests_per_minute: number;
  };
  optimal_times: {
    weekday: string[];
    weekend: string[];
  };
  content_types: string[];
  character_limits: Record<string, number>;
  image_requirements: {
    max_size: number;
    formats: string[];
    dimensions: {
      min_width: number;
      min_height: number;
      max_width: number;
      max_height: number;
    };
  };
}

// Platform configurations
const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
  facebook: {
    platform: "facebook",
    enabled: true,
    api_config: {},
    rate_limits: {
      posts_per_hour: 25,
      posts_per_day: 200,
      requests_per_minute: 200,
    },
    optimal_times: {
      weekday: ["09:00", "13:00", "15:00", "19:00"],
      weekend: ["10:00", "14:00", "16:00", "20:00"],
    },
    content_types: ["post", "video", "story", "ad", "campaign"],
    character_limits: {
      post: 63206,
      story: 500,
      ad: 125,
    },
    image_requirements: {
      max_size: 10485760, // 10MB
      formats: ["jpg", "jpeg", "png", "gif"],
      dimensions: {
        min_width: 600,
        min_height: 315,
        max_width: 2048,
        max_height: 2048,
      },
    },
  },
  instagram: {
    platform: "instagram",
    enabled: true,
    api_config: {},
    rate_limits: {
      posts_per_hour: 20,
      posts_per_day: 150,
      requests_per_minute: 200,
    },
    optimal_times: {
      weekday: ["08:00", "12:00", "17:00", "19:00"],
      weekend: ["10:00", "13:00", "16:00", "19:00"],
    },
    content_types: ["post", "story", "video", "ad"],
    character_limits: {
      post: 2200,
      story: 500,
      ad: 125,
    },
    image_requirements: {
      max_size: 8388608, // 8MB
      formats: ["jpg", "jpeg", "png"],
      dimensions: {
        min_width: 320,
        min_height: 320,
        max_width: 1080,
        max_height: 1080,
      },
    },
  },
  twitter: {
    platform: "twitter",
    enabled: true,
    api_config: {},
    rate_limits: {
      posts_per_hour: 300,
      posts_per_day: 2400,
      requests_per_minute: 300,
    },
    optimal_times: {
      weekday: ["08:00", "10:00", "12:00", "16:00", "18:00"],
      weekend: ["09:00", "11:00", "13:00", "17:00", "19:00"],
    },
    content_types: ["post", "thread", "ad"],
    character_limits: {
      post: 280,
      thread: 280,
      ad: 280,
    },
    image_requirements: {
      max_size: 5242880, // 5MB
      formats: ["jpg", "jpeg", "png", "gif"],
      dimensions: {
        min_width: 600,
        min_height: 335,
        max_width: 1200,
        max_height: 1200,
      },
    },
  },
  linkedin: {
    platform: "linkedin",
    enabled: true,
    api_config: {},
    rate_limits: {
      posts_per_hour: 150,
      posts_per_day: 1000,
      requests_per_minute: 100,
    },
    optimal_times: {
      weekday: ["08:00", "12:00", "17:00", "18:00"],
      weekend: ["10:00", "14:00"],
    },
    content_types: ["post", "article", "video", "ad"],
    character_limits: {
      post: 3000,
      article: 125000,
      ad: 600,
    },
    image_requirements: {
      max_size: 10485760, // 10MB
      formats: ["jpg", "jpeg", "png"],
      dimensions: {
        min_width: 552,
        min_height: 414,
        max_width: 1200,
        max_height: 1200,
      },
    },
  },
  youtube: {
    platform: "youtube",
    enabled: true,
    api_config: {},
    rate_limits: {
      posts_per_hour: 6,
      posts_per_day: 100,
      requests_per_minute: 50,
    },
    optimal_times: {
      weekday: ["14:00", "15:00", "16:00", "20:00"],
      weekend: ["15:00", "16:00", "20:00", "21:00"],
    },
    content_types: ["video", "short", "live"],
    character_limits: {
      title: 100,
      description: 5000,
    },
    image_requirements: {
      max_size: 2097152, // 2MB for thumbnails
      formats: ["jpg", "jpeg", "png"],
      dimensions: {
        min_width: 1280,
        min_height: 720,
        max_width: 1920,
        max_height: 1080,
      },
    },
  },
  tiktok: {
    platform: "tiktok",
    enabled: true,
    api_config: {},
    rate_limits: {
      posts_per_hour: 10,
      posts_per_day: 100,
      requests_per_minute: 30,
    },
    optimal_times: {
      weekday: ["09:00", "12:00", "17:00", "19:00"],
      weekend: ["10:00", "13:00", "16:00", "19:00"],
    },
    content_types: ["video", "photo"],
    character_limits: {
      caption: 2200,
    },
    image_requirements: {
      max_size: 10485760, // 10MB
      formats: ["jpg", "jpeg", "png"],
      dimensions: {
        min_width: 720,
        min_height: 1280,
        max_width: 1080,
        max_height: 1920,
      },
    },
  },
};

// Mock data
const mockAccounts: PlatformAccount[] = [
  {
    id: "acc-1",
    platform: "facebook",
    account_name: "SKC Business",
    username: "@skcbusiness",
    status: "connected",
    followers_count: 15420,
    engagement_rate: 4.8,
    posting_enabled: true,
    last_sync: new Date(Date.now() - 15 * 60 * 1000),
  },
  {
    id: "acc-2",
    platform: "instagram",
    account_name: "SKC Business",
    username: "@skcbusiness",
    status: "connected",
    followers_count: 8930,
    engagement_rate: 6.2,
    posting_enabled: true,
    last_sync: new Date(Date.now() - 20 * 60 * 1000),
  },
  {
    id: "acc-3",
    platform: "twitter",
    account_name: "SKC Business",
    username: "@skcbusiness",
    status: "connected",
    followers_count: 6780,
    engagement_rate: 2.1,
    posting_enabled: true,
    last_sync: new Date(Date.now() - 10 * 60 * 1000),
  },
  {
    id: "acc-4",
    platform: "linkedin",
    account_name: "SKC Company",
    username: "skc-company",
    status: "connected",
    followers_count: 3450,
    engagement_rate: 3.9,
    posting_enabled: true,
    last_sync: new Date(Date.now() - 45 * 60 * 1000),
  },
  {
    id: "acc-5",
    platform: "youtube",
    account_name: "SKC Channel",
    username: "skcbusiness",
    status: "connected",
    followers_count: 2100,
    engagement_rate: 8.5,
    posting_enabled: true,
    last_sync: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: "acc-6",
    platform: "tiktok",
    account_name: "SKC Business",
    username: "@skcbusiness",
    status: "connected",
    followers_count: 1850,
    engagement_rate: 12.3,
    posting_enabled: true,
    last_sync: new Date(Date.now() - 60 * 60 * 1000),
  },
];

const mockPosts: PublishingPost[] = [
  {
    id: "post-1",
    title: "Summer Sale Announcement",
    content:
      "🌞 Summer Sale is here! Get up to 50% off on all our BI Dashboard solutions. Transform your business intelligence today! #SummerSale #BI #Analytics #DataInsights",
    media_urls: [],
    platforms: ["facebook", "instagram", "twitter"],
    status: "published",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
    engagement_prediction: 85,
    hashtags: ["#SummerSale", "#BI", "#Analytics", "#DataInsights"],
    target_audience: "Business professionals",
    campaign_id: "summer-2024",
  },
  {
    id: "post-2",
    title: "Product Demo Video",
    content:
      "Check out our latest BI Dashboard features in this comprehensive demo. See how easy it is to create stunning reports and gain actionable insights from your data.",
    media_urls: [],
    platforms: ["youtube", "linkedin"],
    scheduled_date: new Date(Date.now() + 24 * 60 * 60 * 1000),
    status: "queued",
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000),
    engagement_prediction: 92,
    hashtags: ["#ProductDemo", "#BI", "#Technology", "#DataVisualization"],
    target_audience: "Tech enthusiasts and data analysts",
    campaign_id: "product-education",
  },
];

let mockQueue: QueueItem[] = [
  {
    id: "queue-1",
    post_id: "post-2",
    platform: "youtube",
    account_id: "acc-5",
    scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000),
    status: "waiting",
    attempts: 0,
    priority: "medium",
  },
  {
    id: "queue-2",
    post_id: "post-2",
    platform: "linkedin",
    account_id: "acc-4",
    scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000),
    status: "waiting",
    attempts: 0,
    priority: "medium",
  },
];

// Helper functions
function calculateStats(): PublishingStats {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const postsToday = mockPosts.filter(post => {
    const postDate = new Date(post.created_at);
    postDate.setHours(0, 0, 0, 0);
    return postDate.getTime() === today.getTime();
  });

  const successful = mockPosts.filter(
    post => post.status === "published"
  ).length;
  const failed = mockPosts.filter(post => post.status === "failed").length;

  // Calculate average engagement
  const avgEngagement =
    mockAccounts.reduce((sum, acc) => sum + acc.engagement_rate, 0) /
    mockAccounts.length;

  // Find top performing platform
  const platformEngagement = mockAccounts.reduce(
    (acc, account) => {
      acc[account.platform] =
        (acc[account.platform] || 0) + account.engagement_rate;
      return acc;
    },
    {} as Record<string, number>
  );

  const topPlatform = Object.entries(platformEngagement).reduce((a, b) =>
    platformEngagement[a[0]] > platformEngagement[b[0]] ? a : b
  )[0];

  return {
    total_posts_today: postsToday.length,
    successful_publishes: successful,
    failed_publishes: failed,
    queue_length: mockQueue.length,
    average_engagement: Number(avgEngagement.toFixed(1)),
    top_performing_platform: topPlatform,
  };
}

function validatePostContent(
  content: string,
  platforms: string[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check content length for each platform
  platforms.forEach(platform => {
    const config = PLATFORM_CONFIGS[platform];
    if (config && config.character_limits.post) {
      if (content.length > config.character_limits.post) {
        errors.push(
          `Content exceeds ${platform} character limit (${config.character_limits.post})`
        );
      }
    }
  });

  // Check if content is empty
  if (!content.trim()) {
    errors.push("Content cannot be empty");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function simulatePublishing(
  post: PublishingPost
): Promise<{ success: boolean; message: string }> {
  return new Promise(resolve => {
    // Simulate API delay
    setTimeout(
      () => {
        // 90% success rate for simulation
        const success = Math.random() > 0.1;

        if (success) {
          resolve({
            success: true,
            message: "Post published successfully",
          });
        } else {
          resolve({
            success: false,
            message: "Failed to publish: API rate limit exceeded",
          });
        }
      },
      1000 + Math.random() * 2000
    ); // 1-3 second delay
  });
}

// API Endpoints
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "overview";

    switch (action) {
      case "overview":
        return NextResponse.json({
          success: true,
          data: {
            accounts: mockAccounts,
            posts: mockPosts.slice(0, 10), // Recent posts
            queue: mockQueue,
            stats: calculateStats(),
            platform_configs: PLATFORM_CONFIGS,
          },
        });

      case "accounts":
        return NextResponse.json({
          success: true,
          data: mockAccounts,
        });

      case "posts":
        const limit = parseInt(searchParams.get("limit") || "20");
        const offset = parseInt(searchParams.get("offset") || "0");

        return NextResponse.json({
          success: true,
          data: {
            posts: mockPosts.slice(offset, offset + limit),
            total: mockPosts.length,
            has_more: offset + limit < mockPosts.length,
          },
        });

      case "queue":
        return NextResponse.json({
          success: true,
          data: mockQueue,
        });

      case "stats":
        return NextResponse.json({
          success: true,
          data: calculateStats(),
        });

      default:
        return NextResponse.json(
          {
            success: false,
            message: "Invalid action parameter",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in multi-platform publishing GET:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "create_post":
        const {
          title,
          content,
          platforms,
          scheduled_date,
          hashtags,
          target_audience,
          campaign_id,
          publish_immediately,
        } = body;

        // Validate input
        if (!content || !platforms || platforms.length === 0) {
          return NextResponse.json(
            {
              success: false,
              message: "Content and platforms are required",
            },
            { status: 400 }
          );
        }

        // Validate content for each platform
        const validation = validatePostContent(content, platforms);
        if (!validation.valid) {
          return NextResponse.json(
            {
              success: false,
              message: "Content validation failed",
              errors: validation.errors,
            },
            { status: 400 }
          );
        }

        // Create new post
        const newPost: PublishingPost = {
          id: `post-${Date.now()}`,
          title: title || "Untitled Post",
          content,
          media_urls: [],
          platforms,
          scheduled_date: scheduled_date ? new Date(scheduled_date) : undefined,
          status: publish_immediately ? "publishing" : "queued",
          created_at: new Date(),
          engagement_prediction: Math.floor(Math.random() * 30) + 70, // 70-100%
          hashtags:
            hashtags?.split(" ").filter((tag: string) => tag.startsWith("#")) ||
            [],
          target_audience,
          campaign_id,
        };

        // Add to posts array
        mockPosts.unshift(newPost);

        // Create queue items for each platform
        const queueItems: QueueItem[] = platforms.map((platform: string) => ({
          id: `queue-${Date.now()}-${platform}`,
          post_id: newPost.id,
          platform,
          account_id:
            mockAccounts.find(acc => acc.platform === platform)?.id || "",
          scheduled_for: newPost.scheduled_date || new Date(),
          status: "waiting" as const,
          attempts: 0,
          priority: "medium" as const,
        }));

        mockQueue.push(...queueItems);

        // If publish immediately, simulate publishing
        if (publish_immediately) {
          setTimeout(async () => {
            for (const item of queueItems) {
              const result = await simulatePublishing(newPost);

              // Update queue item status
              const queueIndex = mockQueue.findIndex(q => q.id === item.id);
              if (queueIndex !== -1) {
                mockQueue[queueIndex].status = result.success
                  ? "completed"
                  : "failed";
                if (!result.success) {
                  mockQueue[queueIndex].error_message = result.message;
                }
              }
            }

            // Update post status
            const postIndex = mockPosts.findIndex(p => p.id === newPost.id);
            if (postIndex !== -1) {
              const allSuccessful = queueItems.every(item => {
                const queueItem = mockQueue.find(q => q.id === item.id);
                return queueItem?.status === "completed";
              });

              mockPosts[postIndex].status = allSuccessful
                ? "published"
                : "failed";
            }
          }, 2000);
        }

        return NextResponse.json({
          success: true,
          message: "Post created successfully",
          data: {
            post: newPost,
            queue_items: queueItems,
          },
        });

      case "cancel_post":
        const { post_id } = body;

        if (!post_id) {
          return NextResponse.json(
            {
              success: false,
              message: "Post ID is required",
            },
            { status: 400 }
          );
        }

        // Find and update post
        const postIndex = mockPosts.findIndex(p => p.id === post_id);
        if (postIndex === -1) {
          return NextResponse.json(
            {
              success: false,
              message: "Post not found",
            },
            { status: 404 }
          );
        }

        // Update post status
        mockPosts[postIndex].status = "cancelled";

        // Cancel queue items
        mockQueue.forEach(item => {
          if (item.post_id === post_id && item.status === "waiting") {
            item.status = "completed"; // Mark as completed to remove from active queue
          }
        });

        return NextResponse.json({
          success: true,
          message: "Post cancelled successfully",
        });

      case "retry_failed":
        const { queue_item_id } = body;

        if (!queue_item_id) {
          return NextResponse.json(
            {
              success: false,
              message: "Queue item ID is required",
            },
            { status: 400 }
          );
        }

        // Find queue item
        const queueIndex = mockQueue.findIndex(q => q.id === queue_item_id);
        if (queueIndex === -1) {
          return NextResponse.json(
            {
              success: false,
              message: "Queue item not found",
            },
            { status: 404 }
          );
        }

        // Reset status and increment attempts
        mockQueue[queueIndex].status = "retrying";
        mockQueue[queueIndex].attempts += 1;
        mockQueue[queueIndex].error_message = undefined;

        return NextResponse.json({
          success: true,
          message: "Retry initiated successfully",
        });

      case "update_account_status":
        const { account_id, posting_enabled } = body;

        if (!account_id || posting_enabled === undefined) {
          return NextResponse.json(
            {
              success: false,
              message: "Account ID and posting status are required",
            },
            { status: 400 }
          );
        }

        // Find and update account
        const accountIndex = mockAccounts.findIndex(a => a.id === account_id);
        if (accountIndex === -1) {
          return NextResponse.json(
            {
              success: false,
              message: "Account not found",
            },
            { status: 404 }
          );
        }

        mockAccounts[accountIndex].posting_enabled = posting_enabled;

        return NextResponse.json({
          success: true,
          message: "Account status updated successfully",
        });

      default:
        return NextResponse.json(
          {
            success: false,
            message: "Invalid action",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in multi-platform publishing POST:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const post_id = searchParams.get("post_id");

    if (!post_id) {
      return NextResponse.json(
        {
          success: false,
          message: "Post ID is required",
        },
        { status: 400 }
      );
    }

    // Remove post
    const postIndex = mockPosts.findIndex(p => p.id === post_id);
    if (postIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          message: "Post not found",
        },
        { status: 404 }
      );
    }

    mockPosts.splice(postIndex, 1);

    // Remove related queue items
    mockQueue = mockQueue.filter(item => item.post_id !== post_id);

    return NextResponse.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Error in multi-platform publishing DELETE:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
