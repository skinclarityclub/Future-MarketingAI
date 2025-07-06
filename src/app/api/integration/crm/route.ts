import { NextRequest, NextResponse } from "next/server";

interface CRMIntegration {
  id: string;
  name: string;
  type: "hubspot" | "salesforce" | "pipedrive" | "custom";
  status: "connected" | "disconnected" | "error";
  apiKey?: string;
  lastSync?: Date;
  totalLeads?: number;
  errorCount?: number;
  config?: Record<string, any>;
}

interface LeadData {
  email: string;
  name?: string;
  company?: string;
  phone?: string;
  source: string;
  journeyStage?: string;
  roiCalculated?: number;
  metadata?: Record<string, any>;
}

// Mock CRM data (in production, this would come from a database)
const mockCRMIntegrations: CRMIntegration[] = [
  {
    id: "hubspot",
    name: "HubSpot",
    type: "hubspot",
    status: "connected",
    lastSync: new Date(Date.now() - 3600000),
    totalLeads: 1247,
    errorCount: 0,
    config: {
      apiKey: "hs_***hidden***",
      portalId: "12345678",
      pipeline: "marketing-qualified",
    },
  },
  {
    id: "salesforce",
    name: "Salesforce",
    type: "salesforce",
    status: "disconnected",
    errorCount: 3,
    config: {
      instanceUrl: "https://yourcompany.my.salesforce.com",
      clientId: "3MVG***hidden***",
    },
  },
  {
    id: "pipedrive",
    name: "Pipedrive",
    type: "pipedrive",
    status: "error",
    lastSync: new Date(Date.now() - 86400000),
    totalLeads: 892,
    errorCount: 12,
    config: {
      apiToken: "pd_***hidden***",
      companyDomain: "yourcompany",
    },
  },
];

// GET - Get all CRM integrations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const crmType = searchParams.get("type");
    const status = searchParams.get("status");

    let integrations = [...mockCRMIntegrations];

    // Filter by type if provided
    if (crmType) {
      integrations = integrations.filter(crm => crm.type === crmType);
    }

    // Filter by status if provided
    if (status) {
      integrations = integrations.filter(crm => crm.status === status);
    }

    // Calculate summary statistics
    const summary = {
      total: integrations.length,
      connected: integrations.filter(crm => crm.status === "connected").length,
      disconnected: integrations.filter(crm => crm.status === "disconnected")
        .length,
      errors: integrations.filter(crm => crm.status === "error").length,
      totalLeads: integrations.reduce(
        (sum, crm) => sum + (crm.totalLeads || 0),
        0
      ),
      totalErrors: integrations.reduce(
        (sum, crm) => sum + (crm.errorCount || 0),
        0
      ),
      healthScore:
        (integrations.filter(crm => crm.status === "connected").length /
          integrations.length) *
        100,
    };

    return NextResponse.json({
      success: true,
      summary,
      integrations,
    });
  } catch (error) {
    console.error("CRM integration fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST - Create new lead or test CRM connection
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, crmId, leadData, testConnection } = body;

    if (testConnection) {
      return await testCRMConnection(crmId);
    }

    if (action === "create_lead" && leadData) {
      return await createLead(crmId, leadData);
    }

    if (action === "sync_crm") {
      return await syncCRM(crmId);
    }

    return NextResponse.json(
      { success: false, error: "Invalid action or missing parameters" },
      { status: 400 }
    );
  } catch (error) {
    console.error("CRM integration POST error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PUT - Update CRM integration settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { crmId, config, status } = body;

    const crm = mockCRMIntegrations.find(c => c.id === crmId);
    if (!crm) {
      return NextResponse.json(
        { success: false, error: "CRM integration not found" },
        { status: 404 }
      );
    }

    // Update CRM configuration
    if (config) {
      crm.config = { ...crm.config, ...config };
    }

    if (status) {
      crm.status = status;
    }

    return NextResponse.json({
      success: true,
      message: "CRM integration updated successfully",
      integration: crm,
    });
  } catch (error) {
    console.error("CRM integration update error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Helper functions
async function testCRMConnection(crmId: string) {
  const crm = mockCRMIntegrations.find(c => c.id === crmId);
  if (!crm) {
    return NextResponse.json(
      { success: false, error: "CRM not found" },
      { status: 404 }
    );
  }

  // Simulate connection test
  await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));

  const success = Math.random() > 0.2; // 80% success rate

  if (success) {
    crm.status = "connected";
    crm.lastSync = new Date();
    crm.errorCount = 0;

    return NextResponse.json({
      success: true,
      message: `${crm.name} connection test successful`,
      crm,
    });
  } else {
    crm.status = "error";
    crm.errorCount = (crm.errorCount || 0) + 1;

    return NextResponse.json({
      success: false,
      message: `${crm.name} connection test failed`,
      error: "API authentication failed or service unavailable",
      crm,
    });
  }
}

async function createLead(crmId: string, leadData: LeadData) {
  const crm = mockCRMIntegrations.find(c => c.id === crmId);
  if (!crm) {
    return NextResponse.json(
      { success: false, error: "CRM not found" },
      { status: 404 }
    );
  }

  if (crm.status !== "connected") {
    return NextResponse.json(
      { success: false, error: "CRM is not connected" },
      { status: 400 }
    );
  }

  // Simulate lead creation
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1500 + 300));

  const success = Math.random() > 0.1; // 90% success rate

  if (success) {
    crm.totalLeads = (crm.totalLeads || 0) + 1;

    const leadId = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return NextResponse.json({
      success: true,
      message: "Lead created successfully",
      leadId,
      crm: crm.name,
      leadData: {
        ...leadData,
        id: leadId,
        createdAt: new Date(),
        status: "new",
      },
    });
  } else {
    crm.errorCount = (crm.errorCount || 0) + 1;

    return NextResponse.json({
      success: false,
      message: "Failed to create lead",
      error: "CRM API error or validation failed",
      leadData,
    });
  }
}

async function syncCRM(crmId: string) {
  const crm = mockCRMIntegrations.find(c => c.id === crmId);
  if (!crm) {
    return NextResponse.json(
      { success: false, error: "CRM not found" },
      { status: 404 }
    );
  }

  // Simulate sync process
  await new Promise(resolve =>
    setTimeout(resolve, Math.random() * 3000 + 1000)
  );

  const success = Math.random() > 0.15; // 85% success rate

  if (success) {
    crm.lastSync = new Date();
    const newLeads = Math.floor(Math.random() * 10) + 1;
    crm.totalLeads = (crm.totalLeads || 0) + newLeads;

    return NextResponse.json({
      success: true,
      message: "CRM sync completed successfully",
      syncResults: {
        newLeads,
        totalLeads: crm.totalLeads,
        lastSync: crm.lastSync,
      },
      crm,
    });
  } else {
    crm.errorCount = (crm.errorCount || 0) + 1;

    return NextResponse.json({
      success: false,
      message: "CRM sync failed",
      error: "Sync timeout or API rate limit exceeded",
      crm,
    });
  }
}
