import { NextRequest, NextResponse } from "next/server";

interface BudgetItem {
  id: string;
  category: string;
  department: string;
  subcategory: string;
  budgeted_amount: number;
  actual_amount: number;
  variance: number;
  variance_percentage: number;
  period: string;
  status: "on_track" | "over_budget" | "under_budget" | "critical";
  forecast: number;
  ytd_budgeted: number;
  ytd_actual: number;
  last_updated: string;
  responsible_person: string;
  notes?: string;
  tags: string[];
}

interface BudgetResponse {
  data: BudgetItem[];
  summary: {
    total_budgeted: number;
    total_actual: number;
    total_variance: number;
    variance_percentage: number;
    categories_over_budget: number;
    categories_under_budget: number;
    categories_on_track: number;
    forecast_accuracy: number;
  };
  metadata: {
    count: number;
    period: string;
    timestamp: string;
  };
}

interface VarianceAlert {
  id: string;
  category: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  variance_amount: number;
  recommended_action: string;
  created_at: string;
}

// Enterprise mock budget data
const mockBudgetData: BudgetItem[] = [
  {
    id: "1",
    category: "Marketing",
    department: "Marketing & Sales",
    subcategory: "Digital Advertising",
    budgeted_amount: 50000,
    actual_amount: 47500,
    variance: -2500,
    variance_percentage: -5.0,
    period: "2024-Q1",
    status: "under_budget",
    forecast: 48000,
    ytd_budgeted: 150000,
    ytd_actual: 142500,
    last_updated: "2024-01-15T10:30:00Z",
    responsible_person: "Sarah Johnson",
    notes: "Optimized ad spend resulted in cost savings",
    tags: ["digital", "advertising", "performance"],
  },
  {
    id: "2",
    category: "Operations",
    department: "Operations",
    subcategory: "Software Licenses",
    budgeted_amount: 25000,
    actual_amount: 28500,
    variance: 3500,
    variance_percentage: 14.0,
    period: "2024-Q1",
    status: "over_budget",
    forecast: 29000,
    ytd_budgeted: 75000,
    ytd_actual: 85500,
    last_updated: "2024-01-14T14:20:00Z",
    responsible_person: "Mike Chen",
    notes: "Additional licenses required for new team members",
    tags: ["software", "licenses", "tools"],
  },
  {
    id: "3",
    category: "Human Resources",
    department: "HR",
    subcategory: "Recruitment",
    budgeted_amount: 15000,
    actual_amount: 15200,
    variance: 200,
    variance_percentage: 1.3,
    period: "2024-Q1",
    status: "on_track",
    forecast: 15100,
    ytd_budgeted: 45000,
    ytd_actual: 45600,
    last_updated: "2024-01-13T09:15:00Z",
    responsible_person: "Lisa Wang",
    notes: "Recruitment costs within expected range",
    tags: ["recruitment", "hiring", "talent"],
  },
  {
    id: "4",
    category: "Technology",
    department: "IT",
    subcategory: "Cloud Infrastructure",
    budgeted_amount: 35000,
    actual_amount: 42000,
    variance: 7000,
    variance_percentage: 20.0,
    period: "2024-Q1",
    status: "critical",
    forecast: 43000,
    ytd_budgeted: 105000,
    ytd_actual: 126000,
    last_updated: "2024-01-16T16:45:00Z",
    responsible_person: "David Rodriguez",
    notes: "Unexpected scaling requirements due to increased usage",
    tags: ["cloud", "infrastructure", "scaling"],
  },
  {
    id: "5",
    category: "Sales",
    department: "Marketing & Sales",
    subcategory: "Travel & Entertainment",
    budgeted_amount: 20000,
    actual_amount: 18500,
    variance: -1500,
    variance_percentage: -7.5,
    period: "2024-Q1",
    status: "under_budget",
    forecast: 19000,
    ytd_budgeted: 60000,
    ytd_actual: 55500,
    last_updated: "2024-01-12T11:30:00Z",
    responsible_person: "Emma Thompson",
    notes: "Reduced travel due to virtual meetings",
    tags: ["travel", "entertainment", "client"],
  },
  {
    id: "6",
    category: "Research & Development",
    department: "R&D",
    subcategory: "Product Development",
    budgeted_amount: 75000,
    actual_amount: 78500,
    variance: 3500,
    variance_percentage: 4.7,
    period: "2024-Q1",
    status: "over_budget",
    forecast: 79000,
    ytd_budgeted: 225000,
    ytd_actual: 235500,
    last_updated: "2024-01-17T13:20:00Z",
    responsible_person: "Alex Kim",
    notes: "Additional prototype development costs",
    tags: ["development", "innovation", "prototype"],
  },
];

