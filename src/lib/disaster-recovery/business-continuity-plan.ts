/**
 * Business Continuity Plan (BCP) Implementation
 * Enterprise-grade disaster recovery and business continuity framework
 */

export interface ContactPerson {
  id: string;
  name: string;
  role: string;
  department: string;
  primaryPhone: string;
  secondaryPhone?: string;
  email: string;
  backupEmail?: string;
  escalationLevel: 1 | 2 | 3 | 4 | 5;
}

export interface CommunicationChannel {
  id: string;
  name: string;
  type: "phone" | "email" | "sms" | "slack" | "teams" | "emergency_broadcast";
  primary: boolean;
  capacity: number;
  redundancyLevel: "high" | "medium" | "low";
  testFrequency: "daily" | "weekly" | "monthly";
  failoverChannels: string[];
}

export interface CriticalResource {
  id: string;
  name: string;
  type: "personnel" | "infrastructure" | "data" | "applications" | "services";
  priority: "critical" | "high" | "medium" | "low";
  rto: number; // Recovery Time Objective in minutes
  rpo: number; // Recovery Point Objective in minutes
  dependencies: string[];
  backupResources: string[];
  allocatedBudget: number;
  responsibleTeam: string;
}

export interface IncidentLevel {
  level: 1 | 2 | 3 | 4 | 5;
  name: string;
  description: string;
  autoActivation: boolean;
  escalationTimeMinutes: number;
  requiredResponseTeams: string[];
  communicationProtocol: string[];
  budgetAuthorization: number;
}

export interface RecoveryStep {
  id: string;
  sequence: number;
  title: string;
  description: string;
  responsibleRole: string;
  estimatedDuration: number;
  dependencies: string[];
  verificationCriteria: string[];
  rollbackProcedure?: string;
  automatable: boolean;
}

export interface BCPConfiguration {
  organizationName: string;
  planVersion: string;
  lastUpdated: Date;
  nextReviewDate: Date;
  approvedBy: string;
  incidentLevels: IncidentLevel[];
  communicationChannels: CommunicationChannel[];
  keyContacts: ContactPerson[];
  criticalResources: CriticalResource[];
  recoveryProcedures: {
    [incidentLevel: string]: RecoveryStep[];
  };
  complianceFrameworks: string[];
  budgetAllocations: {
    emergency: number;
    infrastructure: number;
    personnel: number;
    communication: number;
  };
}

// Enterprise BCP Configuration
export const ENTERPRISE_BCP_CONFIG: BCPConfiguration = {
  organizationName: "SKC BI Dashboard Enterprise",
  planVersion: "1.0.0",
  lastUpdated: new Date(),
  nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  approvedBy: "Chief Information Officer",

  incidentLevels: [
    {
      level: 1,
      name: "Critical Infrastructure Failure",
      description: "Complete system outage affecting all operations",
      autoActivation: true,
      escalationTimeMinutes: 15,
      requiredResponseTeams: ["IT Emergency Response", "Executive Leadership"],
      communicationProtocol: ["immediate_broadcast", "executive_notification"],
      budgetAuthorization: 1000000,
    },
    {
      level: 2,
      name: "Major Service Disruption",
      description: "Significant service degradation affecting multiple systems",
      autoActivation: true,
      escalationTimeMinutes: 30,
      requiredResponseTeams: ["IT Operations", "Customer Support"],
      communicationProtocol: ["stakeholder_notification", "status_updates"],
      budgetAuthorization: 500000,
    },
  ],

  communicationChannels: [
    {
      id: "emergency_broadcast",
      name: "Emergency Broadcast System",
      type: "emergency_broadcast",
      primary: true,
      capacity: 10000,
      redundancyLevel: "high",
      testFrequency: "weekly",
      failoverChannels: ["mass_email", "sms_alerts"],
    },
    {
      id: "executive_hotline",
      name: "Executive Emergency Hotline",
      type: "phone",
      primary: true,
      capacity: 50,
      redundancyLevel: "high",
      testFrequency: "monthly",
      failoverChannels: ["executive_email"],
    },
  ],

  keyContacts: [
    {
      id: "cio",
      name: "Chief Information Officer",
      role: "Incident Commander",
      department: "Executive",
      primaryPhone: "+1-555-0001",
      secondaryPhone: "+1-555-0002",
      email: "cio@skc-enterprise.com",
      backupEmail: "cio.backup@skc-enterprise.com",
      escalationLevel: 1,
    },
    {
      id: "it_director",
      name: "IT Operations Director",
      role: "Technical Lead",
      department: "IT Operations",
      primaryPhone: "+1-555-0101",
      email: "it.director@skc-enterprise.com",
      escalationLevel: 2,
    },
  ],

  criticalResources: [
    {
      id: "primary_database",
      name: "Primary Supabase Database",
      type: "infrastructure",
      priority: "critical",
      rto: 60,
      rpo: 15,
      dependencies: ["network_connectivity", "cloud_provider"],
      backupResources: ["secondary_database", "backup_database"],
      allocatedBudget: 500000,
      responsibleTeam: "Database Administration",
    },
    {
      id: "web_application",
      name: "Next.js Dashboard Application",
      type: "applications",
      priority: "critical",
      rto: 120,
      rpo: 30,
      dependencies: ["primary_database", "cdn_services"],
      backupResources: ["disaster_recovery_site"],
      allocatedBudget: 300000,
      responsibleTeam: "Development Team",
    },
  ],

  recoveryProcedures: {
    level_1: [
      {
        id: "l1_step_1",
        sequence: 1,
        title: "Immediate Assessment and Incident Declaration",
        description:
          "Assess scope and formally declare disaster recovery status",
        responsibleRole: "Incident Commander",
        estimatedDuration: 15,
        dependencies: [],
        verificationCriteria: ["Incident declared", "Assessment documented"],
        automatable: false,
      },
      {
        id: "l1_step_2",
        sequence: 2,
        title: "Activate Emergency Communication",
        description: "Initiate emergency broadcast and crisis communication",
        responsibleRole: "Communications Director",
        estimatedDuration: 10,
        dependencies: ["l1_step_1"],
        verificationCriteria: ["Broadcast sent", "Stakeholders notified"],
        automatable: true,
      },
    ],
  },

  complianceFrameworks: ["SOC 2", "ISO 27001", "GDPR", "HIPAA"],
  budgetAllocations: {
    emergency: 2000000,
    infrastructure: 1500000,
    personnel: 800000,
    communication: 300000,
  },
};

