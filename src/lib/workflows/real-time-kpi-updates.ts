// Stub version of Real-Time KPI Updates (original temporarily disabled)
export class RealTimeKPIService {
  public async subscribeToKPIUpdates(onUpdate: (data: any) => void): Promise<string> {
    // Return mock channel ID
    return 'mock-channel-id';
  }

  public async unsubscribe(channelId: string): Promise<void> {
    // No-op
  }
}

export const realTimeKPIService = new RealTimeKPIService();

export function useRealTimeKPIUpdates(onUpdate: (data: any) => void) {
  // Return mock hook data
  return {
    isConnected: false,
    error: null,
    channelId: null,
  };
} 