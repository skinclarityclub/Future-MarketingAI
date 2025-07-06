/**
 * Task 71.10: Workflow Documentation Generator
 * Automated documentation generation for n8n workflows with versioning and maintenance
 */

import { logger } from "@/lib/logger";
import { auditTrailSystem, AuditEventType } from "./audit-trail-system";

// Documentation Types
export enum DocumentationType {
  WORKFLOW_OVERVIEW = "workflow_overview",
  TECHNICAL_SPECIFICATION = "technical_specification",
  USER_GUIDE = "user_guide",
  API_DOCUMENTATION = "api_documentation",
  TROUBLESHOOTING_GUIDE = "troubleshooting_guide",
  CHANGE_LOG = "change_log",
  DEPLOYMENT_GUIDE = "deployment_guide",
}

export enum DocumentationFormat {
  MARKDOWN = "markdown",
  HTML = "html",
  PDF = "pdf",
  JSON = "json",
  CONFLUENCE = "confluence",
}

// Workflow Schema Interfaces
export interface WorkflowNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, any>;
  credentials?: Record<string, string>;
  disabled?: boolean;
  notes?: string;
  webhook?: {
    method: string;
    path: string;
  };
}

export interface WorkflowConnection {
  source: string;
  sourceOutput: string;
  destination: string;
  destinationInput: string;
  type?: string;
}

export interface WorkflowMetadata {
  id: string;
  name: string;
  version: string;
  description?: string;
  author: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  category: string;
  complexity: "low" | "medium" | "high" | "critical";
  business_purpose: string;
  dependencies: string[];
  environment: "development" | "staging" | "production";
  status: "active" | "inactive" | "deprecated";
}

export interface WorkflowDocumentation {
  metadata: WorkflowMetadata;
  overview: string;
  business_purpose: string;
  technical_details: {
    nodes: WorkflowNode[];
    connections: WorkflowConnection[];
    triggers: any[];
    error_handling: any[];
  };
  deployment_info: {
    requirements: string[];
    environment_variables: Record<string, string>;
    credentials_needed: string[];
    api_endpoints: any[];
  };
  usage_guide: {
    how_to_trigger: string;
    input_format: any;
    output_format: any;
    examples: any[];
  };
  troubleshooting: {
    common_issues: any[];
    error_codes: Record<string, string>;
    debugging_steps: string[];
  };
  change_history: any[];
  related_workflows: string[];
}

class WorkflowDocumentationGenerator {
  private templateCache = new Map<DocumentationType, string>();
  private generatedDocs = new Map<string, WorkflowDocumentation>();

  constructor() {
    this.initializeTemplates();
  }

  // Main documentation generation method
  async generateDocumentation(
    workflowData: any,
    types: DocumentationType[] = [DocumentationType.WORKFLOW_OVERVIEW],
    format: DocumentationFormat = DocumentationFormat.MARKDOWN
  ): Promise<Map<DocumentationType, string>> {
    try {
      logger.info("Starting workflow documentation generation", {
        workflow_id: workflowData.id,
        documentation_types: types,
        format,
      });

      // Parse workflow data
      const parsedWorkflow = await this.parseWorkflowData(workflowData);

      // Generate documentation for each type
      const documentation = new Map<DocumentationType, string>();

      for (const type of types) {
        const doc = await this.generateDocumentationByType(
          parsedWorkflow,
          type,
          format
        );
        documentation.set(type, doc);
      }

      // Cache the generated documentation
      this.generatedDocs.set(workflowData.id, parsedWorkflow);

      // Record audit event
      await this.recordDocumentationEvent(workflowData.id, types, format);

      logger.info("Workflow documentation generation completed", {
        workflow_id: workflowData.id,
        documents_generated: types.length,
      });

      return documentation;
    } catch (error) {
      logger.error(
        "Failed to generate workflow documentation",
        error as Error,
        {
          workflow_id: workflowData?.id,
          types,
          format,
        }
      );
      throw error;
    }
  }