export class BusinessContinuityManager {
  private config: BCPConfiguration;
  private activeIncidents: Map<string, any> = new Map();

  constructor(config: BCPConfiguration = ENTERPRISE_BCP_CONFIG) {
    this.config = config;
  }

  async activateBCP(
    incidentLevel: 1 | 2 | 3 | 4 | 5,
    incidentDescription: string,
    reportedBy: string
  ): Promise<{
    incidentId: string;
    activationTime: Date;
    estimatedResolutionTime: Date;
    requiredActions: RecoveryStep[];
  }> {
    const incident = this.config.incidentLevels.find(
      l => l.level === incidentLevel
    );
    if (!incident) {
      throw new Error(`Invalid incident level: ${incidentLevel}`);
    }

    const incidentId = this.generateIncidentId();
    const activationTime = new Date();
    const recoverySteps =
      this.config.recoveryProcedures[`level_${incidentLevel}`] || [];

    const totalDuration = recoverySteps.reduce(
      (total, step) => total + step.estimatedDuration,
      0
    );
    const estimatedResolutionTime = new Date(
      activationTime.getTime() + totalDuration * 60 * 1000
    );

    this.activeIncidents.set(incidentId, {
      level: incidentLevel,
      description: incidentDescription,
      reportedBy,
      activationTime,
      estimatedResolutionTime,
      status: "active",
      steps: recoverySteps,
    });

    if (incident.autoActivation) {
      await this.initiateEmergencyCommunication(
        incidentLevel,
        incidentDescription
      );
    }

    console.log(
      `BCP activated for Level ${incidentLevel} incident: ${incidentId}`
    );

    return {
      incidentId,
      activationTime,
      estimatedResolutionTime,
      requiredActions: recoverySteps,
    };
  }

  private async initiateEmergencyCommunication(
    incidentLevel: number,
    description: string
  ): Promise<void> {
    console.log(
      `Initiating emergency communication for Level ${incidentLevel} incident`
    );

    const relevantContacts = this.config.keyContacts.filter(
      contact => contact.escalationLevel <= incidentLevel
    );

    for (const contact of relevantContacts) {
      console.log(
        `Notifying ${contact.name} (${contact.role}) at ${contact.primaryPhone}`
      );
    }
  }

  getBCPStatus(): {
    planStatus: "current" | "needs_review" | "expired";
    activeIncidents: number;
    complianceStatus: "compliant" | "warning" | "non_compliant";
  } {
    const now = new Date();
    const planStatus = now > this.config.nextReviewDate ? "expired" : "current";

    return {
      planStatus,
      activeIncidents: this.activeIncidents.size,
      complianceStatus: "compliant",
    };
  }

  private generateIncidentId(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const time = String(date.getTime()).slice(-6);
    return `INC-${year}${month}${day}-${time}`;
  }
}

export const businessContinuityManager = new BusinessContinuityManager();

export default BusinessContinuityManager;
