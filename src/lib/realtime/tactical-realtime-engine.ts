// Stub version of Tactical Real-time Engine (original temporarily disabled)
export interface RealtimeDataStream {
  id: string;
  type: string;
  data: any;
  timestamp: Date;
}

export interface RealtimeInsight {
  id: string;
  type: string;
  message: string;
  confidence: number;
  timestamp: Date;
}

export interface RealtimeAlert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
}

export interface RealtimeConfig {
  bufferSize: number;
  updateInterval: number;
  enableML: boolean;
}

export class TacticalRealtimeEngine {
  private config: RealtimeConfig;

  constructor(config: RealtimeConfig) {
    this.config = config;
  }

  public async start(): Promise<void> {
    // No-op
  }

  public async stop(): Promise<void> {
    // No-op
  }

  public getInsights(): RealtimeInsight[] {
    return [];
  }

  public getAlerts(): RealtimeAlert[] {
    return [];
  }
}

// Export instance for compatibility
export const tacticalRealtimeEngine = new TacticalRealtimeEngine({
  bufferSize: 100,
  updateInterval: 1000,
  enableML: false,
}); 