  // Generate comprehensive workflow overview
  async generateWorkflowOverview(
    workflowData: WorkflowDocumentation,
    format: DocumentationFormat = DocumentationFormat.MARKDOWN
  ): Promise<string> {
    const template = this.templateCache.get(
      DocumentationType.WORKFLOW_OVERVIEW
    );

    let overview = `# ${workflowData.metadata.name} - Workflow Overview\n\n`;
    overview += `**Version:** ${workflowData.metadata.version}\n`;
    overview += `**Author:** ${workflowData.metadata.author}\n`;
    overview += `**Last Updated:** ${workflowData.metadata.updated_at}\n`;
    overview += `**Status:** ${workflowData.metadata.status}\n`;
    overview += `**Complexity:** ${workflowData.metadata.complexity}\n\n`;

    overview += `## Description\n${workflowData.metadata.description || "No description provided"}\n\n`;

    overview += `## Business Purpose\n${workflowData.business_purpose}\n\n`;

    overview += `## Workflow Components\n`;
    overview += `- **Total Nodes:** ${workflowData.technical_details.nodes.length}\n`;
    overview += `- **Triggers:** ${workflowData.technical_details.triggers.length}\n`;
    overview += `- **Connections:** ${workflowData.technical_details.connections.length}\n\n`;

    // Node breakdown
    overview += `### Node Breakdown\n`;
    const nodeTypes = this.groupNodesByType(
      workflowData.technical_details.nodes
    );
    for (const [type, nodes] of nodeTypes) {
      overview += `- **${type}:** ${nodes.length} nodes\n`;
    }
    overview += `\n`;

    // Dependencies
    if (workflowData.metadata.dependencies.length > 0) {
      overview += `## Dependencies\n`;
      workflowData.metadata.dependencies.forEach(dep => {
        overview += `- ${dep}\n`;
      });
      overview += `\n`;
    }

    // Related workflows
    if (workflowData.related_workflows.length > 0) {
      overview += `## Related Workflows\n`;
      workflowData.related_workflows.forEach(workflow => {
        overview += `- ${workflow}\n`;
      });
      overview += `\n`;
    }

    return this.formatDocument(overview, format);
  }

  // Generate technical specification
  async generateTechnicalSpecification(
    workflowData: WorkflowDocumentation,
    format: DocumentationFormat = DocumentationFormat.MARKDOWN
  ): Promise<string> {
    let spec = `# ${workflowData.metadata.name} - Technical Specification\n\n`;

    // Workflow metadata
    spec += `## Metadata\n`;
    spec += `- **ID:** ${workflowData.metadata.id}\n`;
    spec += `- **Version:** ${workflowData.metadata.version}\n`;
    spec += `- **Environment:** ${workflowData.metadata.environment}\n`;
    spec += `- **Category:** ${workflowData.metadata.category}\n`;
    spec += `- **Tags:** ${workflowData.metadata.tags.join(", ")}\n\n`;

    // Node details
    spec += `## Node Configuration\n\n`;
    for (const node of workflowData.technical_details.nodes) {
      spec += `### ${node.name} (${node.type})\n`;
      spec += `- **ID:** ${node.id}\n`;
      spec += `- **Type Version:** ${node.typeVersion}\n`;
      spec += `- **Position:** [${node.position[0]}, ${node.position[1]}]\n`;

      if (node.disabled) {
        spec += `- **Status:** Disabled\n`;
      }

      if (node.notes) {
        spec += `- **Notes:** ${node.notes}\n`;
      }

      if (Object.keys(node.parameters).length > 0) {
        spec += `- **Parameters:**\n`;
        spec += this.formatParameters(node.parameters, 2);
      }

      if (node.credentials) {
        spec += `- **Credentials:** ${Object.keys(node.credentials).join(", ")}\n`;
      }

      spec += `\n`;
    }

    // Connection mapping
    spec += `## Connection Flow\n\n`;
    spec += this.generateConnectionDiagram(
      workflowData.technical_details.connections
    );

    // Error handling
    if (workflowData.technical_details.error_handling.length > 0) {
      spec += `## Error Handling\n\n`;
      workflowData.technical_details.error_handling.forEach(
        (handler, index) => {
          spec += `### Error Handler ${index + 1}\n`;
          spec += this.formatParameters(handler, 1);
          spec += `\n`;
        }
      );
    }

    return this.formatDocument(spec, format);
  }

