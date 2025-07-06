"use client";

import React, { useState, useEffect } from "react";
import ApiCredentialsInterface from "@/components/command-center/api-credentials-interface";
import FuturisticSidebar from "@/components/fortune-500/futuristic-sidebar";
import { ArrowLeft, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

interface SettingsPageClientProps {
  locale: string;
}

export default function SettingsPageClient({
  locale,
}: SettingsPageClientProps) {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState("settings");

  // Check if in demo mode via URL parameter
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const demoParam = urlParams.get("demo");
    const connected = urlParams.get("connected");
    const accessToken = urlParams.get("access_token");
    const success = urlParams.get("success");

    setIsDemoMode(demoParam === "true");

    // Handle OAuth success from URL (fallback)
    if (connected === "clickup" && accessToken && success === "true") {
      setSuccessMessage(
        `✅ ClickUp OAuth successful! Access token received: ${accessToken}`
      );

      // Auto-save the access token (if the full token is in URL)
      if (accessToken.length > 50) {
        saveAccessToken(accessToken);
      }

      // Clear URL parameters for cleaner URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }

    // Listen for OAuth messages from popup window
    const handleMessage = (event: MessageEvent) => {
      // ClickUp OAuth
      if (event.data?.type === "clickup_oauth_success") {
        setSuccessMessage(
          `✅ ClickUp OAuth successful! Access token received and saved to database.`
        );
        setRefreshKey(prev => prev + 1);

        // Clear any URL parameters for cleaner URL
        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      } else if (event.data?.type === "clickup_oauth_error") {
        setSuccessMessage(`❌ ClickUp OAuth failed: ${event.data.error}`);
      }

      // Instagram OAuth
      else if (event.data?.type === "instagram_oauth_success") {
        setSuccessMessage(
          `✅ Instagram OAuth successful! Access token received and saved to database.`
        );
        setRefreshKey(prev => prev + 1);
      } else if (event.data?.type === "instagram_oauth_error") {
        setSuccessMessage(`❌ Instagram OAuth failed: ${event.data.error}`);
      }

      // Facebook OAuth
      else if (event.data?.type === "facebook_oauth_success") {
        setSuccessMessage(
          `✅ Facebook OAuth successful! Access token received and saved to database.`
        );
        setRefreshKey(prev => prev + 1);
      } else if (event.data?.type === "facebook_oauth_error") {
        setSuccessMessage(`❌ Facebook OAuth failed: ${event.data.error}`);
      }

      // LinkedIn OAuth
      else if (event.data?.type === "linkedin_oauth_success") {
        setSuccessMessage(
          `✅ LinkedIn OAuth successful! Access token received and saved to database.`
        );
        setRefreshKey(prev => prev + 1);
      } else if (event.data?.type === "linkedin_oauth_error") {
        setSuccessMessage(`❌ LinkedIn OAuth failed: ${event.data.error}`);
      }

      // YouTube OAuth
      else if (event.data?.type === "youtube_oauth_success") {
        setSuccessMessage(
          `✅ YouTube OAuth successful! Access token received and saved to database.`
        );
        setRefreshKey(prev => prev + 1);
      } else if (event.data?.type === "youtube_oauth_error") {
        setSuccessMessage(`❌ YouTube OAuth failed: ${event.data.error}`);
      }

      // Blotato API
      else if (event.data?.type === "blotato_api_success") {
        setSuccessMessage(
          `✅ Blotato API successful! API key received and saved to database.`
        );
        setRefreshKey(prev => prev + 1);
      } else if (event.data?.type === "blotato_api_error") {
        setSuccessMessage(`❌ Blotato API failed: ${event.data.error}`);
      }
    };

    window.addEventListener("message", handleMessage);

    // Cleanup
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const saveAccessToken = async (token: string) => {
    try {
      const response = await fetch("/api/command-center/credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "save",
          providerId: "clickup",
          credentialId: "clickup_access_token",
          value: token,
        }),
      });

      if (response.ok) {
        console.log("✅ Access token saved successfully");
        setSuccessMessage(
          prev => prev + "\n💾 Access token saved to database!"
        );
        // Force credentials refresh
        setRefreshKey(prev => prev + 1);
      } else {
        console.error("❌ Failed to save access token");
      }
    } catch (error) {
      console.error("❌ Error saving access token:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/5 via-transparent to-purple-500/5" />
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid-16" />

      <div className="flex h-screen relative z-10">
        {/* Sidebar */}
        <FuturisticSidebar
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          userRole={isDemoMode ? "admin" : "admin"}
        />

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-slate-950/95 backdrop-blur-xl border-b border-cyan-500/20 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                {/* Back to Command Center */}
                <button
                  onClick={() =>
                    window.open(`/${locale}/command-center?demo=true`, "_blank")
                  }
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-600/50 hover:bg-slate-700/50 hover:border-slate-500/50 transition-all text-slate-300 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="text-sm">Command Center</span>
                </button>

                <div className="flex items-center gap-3">
                  <Settings className="h-8 w-8 text-cyan-400" />
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                      Command Center Settings
                    </h2>
                    <p className="text-slate-400 text-sm">
                      Configure API credentials and integrations
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-green-400 text-sm font-medium">
                    Settings Active
                  </span>
                </div>

                <div className="text-right">
                  <div className="text-cyan-400 font-mono text-lg">
                    {new Date().toLocaleTimeString("en-US", {
                      hour12: false,
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </div>
                  <div className="text-slate-400 text-xs">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              {/* Success Message */}
              {successMessage && (
                <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                    <div className="font-semibold">OAuth Success!</div>
                  </div>
                  <pre className="mt-2 text-sm whitespace-pre-wrap">
                    {successMessage}
                  </pre>
                  <button
                    onClick={() => setSuccessMessage(null)}
                    className="mt-3 text-xs text-green-300 hover:text-green-200 underline"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              <ApiCredentialsInterface
                key={refreshKey}
                className="w-full"
                onCredentialUpdate={(provider, credential, status) => {
                  console.log(
                    `✅ [Settings] Credential updated: ${provider}.${credential} -> ${status}`
                  );
                  // Force refresh on any credential update
                  setRefreshKey(prev => prev + 1);
                }}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