const mockVarianceAlerts: VarianceAlert[] = [
  {
    id: "1",
    category: "Technology - Cloud Infrastructure",
    severity: "critical",
    message: "Cloud infrastructure costs are 20% over budget",
    variance_amount: 7000,
    recommended_action:
      "Review scaling policies and optimize resource allocation",
    created_at: "2024-01-16T16:45:00Z",
  },
  {
    id: "2",
    category: "Operations - Software Licenses",
    severity: "medium",
    message: "Software license costs exceeded budget by 14%",
    variance_amount: 3500,
    recommended_action: "Audit license usage and negotiate volume discounts",
    created_at: "2024-01-14T14:20:00Z",
  },
  {
    id: "3",
    category: "Research & Development - Product Development",
    severity: "low",
    message: "R&D spending slightly over budget by 4.7%",
    variance_amount: 3500,
    recommended_action: "Monitor prototype development costs closely",
    created_at: "2024-01-17T13:20:00Z",
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period");
    const department = searchParams.get("department");
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "10");
    const includeAlerts = searchParams.get("include_alerts") === "true";

    let filteredData = [...mockBudgetData];

    // Apply filters
    if (period && period !== "all") {
      filteredData = filteredData.filter(item => item.period === period);
    }

    if (department && department !== "all") {
      filteredData = filteredData.filter(
        item => item.department === department
      );
    }

    if (status) {
      filteredData = filteredData.filter(item => item.status === status);
    }

    if (category) {
      filteredData = filteredData.filter(item =>
        item.category.toLowerCase().includes(category.toLowerCase())
      );
    }

    // Apply limit
    filteredData = filteredData.slice(0, limit);

    // Calculate summary metrics
    const totalBudgeted = filteredData.reduce(
      (sum, item) => sum + item.budgeted_amount,
      0
    );
    const totalActual = filteredData.reduce(
      (sum, item) => sum + item.actual_amount,
      0
    );
    const totalVariance = totalActual - totalBudgeted;
    const variancePercentage =
      totalBudgeted > 0 ? (totalVariance / totalBudgeted) * 100 : 0;

    const categoriesOverBudget = filteredData.filter(
      item => item.status === "over_budget" || item.status === "critical"
    ).length;
    const categoriesUnderBudget = filteredData.filter(
      item => item.status === "under_budget"
    ).length;
    const categoriesOnTrack = filteredData.filter(
      item => item.status === "on_track"
    ).length;

    const response: BudgetResponse = {
      data: filteredData,
      summary: {
        total_budgeted: totalBudgeted,
        total_actual: totalActual,
        total_variance: totalVariance,
        variance_percentage: variancePercentage,
        categories_over_budget: categoriesOverBudget,
        categories_under_budget: categoriesUnderBudget,
        categories_on_track: categoriesOnTrack,
        forecast_accuracy: 92.5, // Mock accuracy metric
      },
      metadata: {
        count: filteredData.length,
        period: period || "all",
        timestamp: new Date().toISOString(),
      },
    };

    // Include alerts if requested
    if (includeAlerts) {
      (response as any).alerts = mockVarianceAlerts;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("[Budget API] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch budget data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, budget_item_id, adjustment_amount, notes } = body;

    // Mock budget adjustment logic
    const result = {
      success: true,
      action_taken: action,
      budget_item_id: budget_item_id,
      adjustment_amount: adjustment_amount,
      notes: notes,
      new_variance: Math.floor(Math.random() * 5000) - 2500, // Mock new variance
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Budget API] POST Error:", error);
    return NextResponse.json(
      {
        error: "Failed to process budget adjustment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, budgeted_amount, notes, responsible_person } = body;

    // Mock budget update logic
    const updatedItem = mockBudgetData.find(item => item.id === id);
    if (!updatedItem) {
      return NextResponse.json(
        { error: "Budget item not found" },
        { status: 404 }
      );
    }

    // Calculate new variance
    const newVariance =
      updatedItem.actual_amount -
      (budgeted_amount || updatedItem.budgeted_amount);
    const newVariancePercentage =
      budgeted_amount > 0 ? (newVariance / budgeted_amount) * 100 : 0;

    const result = {
      success: true,
      updated_item: {
        ...updatedItem,
        budgeted_amount: budgeted_amount || updatedItem.budgeted_amount,
        variance: newVariance,
        variance_percentage: newVariancePercentage,
        notes: notes || updatedItem.notes,
        responsible_person:
          responsible_person || updatedItem.responsible_person,
        last_updated: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Budget API] PUT Error:", error);
    return NextResponse.json(
      {
        error: "Failed to update budget item",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
