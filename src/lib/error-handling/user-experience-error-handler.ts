/**
 * User Experience Error Handler
 * Task 62.5: User Experience & Post-Incident Analysis
 *
 * Provides user-friendly error messages and guidance based on error context
 */

import { logger, LogCategory } from "../logger";

export interface UserFriendlyError {
  id: string;
  title: string;
  message: string;
  description?: string;
  severity: "info" | "warning" | "error" | "critical";
  userActions: UserAction[];
  supportInfo?: SupportInfo;
  estimatedResolution?: string;
  preventionTips?: string[];
}

export interface UserAction {
  label: string;
  action: string;
  type: "button" | "link" | "retry" | "contact";
  url?: string;
  callbackData?: string;
  icon?: string;
}

export interface SupportInfo {
  ticketId?: string;
  contactEmail?: string;
  contactPhone?: string;
  chatAvailable?: boolean;
  escalationLevel?: "low" | "medium" | "high" | "critical";
}

export interface ErrorContext {
  errorId: string;
  errorType: string;
  severity: string;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  feature?: string;
  action?: string;
  retryCount?: number;
}

export class UserExperienceErrorHandler {
  private static instance: UserExperienceErrorHandler;
  private errorTemplates: Map<string, UserFriendlyError> = new Map();
  private userLanguage: string = "en";
  private supportContacts: SupportInfo = {
    contactEmail: "support@skc-bi.com",
    contactPhone: "+31-20-123-4567",
    chatAvailable: true,
  };

  private constructor() {
    this.initializeErrorTemplates();
  }

  public static getInstance(): UserExperienceErrorHandler {
    if (!UserExperienceErrorHandler.instance) {
      UserExperienceErrorHandler.instance = new UserExperienceErrorHandler();
    }
    return UserExperienceErrorHandler.instance;
  }

  /**
   * Convert system error to user-friendly error
   */
  public createUserFriendlyError(
    error: Error | any,
    context: ErrorContext
  ): UserFriendlyError {
    const errorId = context.errorId || this.generateErrorId();
    const template = this.getErrorTemplate(context.errorType, context.severity);

    const userFriendlyError: UserFriendlyError = {
      id: errorId,
      title: this.localizeText(template.title, context),
      message: this.localizeText(template.message, context),
      description: template.description
        ? this.localizeText(template.description, context)
        : undefined,
      severity: this.mapSeverity(context.severity),
      userActions: this.generateUserActions(context),
      supportInfo: this.getSupportInfo(context),
      estimatedResolution: this.getEstimatedResolution(context),
      preventionTips: this.getPreventionTips(context.errorType),
    };

    // Log the user-friendly error creation
    logger.info("User-friendly error created", {
      category: LogCategory.SYSTEM,
      component: "user_experience_error_handler",
      error_id: errorId,
      error_type: context.errorType,
      severity: context.severity,
    });

    return userFriendlyError;
  }

  /**
   * Generate contextual user actions
   */
  private generateUserActions(context: ErrorContext): UserAction[] {
    const actions: UserAction[] = [];

    // Add retry action for recoverable errors
    if (this.isRetriable(context.errorType) && (context.retryCount || 0) < 3) {
      actions.push({
        label: "Probeer Opnieuw",
        action: "retry",
        type: "retry",
        icon: "🔄",
      });
    }

    // Add refresh action for frontend errors
    if (
      context.errorType.includes("frontend") ||
      context.errorType.includes("ui")
    ) {
      actions.push({
        label: "Ververs Pagina",
        action: "refresh",
        type: "button",
        icon: "🔄",
      });
    }

    // Add contact support action for critical errors
    if (context.severity === "critical" || context.severity === "high") {
      actions.push({
        label: "Contact Ondersteuning",
        action: "contact_support",
        type: "contact",
        url: `mailto:${this.supportContacts.contactEmail}?subject=Error Report ${context.errorId}`,
        icon: "📞",
      });
    }

    // Add status page action
    actions.push({
      label: "Systeemstatus",
      action: "status_page",
      type: "link",
      url: "/status",
      icon: "📊",
    });

    // Add help documentation action
    actions.push({
      label: "Help Documentatie",
      action: "help",
      type: "link",
      url: "/help",
      icon: "📚",
    });

    return actions;
  }

  /**
   * Get support information based on error context
   */
  private getSupportInfo(context: ErrorContext): SupportInfo {
    const escalationLevel = this.getEscalationLevel(context.severity);

    return {
      ...this.supportContacts,
      ticketId: context.errorId,
      escalationLevel,
      chatAvailable: escalationLevel !== "critical", // Disable chat for critical issues
    };
  }

  /**
   * Get estimated resolution time
   */
  private getEstimatedResolution(context: ErrorContext): string {
    const resolutionTimes: Record<string, string> = {
      low: "5-15 minuten",
      medium: "15-60 minuten",
      high: "1-4 uur",
      critical: "30 minuten - 2 uur",
    };

    return resolutionTimes[context.severity] || "1-2 uur";
  }

