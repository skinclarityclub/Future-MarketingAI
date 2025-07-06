/**
 * Admin Branding Management API
 * Task 36.4: API endpoints for tenant branding management
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { TenantBrandingService } from "@/lib/branding/tenant-branding-service";

// Create Supabase client
const createSupabaseClient = async () => {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
};

// GET - Get tenant branding configuration
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tenantId = searchParams.get("tenant_id");
    const action = searchParams.get("action");

    if (!tenantId) {
      return NextResponse.json(
        { error: "Tenant ID is required" },
        { status: 400 }
      );
    }

    const brandingService = new TenantBrandingService();

    switch (action) {
      case "config":
        const config = await brandingService.getTenantBrandingConfig(tenantId);
        return NextResponse.json({
          success: true,
          data: config,
        });

      case "assets":
        const assetType = searchParams.get("asset_type");
        const assets = await brandingService.getTenantBrandingAssets(
          tenantId,
          assetType || undefined
        );
        return NextResponse.json({
          success: true,
          data: assets,
        });

      case "themes":
        const includePublic = searchParams.get("include_public") !== "false";
        const themes = await brandingService.getThemePresets(
          tenantId,
          includePublic
        );
        return NextResponse.json({
          success: true,
          data: themes,
        });

      case "components":
        const componentType = searchParams.get("component_type");
        const location = searchParams.get("location");
        const components = await brandingService.getComponentConfigs(
          tenantId,
          componentType || undefined,
          location || undefined
        );
        return NextResponse.json({
          success: true,
          data: components,
        });

      case "analytics":
        const startDate = searchParams.get("start_date");
        const endDate = searchParams.get("end_date");
        const analytics = await brandingService.getBrandingAnalytics(
          tenantId,
          startDate ? new Date(startDate) : undefined,
          endDate ? new Date(endDate) : undefined
        );
        return NextResponse.json({
          success: true,
          data: analytics,
        });

      default:
        // Default: get complete branding configuration
        const completeConfig =
          await brandingService.getTenantBrandingConfig(tenantId);
        return NextResponse.json({
          success: true,
          data: completeConfig,
        });
    }
  } catch (error) {
    console.error("Branding GET API error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch branding data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST - Create or update branding configurations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, tenant_id, ...data } = body;

    if (!tenant_id) {
      return NextResponse.json(
        { error: "Tenant ID is required" },
        { status: 400 }
      );
    }

    const brandingService = new TenantBrandingService();

    switch (action) {
      case "update_config":
        const configId = await brandingService.upsertTenantBrandingConfig({
          tenant_id,
          ...data,
        });

        if (!configId) {
          return NextResponse.json(
            { error: "Failed to update branding configuration" },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          data: { id: configId },
        });

      case "upload_asset":
        const assetId = await brandingService.uploadBrandingAsset({
          tenant_id,
          ...data,
        });

        if (!assetId) {
          return NextResponse.json(
            { error: "Failed to upload branding asset" },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          data: { id: assetId },
        });

      case "create_theme":
        const themeId = await brandingService.upsertThemePreset({
          tenant_id,
          ...data,
        });

        if (!themeId) {
          return NextResponse.json(
            { error: "Failed to create theme preset" },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          data: { id: themeId },
        });

      case "apply_theme":
        const { preset_id } = data;
        if (!preset_id) {
          return NextResponse.json(
            { error: "Preset ID is required" },
            { status: 400 }
          );
        }

        const success = await brandingService.applyThemePreset(
          tenant_id,
          preset_id
        );

        if (!success) {
          return NextResponse.json(
            { error: "Failed to apply theme preset" },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "Theme preset applied successfully",
        });

      case "update_component":
        const componentId = await brandingService.upsertComponentConfig({
          tenant_id,
          ...data,
        });

        if (!componentId) {
          return NextResponse.json(
            { error: "Failed to update component configuration" },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          data: { id: componentId },
        });

      case "track_usage":
        const { page_views, asset_loads, theme_switches } = data;
        await brandingService.trackBrandingUsage(
          tenant_id,
          page_views || 1,
          asset_loads || 0,
          theme_switches || 0
        );

        return NextResponse.json({
          success: true,
          message: "Usage tracked successfully",
        });

      case "create_default":
        const { company_name } = data;
        const defaultId = await brandingService.createDefaultBranding(
          tenant_id,
          company_name
        );

        if (!defaultId) {
          return NextResponse.json(
            { error: "Failed to create default branding" },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          data: { id: defaultId },
        });

      default:
        return NextResponse.json(
          { error: "Invalid action specified" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Branding POST API error:", error);
    return NextResponse.json(
      {
        error: "Failed to process branding request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PUT - Update existing branding configurations
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, tenant_id, ...data } = body;

    if (!tenant_id) {
      return NextResponse.json(
        { error: "Tenant ID is required" },
        { status: 400 }
      );
    }

    const brandingService = new TenantBrandingService();

    switch (action) {
      case "bulk_update":
        // Update multiple aspects of branding at once
        const { config, assets, components } = data;
        const results = [];

        if (config) {
          const configId = await brandingService.upsertTenantBrandingConfig({
            tenant_id,
            ...config,
          });
          results.push({ type: "config", id: configId });
        }

        if (assets && Array.isArray(assets)) {
          for (const asset of assets) {
            const assetId = await brandingService.uploadBrandingAsset({
              tenant_id,
              ...asset,
            });
            results.push({ type: "asset", id: assetId });
          }
        }

        if (components && Array.isArray(components)) {
          for (const component of components) {
            const componentId = await brandingService.upsertComponentConfig({
              tenant_id,
              ...component,
            });
            results.push({ type: "component", id: componentId });
          }
        }

        return NextResponse.json({
          success: true,
          data: results,
        });

      case "reset_to_default":
        // Delete existing branding and create new default
        await brandingService.deleteTenantBranding(tenant_id);
        const defaultId = await brandingService.createDefaultBranding(
          tenant_id,
          data.company_name
        );

        return NextResponse.json({
          success: true,
          data: { id: defaultId },
          message: "Branding reset to default successfully",
        });

      default:
        return NextResponse.json(
          { error: "Invalid action specified" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Branding PUT API error:", error);
    return NextResponse.json(
      {
        error: "Failed to update branding",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete branding configurations
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tenantId = searchParams.get("tenant_id");
    const action = searchParams.get("action");

    if (!tenantId) {
      return NextResponse.json(
        { error: "Tenant ID is required" },
        { status: 400 }
      );
    }

    const brandingService = new TenantBrandingService();

    switch (action) {
      case "delete_all":
        const success = await brandingService.deleteTenantBranding(tenantId);

        if (!success) {
          return NextResponse.json(
            { error: "Failed to delete tenant branding" },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "Tenant branding deleted successfully",
        });

      default:
        return NextResponse.json(
          { error: "Invalid action specified" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Branding DELETE API error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete branding",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// OPTIONS - CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
