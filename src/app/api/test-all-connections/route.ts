import { NextRequest, NextResponse } from "next/server";
import { credentialsDatabaseService } from "@/lib/command-center/credentials-database-service";

export async function GET(request: NextRequest) {
  try {
    console.log("🧪 Testing all API connections...");

    const results = {
      timestamp: new Date().toISOString(),
      summary: {
        total: 0,
        active: 0,
        errors: 0,
      },
      providers: {} as any,
    };

    // Get all providers
    const providers = await credentialsDatabaseService.getAllProviders();
    if (!providers || providers.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No providers found",
        },
        { status: 404 }
      );
    }

    results.summary.total = providers.length;

    // Test each provider that has an access token
    for (const provider of providers) {
      const testResult = {
        id: provider.id,
        name: provider.name,
        status: "untested",
        error: null as string | null,
        data: null as any,
        hasAccessToken: false,
      };

      // Check if provider has access token
      const accessTokenCred = provider.credentials.find(
        c => c.id.includes("access_token") && c.value
      );

      if (!accessTokenCred || !accessTokenCred.value) {
        testResult.status = "no_token";
        testResult.error = "No access token configured";
        results.providers[provider.id] = testResult;
        continue;
      }

      testResult.hasAccessToken = true;

      try {
        // Test based on provider type
        switch (provider.id) {
          case "clickup":
            const clickupResponse = await fetch(
              "https://api.clickup.com/api/v2/user",
              {
                headers: {
                  Authorization: accessTokenCred.value,
                  "Content-Type": "application/json",
                },
              }
            );

            if (clickupResponse.ok) {
              const userData = await clickupResponse.json();
              testResult.status = "active";
              testResult.data = {
                user: userData.user?.username || "Unknown",
                email: userData.user?.email || "Unknown",
              };
              results.summary.active++;
            } else {
              testResult.status = "error";
              testResult.error = `HTTP ${clickupResponse.status}: ${clickupResponse.statusText}`;
              results.summary.errors++;
            }
            break;

          case "instagram":
            // Test Instagram Basic Display API
            const instagramResponse = await fetch(
              `https://graph.instagram.com/me?fields=id,username&access_token=${accessTokenCred.value}`
            );

            if (instagramResponse.ok) {
              const userData = await instagramResponse.json();
              testResult.status = "active";
              testResult.data = {
                user: userData.username || "Unknown",
                id: userData.id || "Unknown",
              };
              results.summary.active++;
            } else {
              testResult.status = "error";
              const errorData = await instagramResponse
                .json()
                .catch(() => null);
              testResult.error =
                errorData?.error?.message || `HTTP ${instagramResponse.status}`;
              results.summary.errors++;
            }
            break;

          case "facebook":
            // Test Facebook Graph API
            const facebookResponse = await fetch(
              `https://graph.facebook.com/me?access_token=${accessTokenCred.value}`
            );

            if (facebookResponse.ok) {
              const userData = await facebookResponse.json();
              testResult.status = "active";
              testResult.data = {
                user: userData.name || "Unknown",
                id: userData.id || "Unknown",
              };
              results.summary.active++;
            } else {
              testResult.status = "error";
              const errorData = await facebookResponse.json().catch(() => null);
              testResult.error =
                errorData?.error?.message || `HTTP ${facebookResponse.status}`;
              results.summary.errors++;
            }
            break;

          case "linkedin":
            // Test LinkedIn API
            const linkedinResponse = await fetch(
              "https://api.linkedin.com/v2/people/~",
              {
                headers: {
                  Authorization: `Bearer ${accessTokenCred.value}`,
                  "Content-Type": "application/json",
                },
              }
            );

            if (linkedinResponse.ok) {
              const userData = await linkedinResponse.json();
              testResult.status = "active";
              testResult.data = {
                user: userData.localizedFirstName || "Unknown",
                id: userData.id || "Unknown",
              };
              results.summary.active++;
            } else {
              testResult.status = "error";
              testResult.error = `HTTP ${linkedinResponse.status}: ${linkedinResponse.statusText}`;
              results.summary.errors++;
            }
            break;

          case "youtube":
            // Test YouTube Data API (simplified - would need proper Google OAuth)
            testResult.status = "configured";
            testResult.data = {
              user: "OAuth Token Present",
              note: "Full YouTube API testing requires Google OAuth setup",
            };
            results.summary.active++;
            break;

          case "n8n":
            // Test n8n API
            const apiKeyCred = provider.credentials.find(
              c => c.id === "n8n_api_key"
            );
            if (apiKeyCred?.value) {
              const n8nResponse = await fetch(
                "https://skinclarityclub.app.n8n.cloud/api/v1/workflows",
                {
                  headers: {
                    "X-N8N-API-KEY": apiKeyCred.value,
                    "Content-Type": "application/json",
                  },
                }
              );

              if (n8nResponse.ok) {
                const workflows = await n8nResponse.json();
                testResult.status = "active";
                testResult.data = {
                  workflows: workflows.data?.length || 0,
                  instance: "skinclarityclub.app.n8n.cloud",
                };
                results.summary.active++;
              } else {
                testResult.status = "error";
                testResult.error = `HTTP ${n8nResponse.status}: ${n8nResponse.statusText}`;
                results.summary.errors++;
              }
            } else {
              testResult.status = "no_token";
              testResult.error = "No API key configured";
            }
            break;

          default:
            testResult.status = "unknown";
            testResult.error = "Provider not implemented for testing";
            results.summary.errors++;
            break;
        }
      } catch (error) {
        testResult.status = "error";
        testResult.error =
          error instanceof Error ? error.message : "Unknown error";
        results.summary.errors++;
      }

      results.providers[provider.id] = testResult;
    }

    return NextResponse.json({
      success: true,
      message: `Connection test completed! ${results.summary.active}/${results.summary.total} providers active.`,
      data: results,
    });
  } catch (error) {
    console.error("Connection test error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Connection test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