  // Generate user guide
  async generateUserGuide(
    workflowData: WorkflowDocumentation,
    format: DocumentationFormat = DocumentationFormat.MARKDOWN
  ): Promise<string> {
    let guide = `# ${workflowData.metadata.name} - User Guide\n\n`;

    guide += `## Overview\n${workflowData.overview}\n\n`;

    // How to trigger
    guide += `## How to Use\n`;
    guide += `${workflowData.usage_guide.how_to_trigger}\n\n`;

    // Input format
    guide += `## Input Format\n`;
    if (workflowData.usage_guide.input_format) {
      guide += `\`\`\`json\n${JSON.stringify(workflowData.usage_guide.input_format, null, 2)}\n\`\`\`\n\n`;
    }

    // Output format
    guide += `## Output Format\n`;
    if (workflowData.usage_guide.output_format) {
      guide += `\`\`\`json\n${JSON.stringify(workflowData.usage_guide.output_format, null, 2)}\n\`\`\`\n\n`;
    }

    // Examples
    if (workflowData.usage_guide.examples.length > 0) {
      guide += `## Examples\n\n`;
      workflowData.usage_guide.examples.forEach((example, index) => {
        guide += `### Example ${index + 1}\n`;
        guide += `${example.description}\n\n`;
        if (example.input) {
          guide += `**Input:**\n\`\`\`json\n${JSON.stringify(example.input, null, 2)}\n\`\`\`\n\n`;
        }
        if (example.output) {
          guide += `**Output:**\n\`\`\`json\n${JSON.stringify(example.output, null, 2)}\n\`\`\`\n\n`;
        }
      });
    }

    return this.formatDocument(guide, format);
  }

  // Generate troubleshooting guide
  async generateTroubleshootingGuide(
    workflowData: WorkflowDocumentation,
    format: DocumentationFormat = DocumentationFormat.MARKDOWN
  ): Promise<string> {
    let guide = `# ${workflowData.metadata.name} - Troubleshooting Guide\n\n`;

    // Common issues
    if (workflowData.troubleshooting.common_issues.length > 0) {
      guide += `## Common Issues\n\n`;
      workflowData.troubleshooting.common_issues.forEach((issue, index) => {
        guide += `### ${index + 1}. ${issue.title}\n`;
        guide += `**Description:** ${issue.description}\n\n`;
        guide += `**Solution:**\n${issue.solution}\n\n`;
        if (issue.related_nodes) {
          guide += `**Related Nodes:** ${issue.related_nodes.join(", ")}\n\n`;
        }
      });
    }

    // Error codes
    if (Object.keys(workflowData.troubleshooting.error_codes).length > 0) {
      guide += `## Error Codes\n\n`;
      for (const [code, description] of Object.entries(
        workflowData.troubleshooting.error_codes
      )) {
        guide += `- **${code}:** ${description}\n`;
      }
      guide += `\n`;
    }

    // Debugging steps
    if (workflowData.troubleshooting.debugging_steps.length > 0) {
      guide += `## Debugging Steps\n\n`;
      workflowData.troubleshooting.debugging_steps.forEach((step, index) => {
        guide += `${index + 1}. ${step}\n`;
      });
      guide += `\n`;
    }

    return this.formatDocument(guide, format);
  }

