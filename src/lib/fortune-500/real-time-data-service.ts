interface RealTimeDataSource {
  id: string;
  name: string;
  status: "connected" | "connecting" | "disconnected" | "error";
  lastUpdate: Date;
  data: any;
}

interface SystemMetrics {
  cpu: number;
  memory: number;
  network: number;
  uptime: number;
  activeConnections: number;
}

interface ROIMetrics {
  totalRevenue: number;
  marketingSpend: number;
  roi: number;
  conversionRate: number;
}

interface RealTimeDataState {
  dataSources: RealTimeDataSource[];
  systemMetrics: SystemMetrics;
  roiMetrics: ROIMetrics;
  alerts: Array<{
    id: string;
    type: "info" | "warning" | "error" | "critical";
    message: string;
    timestamp: Date;
    source: string;
  }>;
  isConnected: boolean;
  lastUpdated: Date;
}

class RealTimeDataService {
  private state: RealTimeDataState;
  private listeners: Array<(state: RealTimeDataState) => void> = [];

  constructor() {
    this.state = {
      dataSources: [
        {
          id: "clickup",
          name: "ClickUp Integration",
          status: "connected",
          lastUpdate: new Date(),
          data: { tasks: 342, completed: 198 },
        },
        {
          id: "n8n",
          name: "n8n Workflows",
          status: "connected",
          lastUpdate: new Date(),
          data: { workflows: 45, active: 38 },
        },
      ],
      systemMetrics: {
        cpu: 45,
        memory: 62,
        network: 78,
        uptime: 99.9,
        activeConnections: 24,
      },
      roiMetrics: {
        totalRevenue: 2450000,
        marketingSpend: 245000,
        roi: 23.5,
        conversionRate: 4.2,
      },
      alerts: [
        {
          id: "alert-1",
          type: "info",
          message:
            "Marketing campaign 'Q1 Lead Generation' exceeded ROI targets by 23.5%",
          timestamp: new Date(Date.now() - 300000),
          source: "Blotato",
        },
        {
          id: "alert-2",
          type: "warning",
          message:
            "12 ClickUp tasks are overdue and require immediate attention",
          timestamp: new Date(Date.now() - 180000),
          source: "ClickUp",
        },
        {
          id: "alert-3",
          type: "info",
          message:
            "n8n workflow 'Data Sync' completed successfully - 1,240 records processed",
          timestamp: new Date(Date.now() - 120000),
          source: "n8n",
        },
        {
          id: "alert-4",
          type: "info",
          message:
            "System performance optimal - all metrics within normal ranges",
          timestamp: new Date(Date.now() - 60000),
          source: "System Monitor",
        },
      ],
      isConnected: true,
      lastUpdated: new Date(),
    };
  }

  public subscribe(listener: (state: RealTimeDataState) => void): () => void {
    this.listeners.push(listener);
    listener(this.state);

    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public getState(): RealTimeDataState {
    return this.state;
  }

  public getSystemHealth(): "operational" | "warning" | "critical" {
    const { cpu, memory } = this.state.systemMetrics;

    if (cpu > 90 || memory > 90) {
      return "critical";
    } else if (cpu > 75 || memory > 75) {
      return "warning";
    } else {
      return "operational";
    }
  }

  public getActiveAlertsCount(): number {
    return this.state.alerts.filter(
      alert =>
        alert.type === "warning" ||
        alert.type === "error" ||
        alert.type === "critical"
    ).length;
  }
}

export const realTimeDataService = new RealTimeDataService();
export type { RealTimeDataState, SystemMetrics, ROIMetrics };
