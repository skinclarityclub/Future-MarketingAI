import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
  vi,
} from "vitest";
import {
  AutomatedFailoverManager,
  DEFAULT_FAILOVER_CONFIG,
  type FailoverConfiguration,
} from "./failover-manager";

// Mock console methods to avoid spam in test output
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  console.log = vi.fn();
  console.error = vi.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

describe("AutomatedFailoverManager", () => {
  let failoverManager: AutomatedFailoverManager;

  beforeEach(() => {
    // Create a fresh instance with deep-cloned config to avoid state pollution
    const freshConfig = JSON.parse(JSON.stringify(DEFAULT_FAILOVER_CONFIG));
    failoverManager = new AutomatedFailoverManager(freshConfig);
  });

  afterEach(async () => {
    // Clean up after each test
    await failoverManager.shutdown();
  });

  describe("Configuration", () => {
    it("should initialize with default configuration", () => {
      const metrics = failoverManager.getMetrics();
      expect(metrics.regions).toHaveLength(3);
      expect(metrics.currentActiveRegion).toBe("us-east-1");
      expect(metrics.totalFailovers).toBe(0);
    });

    it("should accept custom configuration", () => {
      const customConfig: FailoverConfiguration = {
        ...DEFAULT_FAILOVER_CONFIG,
        healthCheckInterval: 60,
        failoverThreshold: 5,
      };

      const customFailoverManager = new AutomatedFailoverManager(customConfig);
      const metrics = customFailoverManager.getMetrics();

      expect(metrics.regions).toHaveLength(3);
      expect(metrics.currentActiveRegion).toBe("us-east-1");
    });
  });

  describe("Initialization", () => {
    it("should initialize successfully", async () => {
      await expect(failoverManager.initialize()).resolves.not.toThrow();

      const metrics = failoverManager.getMetrics();
      expect(metrics.currentActiveRegion).toBe("us-east-1");
    });

    it("should validate configuration during initialization", async () => {
      const invalidConfig: FailoverConfiguration = {
        ...DEFAULT_FAILOVER_CONFIG,
        regions: [DEFAULT_FAILOVER_CONFIG.regions[0]], // Only one region
      };

      const invalidFailoverManager = new AutomatedFailoverManager(
        invalidConfig
      );

      await expect(invalidFailoverManager.initialize()).rejects.toThrow(
        "At least 2 regions required for failover"
      );
    });

    it("should validate health check interval", async () => {
      const invalidConfig: FailoverConfiguration = {
        ...DEFAULT_FAILOVER_CONFIG,
        healthCheckInterval: 5, // Too low
      };

      const invalidFailoverManager = new AutomatedFailoverManager(
        invalidConfig
      );

      await expect(invalidFailoverManager.initialize()).rejects.toThrow(
        "Health check interval must be at least 10 seconds"
      );
    });

    it("should validate primary region uniqueness", async () => {
      const invalidConfig: FailoverConfiguration = {
        ...DEFAULT_FAILOVER_CONFIG,
        regions: DEFAULT_FAILOVER_CONFIG.regions.map((region, _index) => ({
          ...region,
          priority: 1, // All regions have priority 1
        })),
      };

      const invalidFailoverManager = new AutomatedFailoverManager(
        invalidConfig
      );

      await expect(invalidFailoverManager.initialize()).rejects.toThrow(
        "Exactly one primary region (priority 1) required"
      );
    });
  });

  describe("Manual Failover", () => {
    beforeEach(async () => {
      const freshConfig = JSON.parse(JSON.stringify(DEFAULT_FAILOVER_CONFIG));
      failoverManager = new AutomatedFailoverManager(freshConfig);
      await failoverManager.initialize();
    });

    it("should execute manual failover successfully", async () => {
      const targetRegionId = "us-west-2";

      const event = await failoverManager.executeManualFailover(
        targetRegionId,
        "Test manual failover"
      );

      expect(event.type).toBe("failover");
      expect(event.toRegion).toBe(targetRegionId);
      expect(event.status).toBe("completed");

      const metrics = failoverManager.getMetrics();
      expect(metrics.currentActiveRegion).toBe(targetRegionId);
      expect(metrics.totalFailovers).toBe(1);
      expect(metrics.manualFailovers).toBe(1);
    });

    it("should fail when target region does not exist", async () => {
      await expect(
        failoverManager.executeManualFailover("non-existent", "Test")
      ).rejects.toThrow("Target region non-existent not found");
    });

    it("should fail when no current active region", async () => {
      // Create a fresh instance with no active regions for this specific test
      const customConfig: FailoverConfiguration = {
        ...DEFAULT_FAILOVER_CONFIG,
        regions: DEFAULT_FAILOVER_CONFIG.regions.map(region => ({
          ...region,
          status: "standby" as const, // No active regions
        })),
      };

      const testFailoverManager = new AutomatedFailoverManager(customConfig);
      await testFailoverManager.initialize();

      await expect(
        testFailoverManager.executeManualFailover("us-west-2", "Test")
      ).rejects.toThrow("No current active region found");

      await testFailoverManager.shutdown();
    });
  });

  describe("Region Management", () => {
    beforeEach(async () => {
      failoverManager = new AutomatedFailoverManager();
      await failoverManager.initialize();
    });

    it("should identify current active region", () => {
      const currentRegion = failoverManager.getCurrentActiveRegion();
      expect(currentRegion).toBeDefined();
      expect(currentRegion?.status).toBe("active");
      expect(currentRegion?.id).toBe("us-east-1");
    });

    it("should identify primary region", () => {
      const primaryRegion = failoverManager.getPrimaryRegion();
      expect(primaryRegion).toBeDefined();
      expect(primaryRegion?.priority).toBe(1);
      expect(primaryRegion?.id).toBe("us-east-1");
    });
  });

  describe("Metrics", () => {
    beforeEach(async () => {
      failoverManager = new AutomatedFailoverManager();
      await failoverManager.initialize();
    });

    it("should provide comprehensive metrics", () => {
      const metrics = failoverManager.getMetrics();

      expect(metrics).toMatchObject({
        totalFailovers: expect.any(Number),
        automaticFailovers: expect.any(Number),
        manualFailovers: expect.any(Number),
        averageFailoverTime: expect.any(Number),
        successfulFailovers: expect.any(Number),
        failedFailovers: expect.any(Number),
        currentActiveRegion: expect.any(String),
        rtoCompliance: expect.any(Number),
        uptime: expect.any(Number),
        events: expect.any(Array),
        regions: expect.any(Array),
      });

      expect(metrics.regions).toHaveLength(3);
      expect(metrics.events).toHaveLength(1); // Initialization event
    });

    it("should update metrics after failover", async () => {
      const initialMetrics = failoverManager.getMetrics();
      expect(initialMetrics.totalFailovers).toBe(0);

      await failoverManager.executeManualFailover("us-west-2", "Test");

      const updatedMetrics = failoverManager.getMetrics();
      expect(updatedMetrics.totalFailovers).toBe(1);
      expect(updatedMetrics.manualFailovers).toBe(1);
      expect(updatedMetrics.successfulFailovers).toBe(1);
      expect(updatedMetrics.currentActiveRegion).toBe("us-west-2");
    });
  });

  describe("Event Logging", () => {
    beforeEach(async () => {
      failoverManager = new AutomatedFailoverManager();
      await failoverManager.initialize();
    });

    it("should log initialization event", () => {
      const metrics = failoverManager.getMetrics();
      expect(metrics.events).toHaveLength(1);

      const initEvent = metrics.events[0];
      expect(initEvent.type).toBe("manual_switch");
      expect(initEvent.reason).toBe("Failover manager initialization");
      expect(initEvent.impact).toBe("low");
    });

    it("should log manual failover events", async () => {
      const currentActiveRegion = failoverManager.getCurrentActiveRegion()?.id;

      await failoverManager.executeManualFailover(
        "us-west-2",
        "Test manual failover"
      );

      const metrics = failoverManager.getMetrics();
      expect(metrics.events).toHaveLength(2); // Init + manual failover

      const failoverEvent = metrics.events[1];
      expect(failoverEvent.type).toBe("failover");
      expect(failoverEvent.fromRegion).toBe(currentActiveRegion); // Use actual current region
      expect(failoverEvent.toRegion).toBe("us-west-2");
      expect(failoverEvent.reason).toBe("Test manual failover");
      expect(failoverEvent.status).toBe("completed");
      expect(failoverEvent.impact).toBe("high");
    });
  });

  describe("Shutdown", () => {
    it("should shutdown gracefully", async () => {
      await failoverManager.initialize();
      await expect(failoverManager.shutdown()).resolves.not.toThrow();
    });

    it("should be safe to shutdown multiple times", async () => {
      await failoverManager.initialize();
      await failoverManager.shutdown();
      await expect(failoverManager.shutdown()).resolves.not.toThrow();
    });
  });

  describe("RTO Compliance", () => {
    beforeEach(async () => {
      failoverManager = new AutomatedFailoverManager();
      await failoverManager.initialize();
    });

    it("should track RTO compliance", async () => {
      const initialMetrics = failoverManager.getMetrics();
      expect(initialMetrics.rtoCompliance).toBe(100);

      // Execute a failover (should be quick in test environment)
      await failoverManager.executeManualFailover("us-west-2", "RTO test");

      const updatedMetrics = failoverManager.getMetrics();
      expect(updatedMetrics.rtoCompliance).toBeGreaterThanOrEqual(0);
      expect(updatedMetrics.rtoCompliance).toBeLessThanOrEqual(100);
    });
  });

  describe("DNS Provider Configuration", () => {
    it("should support Route 53 configuration", () => {
      const route53Config: FailoverConfiguration = {
        ...DEFAULT_FAILOVER_CONFIG,
        dnsProvider: "route53",
      };

      const route53Manager = new AutomatedFailoverManager(route53Config);
      expect(route53Manager).toBeDefined();
    });

    it("should support Azure Traffic Manager configuration", () => {
      const azureConfig: FailoverConfiguration = {
        ...DEFAULT_FAILOVER_CONFIG,
        dnsProvider: "azure-traffic-manager",
      };

      const azureManager = new AutomatedFailoverManager(azureConfig);
      expect(azureManager).toBeDefined();
    });
  });
});