  // Generate API documentation
  async generateAPIDocumentation(
    workflowData: WorkflowDocumentation,
    format: DocumentationFormat = DocumentationFormat.MARKDOWN
  ): Promise<string> {
    let apiDoc = `# ${workflowData.metadata.name} - API Documentation\n\n`;

    if (workflowData.deployment_info.api_endpoints.length === 0) {
      apiDoc += `This workflow does not expose any API endpoints.\n`;
      return this.formatDocument(apiDoc, format);
    }

    workflowData.deployment_info.api_endpoints.forEach((endpoint, index) => {
      apiDoc += `## Endpoint ${index + 1}: ${endpoint.path}\n\n`;
      apiDoc += `- **Method:** ${endpoint.method}\n`;
      apiDoc += `- **Path:** ${endpoint.path}\n`;

      if (endpoint.description) {
        apiDoc += `- **Description:** ${endpoint.description}\n`;
      }

      if (endpoint.parameters) {
        apiDoc += `\n### Parameters\n`;
        apiDoc += this.formatParameters(endpoint.parameters, 1);
      }

      if (endpoint.request_body) {
        apiDoc += `\n### Request Body\n`;
        apiDoc += `\`\`\`json\n${JSON.stringify(endpoint.request_body, null, 2)}\n\`\`\`\n`;
      }

      if (endpoint.responses) {
        apiDoc += `\n### Responses\n`;
        for (const [status, response] of Object.entries(endpoint.responses)) {
          apiDoc += `\n#### ${status}\n`;
          apiDoc += `\`\`\`json\n${JSON.stringify(response, null, 2)}\n\`\`\`\n`;
        }
      }

      apiDoc += `\n---\n\n`;
    });

    return this.formatDocument(apiDoc, format);
  }

  // Helper methods
  private async parseWorkflowData(
    workflowData: any
  ): Promise<WorkflowDocumentation> {
    // This would parse the raw n8n workflow JSON
    // For now, return a simplified structure
    return {
      metadata: {
        id: workflowData.id || "unknown",
        name: workflowData.name || "Unnamed Workflow",
        version: workflowData.version || "1.0.0",
        description: workflowData.description,
        author: workflowData.author || "Unknown",
        created_at: workflowData.createdAt || new Date().toISOString(),
        updated_at: workflowData.updatedAt || new Date().toISOString(),
        tags: workflowData.tags || [],
        category: workflowData.category || "General",
        complexity: this.assessComplexity(workflowData),
        business_purpose: workflowData.businessPurpose || "Not specified",
        dependencies: workflowData.dependencies || [],
        environment: workflowData.environment || "development",
        status: workflowData.status || "active",
      },
      overview: workflowData.overview || "No overview provided",
      business_purpose:
        workflowData.businessPurpose || "No business purpose specified",
      technical_details: {
        nodes: workflowData.nodes || [],
        connections: workflowData.connections || [],
        triggers: workflowData.triggers || [],
        error_handling: workflowData.errorHandling || [],
      },
      deployment_info: {
        requirements: workflowData.requirements || [],
        environment_variables: workflowData.environmentVariables || {},
        credentials_needed: workflowData.credentialsNeeded || [],
        api_endpoints: workflowData.apiEndpoints || [],
      },
      usage_guide: {
        how_to_trigger:
          workflowData.howToTrigger || "No trigger information provided",
        input_format: workflowData.inputFormat,
        output_format: workflowData.outputFormat,
        examples: workflowData.examples || [],
      },
      troubleshooting: {
        common_issues: workflowData.commonIssues || [],
        error_codes: workflowData.errorCodes || {},
        debugging_steps: workflowData.debuggingSteps || [],
      },
      change_history: workflowData.changeHistory || [],
      related_workflows: workflowData.relatedWorkflows || [],
    };
  }

  private async generateDocumentationByType(
    workflowData: WorkflowDocumentation,
    type: DocumentationType,
    format: DocumentationFormat
  ): Promise<string> {
    switch (type) {
      case DocumentationType.WORKFLOW_OVERVIEW:
        return this.generateWorkflowOverview(workflowData, format);
      case DocumentationType.TECHNICAL_SPECIFICATION:
        return this.generateTechnicalSpecification(workflowData, format);
      case DocumentationType.USER_GUIDE:
        return this.generateUserGuide(workflowData, format);
      case DocumentationType.TROUBLESHOOTING_GUIDE:
        return this.generateTroubleshootingGuide(workflowData, format);
      case DocumentationType.API_DOCUMENTATION:
        return this.generateAPIDocumentation(workflowData, format);
      default:
        throw new Error(`Unsupported documentation type: ${type}`);
    }
  }

