import { NextRequest, NextResponse } from "next/server";
import { CrossPlatformLearningEngine } from "@/lib/ml/cross-platform-learning-engine";

const crossPlatformEngine = new CrossPlatformLearningEngine();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get("action") || "analyze";

    switch (action) {
      case "analyze":
        const content = searchParams.get("content");
        const hashtags = searchParams.get("hashtags")?.split(",") || [];
        const platforms = searchParams.get("platforms")?.split(",") || [
          "instagram",
          "linkedin",
        ];
        const contentType = searchParams.get("content_type") || "general";
        const targetAudience = searchParams.get("target_audience");

        if (!content) {
          return NextResponse.json(
            {
              success: false,
              message: "Content parameter is required",
            },
            { status: 400 }
          );
        }

        const analysis =
          await crossPlatformEngine.analyzeCrossPlatformPerformance({
            content,
            hashtags,
            platforms,
            target_audience: targetAudience || undefined,
            content_type: contentType,
          });

        // Convert Map to object for JSON serialization
        const platformPredictionsObj = Object.fromEntries(
          analysis.platform_predictions
        );

        return NextResponse.json({
          success: true,
          data: {
            ...analysis,
            platform_predictions: platformPredictionsObj,
          },
          message: "Cross-platform analysis completed successfully",
        });

      case "universal-optimizations":
        const currentPlatforms =
          searchParams.get("current_platforms")?.split(",") || [];
        const targetPlatforms =
          searchParams.get("target_platforms")?.split(",") || [];
        const optimizationContent = searchParams.get("content");
        const optimizationContentType =
          searchParams.get("content_type") || "general";
        const optimizationAudience = searchParams.get("target_audience");

        if (!optimizationContent || currentPlatforms.length === 0) {
          return NextResponse.json(
            {
              success: false,
              message: "Content and current_platforms parameters are required",
            },
            { status: 400 }
          );
        }

        const optimizations =
          await crossPlatformEngine.generateUniversalOptimizations({
            content: optimizationContent,
            current_platforms: currentPlatforms,
            target_platforms: targetPlatforms,
            content_type: optimizationContentType,
            target_audience: optimizationAudience || undefined,
          });

        return NextResponse.json({
          success: true,
          data: optimizations,
          message: "Universal optimizations generated successfully",
        });

      case "benchmark":
        const benchmarkPlatforms =
          searchParams.get("platforms")?.split(",") || [];
        const benchmarkContentType =
          searchParams.get("content_type") || "general";
        const engagementRate = parseFloat(
          searchParams.get("engagement_rate") || "0.05"
        );
        const reach = parseFloat(searchParams.get("reach") || "1000");
        const conversionRate = parseFloat(
          searchParams.get("conversion_rate") || "0.02"
        );
        const industry = searchParams.get("industry");

        if (benchmarkPlatforms.length === 0) {
          return NextResponse.json(
            {
              success: false,
              message: "Platforms parameter is required",
            },
            { status: 400 }
          );
        }

        const benchmark = await crossPlatformEngine.benchmarkAgainstCompetitors(
          {
            platforms: benchmarkPlatforms,
            content_type: benchmarkContentType,
            current_performance: {
              engagement_rate: engagementRate,
              reach: reach,
              conversion_rate: conversionRate,
            },
            industry: industry || undefined,
          }
        );

        return NextResponse.json({
          success: true,
          data: benchmark,
          message: "Competitor benchmarking completed successfully",
        });

      case "demo":
        const demoAnalysis =
          await crossPlatformEngine.analyzeCrossPlatformPerformance({
            content:
              "Exciting news! We're launching our new AI-powered content optimization platform. Transform your social media strategy with intelligent insights and automated recommendations. #AI #ContentMarketing #SocialMedia #Innovation",
            hashtags: [
              "AI",
              "ContentMarketing",
              "SocialMedia",
              "Innovation",
              "Tech",
            ],
            platforms: ["instagram", "linkedin", "twitter", "facebook"],
            content_type: "announcement",
            target_audience: "business_professionals",
          });

        const demoPlatformPredictionsObj = Object.fromEntries(
          demoAnalysis.platform_predictions
        );

        return NextResponse.json({
          success: true,
          data: {
            ...demoAnalysis,
            platform_predictions: demoPlatformPredictionsObj,
          },
          message: "Demo cross-platform analysis completed successfully",
        });

      default:
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid action. Supported actions: analyze, universal-optimizations, benchmark, demo",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Cross-platform analysis API error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
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
      case "learn-from-success":
        const { performance_data } = body;

        if (!performance_data || !Array.isArray(performance_data)) {
          return NextResponse.json(
            {
              success: false,
              message: "performance_data array is required",
            },
            { status: 400 }
          );
        }

        await crossPlatformEngine.learnFromCrossPlatformSuccess(
          performance_data
        );

        return NextResponse.json({
          success: true,
          message: "Successfully learned from cross-platform performance data",
        });

      case "content-migration":
        const { source_content, target_platforms } = body;

        if (!source_content || !target_platforms) {
          return NextResponse.json(
            {
              success: false,
              message: "source_content and target_platforms are required",
            },
            { status: 400 }
          );
        }

        const migrationStrategy =
          await crossPlatformEngine.generateContentMigrationStrategy(
            source_content,
            target_platforms
          );

        return NextResponse.json({
          success: true,
          data: migrationStrategy,
          message: "Content migration strategy generated successfully",
        });

      case "analyze-comprehensive":
        const {
          content,
          hashtags = [],
          platforms = ["instagram", "linkedin"],
          content_type = "general",
          target_audience,
          include_migration = false,
          migration_targets = [],
        } = body;

        if (!content) {
          return NextResponse.json(
            {
              success: false,
              message: "Content is required",
            },
            { status: 400 }
          );
        }

        // Perform comprehensive cross-platform analysis
        const comprehensiveAnalysis =
          await crossPlatformEngine.analyzeCrossPlatformPerformance({
            content,
            hashtags,
            platforms,
            content_type,
            target_audience,
          });

        // Generate universal optimizations
        const universalOpts =
          await crossPlatformEngine.generateUniversalOptimizations({
            content,
            current_platforms: platforms,
            target_platforms: migration_targets,
            content_type,
            target_audience,
          });

        // Generate migration strategy if requested
        let migrationData = null;
        if (include_migration && migration_targets.length > 0) {
          const mockSourceContent = {
            platform: platforms[0],
            content,
            hashtags,
            performance_metrics: {
              platform: platforms[0],
              content_id: "demo-content",
              engagement_rate: 0.05,
              reach: 1000,
              impressions: 2000,
              shares: 50,
              saves: 25,
              comments: 15,
              clicks: 100,
              conversion_rate: 0.02,
              roi: 150,
              posting_time: new Date().toISOString(),
              content_type,
              hashtags,
              audience_segment: target_audience || "general",
            },
          };

          migrationData =
            await crossPlatformEngine.generateContentMigrationStrategy(
              mockSourceContent,
              migration_targets
            );
        }

        // Convert Map to object for JSON serialization
        const comprehensivePlatformPredictionsObj = Object.fromEntries(
          comprehensiveAnalysis.platform_predictions
        );

        return NextResponse.json({
          success: true,
          data: {
            cross_platform_analysis: {
              ...comprehensiveAnalysis,
              platform_predictions: comprehensivePlatformPredictionsObj,
            },
            universal_optimizations: universalOpts,
            migration_strategy: migrationData,
          },
          message:
            "Comprehensive cross-platform analysis completed successfully",
        });

      default:
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid action. Supported actions: learn-from-success, content-migration, analyze-comprehensive",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Cross-platform analysis POST error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
