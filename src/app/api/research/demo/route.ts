import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const endpoint = searchParams.get("endpoint") || "dashboard";

    switch (endpoint) {
      case "dashboard":
        return getDemoDashboard();

      case "trends":
        return getDemoTrends();

      case "competitors":
        return getDemoCompetitors();

      case "content-suggestions":
        return getDemoContentSuggestions();

      case "insights":
        return getDemoInsights();

      default:
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid endpoint. Supported: dashboard, trends, competitors, content-suggestions, insights",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Research Demo API error:", error);
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

function getDemoDashboard() {
  const dashboard = {
    summary: {
      timeframe: "week",
      lastUpdated: new Date().toISOString(),
      totalResearchItems: 47,
      trends: {
        total: 12,
        emerging: 3,
        recent: [
          {
            id: "trend_1",
            keyword: "AI-driven marketing automation",
            trendStrength: 85,
            momentum: "growing",
            confidence: 0.89,
          },
          {
            id: "trend_2",
            keyword: "Personalized content experiences",
            trendStrength: 92,
            momentum: "explosive",
            confidence: 0.95,
          },
          {
            id: "trend_3",
            keyword: "Voice search optimization",
            trendStrength: 67,
            momentum: "stable",
            confidence: 0.76,
          },
        ],
      },
      competitors: {
        analyzed: 8,
        recent: [
          {
            id: "comp_1",
            company_name: "TechCorp Solutions",
            industry: "Marketing Technology",
            threat_level: "medium",
            last_analyzed: "2024-01-15",
          },
          {
            id: "comp_2",
            company_name: "Digital Dynamics",
            industry: "Marketing Technology",
            threat_level: "high",
            last_analyzed: "2024-01-14",
          },
        ],
      },
      contentIdeas: {
        generated: 27,
        recent: [
          {
            id: "idea_1",
            title: "The Ultimate Guide to AI Marketing Automation",
            category: "blog",
            priority: "high",
            confidence: 0.92,
          },
          {
            id: "idea_2",
            title: "5 Voice Search Trends Reshaping Digital Marketing",
            category: "blog",
            priority: "medium",
            confidence: 0.78,
          },
        ],
      },
    },
    insights: [
      "AI-driven automation is becoming dominant in marketing technology",
      "Personalized content shows 3x higher engagement rates",
      "Voice search optimization is underutilized by competitors",
    ],
    recommendations: [
      "Focus on AI automation content for immediate impact",
      "Develop personalized content frameworks",
      "Create voice search optimization guides",
      "Monitor competitor AI adoption patterns",
      "Leverage high-confidence content ideas first",
    ],
  };

  return NextResponse.json({
    success: true,
    data: dashboard,
    message: "Demo research dashboard data retrieved successfully",
  });
}

function getDemoTrends() {
  const trends = [
    {
      id: "trend_1",
      keyword: "AI-driven marketing automation",
      trendStrength: 85,
      momentum: "growing",
      category: "technology",
      confidence: 0.89,
      weeklyGrowth: 15.3,
      searchVolume: 12400,
      competitionLevel: "medium",
      opportunities: [
        "Create educational content about AI implementation",
        "Develop case studies showcasing automation success",
        "Build comparison guides between AI tools",
      ],
    },
    {
      id: "trend_2",
      keyword: "Personalized content experiences",
      trendStrength: 92,
      momentum: "explosive",
      category: "content strategy",
      confidence: 0.95,
      weeklyGrowth: 28.7,
      searchVolume: 8900,
      competitionLevel: "high",
      opportunities: [
        "Develop personalization frameworks",
        "Create dynamic content templates",
        "Build audience segmentation guides",
      ],
    },
    {
      id: "trend_3",
      keyword: "Voice search optimization",
      trendStrength: 67,
      momentum: "stable",
      category: "SEO",
      confidence: 0.76,
      weeklyGrowth: 3.2,
      searchVolume: 5600,
      competitionLevel: "low",
      opportunities: [
        "Create voice search optimization guides",
        "Develop voice-friendly content templates",
        "Build local SEO strategies",
      ],
    },
  ];

  return NextResponse.json({
    success: true,
    data: {
      trends,
      summary: {
        totalTrends: trends.length,
        averageConfidence: 0.87,
        emergingTrends: trends.filter(
          t => t.momentum === "explosive" || t.momentum === "growing"
        ).length,
        highOpportunity: trends.filter(
          t => t.competitionLevel === "low" || t.competitionLevel === "medium"
        ).length,
      },
    },
    message: `Retrieved ${trends.length} trending topics`,
  });
}

