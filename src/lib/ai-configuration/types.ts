// AI Configuration Types
export interface PersonalityProfile {
  id: string;
  name: string;
  description: string;
  tone: "friendly" | "professional" | "casual" | "authoritative" | "empathetic";
  style: "concise" | "detailed" | "conversational" | "technical" | "creative";
  formality: "formal" | "informal" | "semi-formal";

  // Advanced personality settings
  verbosity: "brief" | "moderate" | "verbose";
  emotionalTone: "neutral" | "enthusiastic" | "calm" | "energetic";
  technicalLevel: "beginner" | "intermediate" | "expert";

  // Context-specific adaptations
  dashboardContext?: {
    executive?: PersonalitySettings;
    customer?: PersonalitySettings;
    marketing?: PersonalitySettings;
    financial?: PersonalitySettings;
  };

  // Custom system prompt additions
  customPromptAdditions?: string;

  // Metadata
  created: string;
  updated: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface PersonalitySettings {
  emphasizeMetrics?: boolean;
  focusOnInsights?: boolean;
  suggestActions?: boolean;
  includeContext?: boolean;
}

export interface SystemMessageConfig {
  id: string;
  name: string;
  description: string;
  context:
    | "general"
    | "dashboard"
    | "chat"
    | "navigation"
    | "error"
    | "welcome";
  content: string;
  enabled: boolean;

  // Conditional triggers
  triggers?: {
    userRole?: string[];
    pageContext?: string[];
    timeOfDay?: "morning" | "afternoon" | "evening";
    firstVisit?: boolean;
  };

  // Localization
  localization?: {
    [locale: string]: string;
  };

  // Metadata
  created: string;
  updated: string;
  priority: number;
}

export interface AIConfiguration {
  personalityProfiles: PersonalityProfile[];
  systemMessages: SystemMessageConfig[];
  activeProfileId: string;

  // Global settings
  settings: {
    enablePersonalityAdaptation: boolean;
    enableContextAwareness: boolean;
    enableMLInsights: boolean;
    defaultLocale: string;
    fallbackProfile: string;
  };

  // Analytics and optimization
  analytics?: {
    responseQuality: number;
    userSatisfaction: number;
    conversationLength: number;
    successfulInteractions: number;
  };
}

// Service response types
export interface ConfigurationResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// Predefined personality templates
export const PERSONALITY_TEMPLATES: Partial<PersonalityProfile>[] = [
  {
    name: "Professional Business Analyst",
    description:
      "Zakelijke, data-gedreven communicatie met focus op ROI en KPI's",
    tone: "professional",
    style: "technical",
    formality: "formal",
    verbosity: "verbose",
    emotionalTone: "neutral",
    technicalLevel: "expert",
    customPromptAdditions:
      "Focus op zakelijke impact, ROI berekeningen en strategische aanbevelingen. Gebruik business terminologie en geef altijd concrete cijfers waar mogelijk.",
  },
  {
    name: "Friendly Assistant",
    description: "Toegankelijke, behulpzame communicatie voor alle gebruikers",
    tone: "friendly",
    style: "conversational",
    formality: "informal",
    verbosity: "moderate",
    emotionalTone: "enthusiastic",
    technicalLevel: "intermediate",
    customPromptAdditions:
      "Wees vriendelijk en behulpzaam. Leg complexe concepten uit in eenvoudige taal. Gebruik emojis waar gepast.",
  },
  {
    name: "Executive Summary Expert",
    description: "Bondige, strategische communicatie voor executives",
    tone: "authoritative",
    style: "concise",
    formality: "formal",
    verbosity: "brief",
    emotionalTone: "calm",
    technicalLevel: "expert",
    customPromptAdditions:
      "Geef altijd executive summaries. Focus op high-level insights, trends en strategische aanbevelingen. Minimale technische details.",
  },
  {
    name: "Customer Success Specialist",
    description: "Empathische, klantgerichte communicatie",
    tone: "empathetic",
    style: "conversational",
    formality: "semi-formal",
    verbosity: "moderate",
    emotionalTone: "calm",
    technicalLevel: "intermediate",
    customPromptAdditions:
      "Focus op klantervaring en customer journey. Geef praktische tips voor klanttevredenheid en retention.",
  },
  {
    name: "Data Scientist",
    description: "Technische, analytische communicatie voor data professionals",
    tone: "professional",
    style: "technical",
    formality: "semi-formal",
    verbosity: "verbose",
    emotionalTone: "neutral",
    technicalLevel: "expert",
    customPromptAdditions:
      "Gebruik statistische terminologie. Geef gedetailleerde methodologie uitleg. Focus op data kwaliteit, modellen en voorspellingen.",
  },
];

// Default system messages
export const DEFAULT_SYSTEM_MESSAGES: Omit<
  SystemMessageConfig,
  "id" | "created" | "updated"
>[] = [
  {
    name: "Welkom Bericht",
    description:
      "Eerste bericht dat gebruikers zien wanneer ze de AI assistant openen",
    context: "welcome",
    content:
      "Hallo! Ik ben je AI business assistant. Ik kan je helpen met data-analyse, business intelligence en strategische inzichten. Wat kan ik voor je betekenen?",
    enabled: true,
    priority: 1,
  },
  {
    name: "Dashboard Context",
    description: "Systeem bericht voor dashboard specifieke vragen",
    context: "dashboard",
    content:
      "Je bent een expert business intelligence assistant. Analyseer de huidige dashboard data en geef contextuele inzichten gebaseerd op de zichtbare metrics en KPI's.",
    enabled: true,
    priority: 2,
  },
  {
    name: "Chat Conversatie",
    description: "Algemeen systeem bericht voor chat interacties",
    context: "chat",
    content:
      "Je bent een behulpzame AI assistant die zakelijke vragen beantwoordt. Geef accurate, relevante informatie en stel follow-up vragen waar nuttig.",
    enabled: true,
    priority: 3,
  },
  {
    name: "Navigatie Assistentie",
    description: "Systeem bericht voor smart navigatie functies",
    context: "navigation",
    content:
      "Je helpt gebruikers navigeren door de dashboard. Stel intelligente navigatie voor gebaseerd op hun vragen en huidige context.",
    enabled: true,
    priority: 4,
  },
  {
    name: "Fout Afhandeling",
    description: "Bericht voor wanneer er fouten optreden",
    context: "error",
    content:
      "Sorry, er is een technische fout opgetreden. Probeer je vraag anders te formuleren of probeer het later opnieuw. Kan ik je op een andere manier helpen?",
    enabled: true,
    priority: 5,
  },
];

import { aiConfigApi } from "./api-client";

// AI Configuration Service
export class AIConfigurationService {
  private readonly STORAGE_KEY = "ai_configuration";