  private assessComplexity(
    workflowData: any
  ): "low" | "medium" | "high" | "critical" {
    const nodeCount = workflowData.nodes?.length || 0;
    const connectionCount = workflowData.connections?.length || 0;
    const hasErrorHandling = (workflowData.errorHandling?.length || 0) > 0;
    const hasWebhooks =
      workflowData.nodes?.some((node: any) => node.webhook) || false;

    let complexity = 0;

    if (nodeCount > 20) complexity += 3;
    else if (nodeCount > 10) complexity += 2;
    else if (nodeCount > 5) complexity += 1;

    if (connectionCount > nodeCount * 1.5) complexity += 2;

    if (hasErrorHandling) complexity += 1;
    if (hasWebhooks) complexity += 1;

    if (complexity >= 6) return "critical";
    if (complexity >= 4) return "high";
    if (complexity >= 2) return "medium";
    return "low";
  }

  private groupNodesByType(nodes: WorkflowNode[]): Map<string, WorkflowNode[]> {
    const groups = new Map<string, WorkflowNode[]>();

    nodes.forEach(node => {
      const type = node.type;
      if (!groups.has(type)) {
        groups.set(type, []);
      }
      groups.get(type)!.push(node);
    });

    return groups;
  }

  private formatParameters(
    params: Record<string, any>,
    indent: number
  ): string {
    let formatted = "";
    const indentStr = "  ".repeat(indent);

    for (const [key, value] of Object.entries(params)) {
      if (typeof value === "object" && value !== null) {
        formatted += `${indentStr}- **${key}:**\n`;
        formatted += this.formatParameters(value, indent + 1);
      } else {
        formatted += `${indentStr}- **${key}:** ${value}\n`;
      }
    }

    return formatted;
  }

  private generateConnectionDiagram(connections: WorkflowConnection[]): string {
    let diagram = "";

    connections.forEach(conn => {
      diagram += `\`${conn.source}\` → \`${conn.destination}\`\n`;
    });

    return diagram + "\n";
  }

  private formatDocument(content: string, format: DocumentationFormat): string {
    switch (format) {
      case DocumentationFormat.MARKDOWN:
        return content;
      case DocumentationFormat.HTML:
        return this.markdownToHtml(content);
      case DocumentationFormat.JSON:
        return JSON.stringify({ content }, null, 2);
      default:
        return content;
    }
  }

  private markdownToHtml(markdown: string): string {
    // Simple markdown to HTML conversion
    return markdown
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")
      .replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>")
      .replace(/\*(.*)\*/gim, "<em>$1</em>")
      .replace(
        /```(\w+)?\n([\s\S]*?)```/gim,
        '<pre><code class="$1">$2</code></pre>'
      )
      .replace(/`([^`]+)`/gim, "<code>$1</code>")
      .replace(/\n/gim, "<br>");
  }

  private initializeTemplates(): void {
    // Initialize documentation templates
    // This would load templates from files or database
  }

  private async recordDocumentationEvent(
    workflowId: string,
    types: DocumentationType[],
    format: DocumentationFormat
  ): Promise<void> {
    await auditTrailSystem.recordAuditEvent({
      event_type: AuditEventType.SYSTEM_EVENT,
      workflow_id: workflowId,
      timestamp: new Date().toISOString(),
      event_data: {
        action: "documentation_generated",
        documentation_types: types,
        format,
        generated_at: new Date().toISOString(),
      },
      sensitivity_level: "internal",
      retention_period_days: 1095,
      data_classification: "documentation",
      business_impact: "low",
    });
  }
}

// Export singleton instance
export const workflowDocumentationGenerator =
  new WorkflowDocumentationGenerator();

// Export convenience functions
export const generateWorkflowDocumentation = (
  workflowData: any,
  types?: DocumentationType[],
  format?: DocumentationFormat
) =>
  workflowDocumentationGenerator.generateDocumentation(
    workflowData,
    types,
    format
  );
