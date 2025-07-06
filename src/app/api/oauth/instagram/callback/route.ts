import { NextRequest, NextResponse } from "next/server";
import { credentialsDatabaseService } from "@/lib/command-center/credentials-database-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;

    console.log("Instagram OAuth callback:", {
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
          <head><title>Instagram OAuth Error</title></head>
          <body style="font-family: system-ui, sans-serif; text-align: center; padding: 50px; background: #fee; color: #c33;">
            <h2>❌ Instagram OAuth Error</h2>
            <p>Error: ${error}</p>
            <p style="font-size: 12px;">This window will close in 3 seconds...</p>
            <script>
              if (window.opener) window.opener.postMessage({type: 'instagram_oauth_error', error: '${error}'}, '*');
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
          <head><title>Instagram OAuth Error</title></head>
          <body style="font-family: system-ui, sans-serif; text-align: center; padding: 50px; background: #fee; color: #c33;">
            <h2>❌ Missing Authorization Code</h2>
            <p>No authorization code received from Instagram.</p>
            <p style="font-size: 12px;">This window will close in 3 seconds...</p>
            <script>
              if (window.opener) window.opener.postMessage({type: 'instagram_oauth_error', error: 'missing_code'}, '*');
              setTimeout(() => window.close(), 3000);
            </script>
          </body>
        </html>
      `,
        { status: 400, headers: { "Content-Type": "text/html" } }
      );
    }

    // Get Instagram credentials from database
    const provider = await credentialsDatabaseService.getProvider("instagram");
    if (!provider) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head><title>Instagram Configuration Error</title></head>
          <body style="font-family: system-ui, sans-serif; text-align: center; padding: 50px; background: #fee; color: #c33;">
            <h2>❌ Configuration Error</h2>
            <p>Instagram provider not found. Please configure Instagram credentials first.</p>
            <p style="font-size: 12px;">This window will close in 3 seconds...</p>
            <script>
              if (window.opener) window.opener.postMessage({type: 'instagram_oauth_error', error: 'provider_not_found'}, '*');
              setTimeout(() => window.close(), 3000);
            </script>
          </body>
        </html>
      `,
        { status: 404, headers: { "Content-Type": "text/html" } }
      );
    }

    // Extract credentials
    const appIdCredential = provider.credentials.find(
      (c: any) => c.id === "instagram_app_id"
    );
    const appSecretCredential = provider.credentials.find(
      (c: any) => c.id === "instagram_app_secret"
    );

    if (!appIdCredential?.value || !appSecretCredential?.value) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head><title>Instagram Configuration Error</title></head>
          <body style="font-family: system-ui, sans-serif; text-align: center; padding: 50px; background: #fee; color: #c33;">
            <h2>❌ Configuration Error</h2>
            <p>Please configure both App ID and App Secret in settings first.</p>
            <p style="font-size: 12px;">This window will close in 3 seconds...</p>
            <script>
              if (window.opener) window.opener.postMessage({type: 'instagram_oauth_error', error: 'credentials_incomplete'}, '*');
              setTimeout(() => window.close(), 3000);
            </script>
          </body>
        </html>
      `,
        { status: 400, headers: { "Content-Type": "text/html" } }
      );
    }

    // Exchange code for access token
    const tokenResponse = await fetch(
      "https://api.instagram.com/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: appIdCredential.value,
          client_secret: appSecretCredential.value,
          grant_type: "authorization_code",
          redirect_uri: `${baseUrl}/api/oauth/instagram/callback`,
          code,
        }),
      }
    );

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Instagram token exchange failed:", errorText);
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head><title>Instagram OAuth Error</title></head>
          <body style="font-family: system-ui, sans-serif; text-align: center; padding: 50px; background: #fee; color: #c33;">
            <h2>❌ Token Exchange Failed</h2>
            <p>Failed to exchange code for access token.</p>
            <p style="font-size: 12px;">This window will close in 3 seconds...</p>
            <script>
              if (window.opener) window.opener.postMessage({type: 'instagram_oauth_error', error: 'token_exchange_failed'}, '*');
              setTimeout(() => window.close(), 3000);
            </script>
          </body>
        </html>
      `,
        { status: 400, headers: { "Content-Type": "text/html" } }
      );
    }

    const tokenData = await tokenResponse.json();
    console.log("Instagram token received:", {
      access_token: tokenData.access_token?.substring(0, 10) + "...",
      user_id: tokenData.user_id,
    });

    // Save access token to database
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
            providerId: "instagram",
            credentialId: "instagram_access_token",
            value: tokenData.access_token,
          }),
        }
      );

      if (saveResponse.ok) {
        console.log("✅ Instagram access token saved to database");
      } else {
        console.error("❌ Failed to save Instagram access token");
      }
    } catch (error) {
      console.error("❌ Error saving Instagram access token:", error);
    }

    // Return success page
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Instagram OAuth Success</title>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: system-ui, sans-serif; 
              background: linear-gradient(135deg, #E1306C 0%, #F56040 100%);
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
            <div class="success-icon">📸</div>
            <div class="message">Instagram OAuth Successful!</div>
            <div class="details">
              Access token received and saved.<br>
              Your Instagram integration is now active.
            </div>
            <div class="auto-close">
              This window will close automatically in 3 seconds...
            </div>
          </div>
          
          <script>
            if (window.opener) {
              try {
                window.opener.postMessage({
                  type: 'instagram_oauth_success',
                  data: {
                    access_token: '${tokenData.access_token?.substring(0, 20)}...',
                    user_id: '${tokenData.user_id}',
                    timestamp: new Date().toISOString()
                  }
                }, '*');
                
                if (window.opener.location && window.opener.location.href.includes('/settings')) {
                  window.opener.location.reload();
                }
              } catch (e) {
                console.log('Could not communicate with parent window:', e);
              }
            }
            
            setTimeout(() => window.close(), 3000);
            if (window.opener) setTimeout(() => window.close(), 1000);
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
    console.error("Instagram OAuth callback error:", error);

    const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;

    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head><title>Instagram OAuth Error</title></head>
        <body style="font-family: system-ui, sans-serif; text-align: center; padding: 50px; background: #fee; color: #c33;">
          <h2>❌ OAuth Callback Failed</h2>
          <p>An unexpected error occurred.</p>
          <p style="font-size: 12px;">This window will close in 3 seconds...</p>
          <script>
            if (window.opener) window.opener.postMessage({type: 'instagram_oauth_error', error: 'callback_error'}, '*');
            setTimeout(() => window.close(), 3000);
          </script>
        </body>
      </html>
    `,
      { status: 500, headers: { "Content-Type": "text/html" } }
    );
  }
}
