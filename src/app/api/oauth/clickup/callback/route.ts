import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Get the base URL from the request
    const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;

    console.log("ClickUp OAuth callback:", {
      url: request.url,
      code: code?.substring(0, 10) + "...",
      state,
      error,
      baseUrl,
    });

    if (error) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head><title>OAuth Error</title></head>
          <body style="font-family: system-ui, sans-serif; text-align: center; padding: 50px; background: #fee; color: #c33;">
            <h2>❌ OAuth Error</h2>
            <p>Error: ${error}</p>
            <p style="font-size: 12px;">This window will close in 3 seconds...</p>
            <script>
              if (window.opener) window.opener.postMessage({type: 'clickup_oauth_error', error: '${error}'}, '*');
              setTimeout(() => window.close(), 3000);
            </script>
          </body>
        </html>
      `,
        { status: 400, headers: { "Content-Type": "text/html" } }
      );
    }

    if (!code) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head><title>OAuth Error</title></head>
          <body style="font-family: system-ui, sans-serif; text-align: center; padding: 50px; background: #fee; color: #c33;">
            <h2>❌ Missing Authorization Code</h2>
            <p>No authorization code received from ClickUp.</p>
            <p style="font-size: 12px;">This window will close in 3 seconds...</p>
            <script>
              if (window.opener) window.opener.postMessage({type: 'clickup_oauth_error', error: 'missing_code'}, '*');
              setTimeout(() => window.close(), 3000);
            </script>
          </body>
        </html>
      `,
        { status: 400, headers: { "Content-Type": "text/html" } }
      );
    }

    // Get ClickUp credentials from database via API
    const credentialsResponse = await fetch(
      `${baseUrl}/api/command-center/credentials?action=provider&providerId=clickup`,
      {
        method: "GET",
      }
    );

    if (!credentialsResponse.ok) {
      return NextResponse.redirect(
        `${baseUrl}/nl/settings?error=credentials_missing&message=${encodeURIComponent("ClickUp credentials not configured in settings")}`
      );
    }

    const credentialsData = await credentialsResponse.json();
    const provider = credentialsData.data;

    if (!provider) {
      return NextResponse.redirect(
        `${baseUrl}/nl/settings?error=credentials_missing&message=${encodeURIComponent("ClickUp provider not found")}`
      );
    }

    // Extract client_id and client_secret from provider credentials
    const clientIdCredential = provider.credentials.find(
      (c: any) => c.id === "clickup_client_id"
    );
    const clientSecretCredential = provider.credentials.find(
      (c: any) => c.id === "clickup_client_secret"
    );

    console.log("ClickUp credentials check:", {
      providerFound: !!provider,
      credentialsCount: provider.credentials?.length || 0,
      clientIdFound: !!clientIdCredential,
      clientSecretFound: !!clientSecretCredential,
      clientIdValue: clientIdCredential?.value ? "present" : "missing",
      clientSecretValue: clientSecretCredential?.value ? "present" : "missing",
    });

    if (!clientIdCredential?.value || !clientSecretCredential?.value) {
      return NextResponse.redirect(
        `${baseUrl}/nl/settings?error=credentials_incomplete&message=${encodeURIComponent("Please configure both Client ID and Client Secret in settings")}`
      );
    }

    // Exchange authorization code for access token using user-provided credentials
    const tokenResponse = await fetch(
      "https://api.clickup.com/api/v2/oauth/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: clientIdCredential.value,
          client_secret: clientSecretCredential.value,
          code,
          grant_type: "authorization_code",
          redirect_uri: `${baseUrl}/api/oauth/clickup/callback`,
        }),
      }
    );

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("ClickUp token exchange failed:", errorText);
      return NextResponse.redirect(
        `${baseUrl}/nl/settings?error=token_exchange&message=${encodeURIComponent("Failed to exchange code for token")}`
      );
    }

    const tokenData = await tokenResponse.json();
    console.log("ClickUp token received:", {
      access_token: tokenData.access_token?.substring(0, 10) + "...",
      token_type: tokenData.token_type,
    });

    // Save the access token to database via credentials API
    try {
      const saveResponse = await fetch(
        `${baseUrl}/api/command-center/credentials`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "save",
            providerId: "clickup",
            credentialId: "clickup_access_token",
            value: tokenData.access_token,
          }),
        }
      );

      if (saveResponse.ok) {
        console.log("✅ ClickUp access token saved to database");
      } else {
        console.error("❌ Failed to save ClickUp access token to database");
      }
    } catch (error) {
      console.error("❌ Error saving ClickUp access token:", error);
    }

    // Return an HTML page that closes the popup and notifies the parent window
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>ClickUp OAuth Success</title>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: system-ui, sans-serif; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white; 
              margin: 0; 
              padding: 40px 20px;
              text-align: center;
              min-height: 100vh;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
            }
            .container {
              background: rgba(255,255,255,0.1);
              padding: 30px;
              border-radius: 15px;
              border: 1px solid rgba(255,255,255,0.2);
              backdrop-filter: blur(10px);
              max-width: 400px;
            }
            .success-icon { 
              font-size: 48px; 
              margin-bottom: 20px;
              animation: pulse 1.5s infinite;
            }
            @keyframes pulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.1); }
              100% { transform: scale(1); }
            }
            .message { 
              font-size: 18px; 
              margin-bottom: 10px; 
              font-weight: 600;
            }
            .details { 
              font-size: 14px; 
              opacity: 0.8; 
              margin-bottom: 20px;
            }
            .auto-close { 
              font-size: 12px; 
              opacity: 0.6; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success-icon">✅</div>
            <div class="message">ClickUp OAuth Successful!</div>
            <div class="details">
              Access token received and saved.<br>
              Your ClickUp integration is now active.
            </div>
            <div class="auto-close">
              This window will close automatically in 3 seconds...
            </div>
          </div>
          
          <script>
            // Notify parent window of success
            if (window.opener) {
              try {
                // Try to send message to parent window
                window.opener.postMessage({
                  type: 'clickup_oauth_success',
                  data: {
                    access_token: '${tokenData.access_token?.substring(0, 20)}...',
                    timestamp: new Date().toISOString()
                  }
                }, '*');
                
                // Try to call refresh function if it exists
                if (window.opener.location && window.opener.location.href.includes('/settings')) {
                  window.opener.location.reload();
                }
              } catch (e) {
                console.log('Could not communicate with parent window:', e);
              }
            }
            
            // Auto close after 3 seconds
            setTimeout(() => {
              window.close();
            }, 3000);
            
            // Also try to close immediately if it's a popup
            if (window.opener) {
              setTimeout(() => {
                window.close();
              }, 1000);
            }
          </script>
        </body>
      </html>
    `,
      {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      }
    );
  } catch (error) {
    console.error("ClickUp OAuth callback error:", error);

    // Get the base URL for error redirect
    const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;

    return NextResponse.redirect(
      `${baseUrl}/nl/settings?error=callback_error&message=${encodeURIComponent("OAuth callback failed")}`
    );
  }
}