  async getPersonalityProfiles(): Promise<PersonalityProfile[]> {
    try {
      const data = await aiConfigApi.getPersonalityProfiles();

      // If no profiles exist, return default templates
      if (!data.profiles || data.profiles.length === 0) {
        return this.createDefaultProfiles();
      }

      return data.profiles;
    } catch (error) {
      console.warn("Failed to fetch from API, using localStorage:", error);
      return (
        this.getFromLocalStorage("personalities") ||
        this.createDefaultProfiles()
      );
    }
  }

  async getSystemMessages(): Promise<SystemMessageConfig[]> {
    try {
      const data = await aiConfigApi.getSystemMessages();

      if (!data.messages || data.messages.length === 0) {
        return this.createDefaultSystemMessages();
      }

      return data.messages;
    } catch (error) {
      console.warn("Failed to fetch from API, using localStorage:", error);
      return (
        this.getFromLocalStorage("systemMessages") ||
        this.createDefaultSystemMessages()
      );
    }
  }

  async getActivePersonalityProfile(): Promise<string> {
    try {
      const data = await aiConfigApi.getActiveProfile();
      return data.activeProfileId || "";
    } catch (error) {
      console.warn("Failed to fetch from API, using localStorage:", error);
      return this.getFromLocalStorage("activeProfile") || "";
    }
  }

  async saveConfigurations(config: {
    personalityProfiles: PersonalityProfile[];
    systemMessages: SystemMessageConfig[];
    activeProfileId: string;
  }): Promise<void> {
    try {
      await aiConfigApi.saveConfiguration(config);
    } catch (error) {
      console.warn("Failed to save to API, using localStorage:", error);
      this.saveToLocalStorage("personalities", config.personalityProfiles);
      this.saveToLocalStorage("systemMessages", config.systemMessages);
      this.saveToLocalStorage("activeProfile", config.activeProfileId);
    }
  }

  private createDefaultProfiles(): PersonalityProfile[] {
    const now = new Date().toISOString();

    return PERSONALITY_TEMPLATES.map((template, index) => ({
      id: `profile_${index + 1}`,
      name: template.name!,
      description: template.description!,
      tone: template.tone!,
      style: template.style!,
      formality: template.formality!,
      verbosity: template.verbosity!,
      emotionalTone: template.emotionalTone!,
      technicalLevel: template.technicalLevel!,
      customPromptAdditions: template.customPromptAdditions,
      created: now,
      updated: now,
      isDefault: true,
      isActive: index === 0,
    }));
  }

  private createDefaultSystemMessages(): SystemMessageConfig[] {
    const now = new Date().toISOString();

    return DEFAULT_SYSTEM_MESSAGES.map((template, index) => ({
      id: `message_${index + 1}`,
      ...template,
      created: now,
      updated: now,
    }));
  }

  private getFromLocalStorage(key: string): any {
    try {
      const stored = localStorage.getItem(`${this.STORAGE_KEY}_${key}`);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private saveToLocalStorage(key: string, data: any): void {
    try {
      localStorage.setItem(`${this.STORAGE_KEY}_${key}`, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  }
}