  /**
   * Get prevention tips for error types
   */
  private getPreventionTips(errorType: string): string[] {
    const tips: Record<string, string[]> = {
      network: [
        "Controleer uw internetverbinding",
        "Probeer een andere browser",
        "Schakel VPN uit indien actief",
      ],
      authentication: [
        "Controleer uw inloggegevens",
        "Probeer uw wachtwoord te resetten",
        "Schakel two-factor authenticatie in",
      ],
      database: [
        "Sla uw werk op voordat u verder gaat",
        "Vermijd gelijktijdige sessies",
        "Gebruik de applicatie tijdens daluren",
      ],
      validation: [
        "Controleer alle verplichte velden",
        "Gebruik geldige formaten voor data",
        "Vermijd speciale karakters waar niet toegestaan",
      ],
    };

    return (
      tips[errorType] || [
        "Probeer de actie opnieuw",
        "Controleer uw invoer",
        "Neem contact op met ondersteuning indien het probleem zich herhaalt",
      ]
    );
  }

  /**
   * Initialize error templates for common error types
   */
  private initializeErrorTemplates(): void {
    const templates: Array<{ type: string; template: UserFriendlyError }> = [
      {
        type: "network",
        template: {
          id: "template_network",
          title: "Verbindingsprobleem",
          message:
            "Er is een probleem met de netwerkverbinding. Controleer uw internetverbinding en probeer het opnieuw.",
          severity: "warning",
          userActions: [],
        },
      },
      {
        type: "authentication",
        template: {
          id: "template_auth",
          title: "Authenticatie Vereist",
          message:
            "U moet ingelogd zijn om deze actie uit te voeren. Log in en probeer het opnieuw.",
          severity: "warning",
          userActions: [],
        },
      },
      {
        type: "authorization",
        template: {
          id: "template_authz",
          title: "Toegang Geweigerd",
          message:
            "U heeft niet de juiste rechten om deze actie uit te voeren. Neem contact op met uw beheerder.",
          severity: "error",
          userActions: [],
        },
      },
      {
        type: "database",
        template: {
          id: "template_db",
          title: "Service Tijdelijk Niet Beschikbaar",
          message:
            "De service is tijdelijk niet beschikbaar vanwege onderhoud. Probeer het over enkele minuten opnieuw.",
          severity: "error",
          userActions: [],
        },
      },
      {
        type: "validation",
        template: {
          id: "template_validation",
          title: "Ongeldige Invoer",
          message:
            "De ingevoerde gegevens zijn ongeldig. Controleer uw invoer en probeer het opnieuw.",
          severity: "warning",
          userActions: [],
        },
      },
      {
        type: "rate_limit",
        template: {
          id: "template_rate_limit",
          title: "Te Veel Verzoeken",
          message:
            "U heeft te veel verzoeken verstuurd. Wacht even voordat u het opnieuw probeert.",
          severity: "warning",
          userActions: [],
        },
      },
    ];

    templates.forEach(({ type, template }) => {
      this.errorTemplates.set(type, template);
    });
  }

  /**
   * Helper methods
   */
  private generateErrorId(): string {
    return `UE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getErrorTemplate(
    errorType: string,
    severity: string
  ): UserFriendlyError {
    return (
      this.errorTemplates.get(errorType) ||
      this.errorTemplates.get("default") || {
        id: "fallback",
        title: "Er is een fout opgetreden",
        message:
          "Er is een onverwachte fout opgetreden. Probeer het later opnieuw.",
        severity: "error" as any,
        userActions: [],
      }
    );
  }

  private localizeText(text: string, context: ErrorContext): string {
    // Simple text interpolation - could be extended with proper i18n
    return text
      .replace("{errorId}", context.errorId)
      .replace("{feature}", context.feature || "systeem")
      .replace("{action}", context.action || "actie");
  }

  private mapSeverity(
    systemSeverity: string
  ): "info" | "warning" | "error" | "critical" {
    const mapping: Record<string, "info" | "warning" | "error" | "critical"> = {
      low: "info",
      medium: "warning",
      high: "error",
      critical: "critical",
    };

    return mapping[systemSeverity] || "error";
  }

  private isRetriable(errorType: string): boolean {
    const retriableErrors = ["network", "database", "timeout", "rate_limit"];
    return retriableErrors.includes(errorType);
  }

  private getEscalationLevel(
    severity: string
  ): "low" | "medium" | "high" | "critical" {
    return severity as "low" | "medium" | "high" | "critical";
  }

  /**
   * Set user language for localization
   */
  public setUserLanguage(language: string): void {
    this.userLanguage = language;
  }

  /**
   * Update support contact information
   */
  public updateSupportContacts(contacts: Partial<SupportInfo>): void {
    this.supportContacts = { ...this.supportContacts, ...contacts };
  }
}

// Export singleton instance
export const userExperienceErrorHandler =
  UserExperienceErrorHandler.getInstance();
