import { NextRequest, NextResponse } from "next/server";
import { credentialsDatabaseService } from "@/lib/command-center/credentials-database-service";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Testing credentials system...");

    // Test database connection
    const providers = await credentialsDatabaseService.getAllProviders();
    console.log("📊 Providers found:", providers.length);

    // Test ClickUp provider specifically
    const clickupProvider =
      await credentialsDatabaseService.getProvider("clickup");
    console.log("🔧 ClickUp provider:", {
      found: !!clickupProvider,
      credentialsCount: clickupProvider?.credentials?.length || 0,
      credentials: clickupProvider?.credentials?.map(c => ({
        id: c.id,
        name: c.name,
        status: c.status,
        hasValue: !!c.value,
      })),
    });

    // Test health status
    const health = await credentialsDatabaseService.getOverallHealth();
    console.log("💚 Health status:", health);

    return NextResponse.json({
      success: true,
      data: {
        providersCount: providers.length,
        clickupProvider: clickupProvider
          ? {
              id: clickupProvider.id,
              name: clickupProvider.name,
              credentialsCount: clickupProvider.credentials.length,
              credentials: clickupProvider.credentials.map(c => ({
                id: c.id,
                name: c.name,
                status: c.status,
                hasValue: !!c.value,
                required: c.required,
              })),
            }
          : null,
        health,
      },
    });
  } catch (error) {
    console.error("❌ Error testing credentials:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