function getDemoCompetitors() {
  const competitors = [
    {
      id: "comp_1",
      company_name: "TechCorp Solutions",
      brand_name: "TechCorp",
      industry: "Marketing Technology",
      company_size: "medium",
      threat_level: "medium",
      competitive_strength: "high",
      total_followers: 45000,
      average_engagement_rate: 3.8,
      last_analyzed: "2024-01-15",
      strengths: [
        "Strong thought leadership content",
        "Consistent posting schedule",
        "High-quality visual content",
      ],
      weaknesses: [
        "Limited video content",
        "Weak on emerging platforms",
        "Inconsistent brand voice",
      ],
    },
    {
      id: "comp_2",
      company_name: "Digital Dynamics",
      brand_name: "DigiDyne",
      industry: "Marketing Technology",
      company_size: "large",
      threat_level: "high",
      competitive_strength: "very_high",
      total_followers: 125000,
      average_engagement_rate: 5.2,
      last_analyzed: "2024-01-14",
      strengths: [
        "Excellent video content strategy",
        "Strong community engagement",
        "Advanced AI integration",
      ],
      weaknesses: [
        "Generic content approach",
        "Limited personalization",
        "Slow to adopt new trends",
      ],
    },
  ];

  return NextResponse.json({
    success: true,
    data: {
      competitors,
      summary: {
        totalCompetitors: competitors.length,
        averageThreatLevel: "medium",
        highThreatCompetitors: competitors.filter(
          c => c.threat_level === "high"
        ).length,
        totalFollowers: competitors.reduce(
          (sum, c) => sum + c.total_followers,
          0
        ),
      },
    },
    message: `Retrieved ${competitors.length} competitors`,
  });
}

function getDemoContentSuggestions() {
  const suggestions = [
    {
      id: "idea_1",
      title: "The Ultimate Guide to AI Marketing Automation",
      description:
        "Comprehensive guide covering AI implementation, tools comparison, and ROI measurement",
      category: "blog",
      content_type: "educational",
      priority: "high",
      confidence: 0.92,
      keywords: [
        "AI marketing",
        "marketing automation",
        "artificial intelligence",
      ],
      estimated_engagement: 850,
      estimated_reach: 12000,
      difficulty: "medium",
      trending_alignment: "immediate",
    },
    {
      id: "idea_2",
      title: "5 Voice Search Trends Reshaping Digital Marketing",
      description:
        "Analysis of voice search impact on marketing strategies and optimization techniques",
      category: "blog",
      content_type: "trend_analysis",
      priority: "medium",
      confidence: 0.78,
      keywords: ["voice search", "digital marketing", "SEO trends"],
      estimated_engagement: 620,
      estimated_reach: 8500,
      difficulty: "easy",
      trending_alignment: "soon",
    },
    {
      id: "idea_3",
      title: "Personalization vs Privacy: Finding the Right Balance",
      description:
        "Exploring how to deliver personalized experiences while respecting user privacy",
      category: "blog",
      content_type: "thought_leadership",
      priority: "high",
      confidence: 0.85,
      keywords: ["personalization", "privacy", "data protection", "GDPR"],
      estimated_engagement: 720,
      estimated_reach: 9800,
      difficulty: "hard",
      trending_alignment: "immediate",
    },
  ];

  return NextResponse.json({
    success: true,
    data: {
      suggestions,
      organized: {
        highPriority: suggestions.filter(s => s.priority === "high"),
        mediumPriority: suggestions.filter(s => s.priority === "medium"),
        highConfidence: suggestions.filter(s => s.confidence >= 0.8),
        immediateAction: suggestions.filter(
          s => s.trending_alignment === "immediate"
        ),
      },
      summary: {
        totalSuggestions: suggestions.length,
        averageConfidence: 0.85,
        highPriorityCount: suggestions.filter(s => s.priority === "high")
          .length,
        estimatedTotalReach: suggestions.reduce(
          (sum, s) => sum + s.estimated_reach,
          0
        ),
      },
    },
    message: `Retrieved ${suggestions.length} content suggestions`,
  });
}

function getDemoInsights() {
  const insights = {
    summary: {
      totalResearch: 47,
      timeframe: "week",
      periodStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      periodEnd: new Date().toISOString(),
      confidenceScore: 0.87,
    },
    keyFindings: [
      "AI marketing automation trending with 85% growth this week",
      "Personalized content shows 3x higher engagement rates than generic content",
      "Voice search optimization remains underutilized by 70% of competitors",
      "Video content drives 4x more engagement than static posts",
      "Long-form educational content performs best for B2B audiences",
    ],
    opportunities: [
      "Leverage AI automation trend for immediate content impact",
      "Develop personalized content frameworks for higher engagement",
      "Create voice search optimization guides in low-competition space",
      "Increase video content production for better reach",
      "Target competitor content gaps in emerging technologies",
    ],
    recommendations: [
      "Focus on high-confidence content ideas (>80% confidence) first",
      "Create content series around AI automation trend",
      "Develop competitor comparison content highlighting advantages",
      "Optimize posting times based on audience behavior analytics",
      "Build evergreen content library around stable trends",
    ],
    contentPerformancePredictions: {
      aiAutomationContent: {
        expectedEngagement: "+45%",
        expectedReach: "+120%",
        timeToImpact: "2-3 weeks",
      },
      personalizationContent: {
        expectedEngagement: "+38%",
        expectedReach: "+95%",
        timeToImpact: "1-2 weeks",
      },
      voiceSearchContent: {
        expectedEngagement: "+25%",
        expectedReach: "+60%",
        timeToImpact: "3-4 weeks",
      },
    },
  };

  return NextResponse.json({
    success: true,
    data: insights,
    message: "Generated comprehensive insights for week period",
  });
}
