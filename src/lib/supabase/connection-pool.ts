import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "./types";

interface ConnectionPoolConfig {
  url: string;
  anonKey: string;
  poolSize: number;
  connectionTimeout: number;
  idleTimeout: number;
  retryAttempts: number;
  retryDelay: number;
}

interface ConnectionStats {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  failedConnections: number;
  avgResponseTime: number;
  totalQueries: number;
}

interface PooledConnection {
  client: SupabaseClient<Database>;
  isActive: boolean;
  lastUsed: number;
  createdAt: number;
  queryCount: number;
}

class SupabaseConnectionPool {
  private static instance: SupabaseConnectionPool;
  private config: ConnectionPoolConfig;
  private connections: Map<string, PooledConnection> = new Map();
  private waitingQueue: Array<{
    resolve: (client: SupabaseClient<Database>) => void;
    reject: (error: Error) => void;
    timestamp: number;
  }> = [];
  private stats: ConnectionStats = {
    totalConnections: 0,
    activeConnections: 0,
    idleConnections: 0,
    failedConnections: 0,
    avgResponseTime: 0,
    totalQueries: 0,
  };
  private cleanupInterval: NodeJS.Timeout | null = null;

  private constructor(config: ConnectionPoolConfig) {
    this.config = config;
    this.startCleanupTask();
  }

  static getInstance(config?: ConnectionPoolConfig): SupabaseConnectionPool {
    if (!SupabaseConnectionPool.instance) {
      if (!config) {
        throw new Error(
          "SupabaseConnectionPool requires initial configuration"
        );
      }
      SupabaseConnectionPool.instance = new SupabaseConnectionPool(config);
    }
    return SupabaseConnectionPool.instance;
  }

  // Get a connection from the pool
  async getConnection(): Promise<SupabaseClient<Database>> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      // Try to find an idle connection
      const idleConnection = this.findIdleConnection();
      if (idleConnection) {
        this.activateConnection(idleConnection);
        this.updateResponseTime(Date.now() - startTime);
        resolve(idleConnection.client);
        return;
      }

      // If pool not full, create new connection
      if (this.connections.size < this.config.poolSize) {
        this.createConnection()
          .then(connection => {
            this.activateConnection(connection);
            this.updateResponseTime(Date.now() - startTime);
            resolve(connection.client);
          })
          .catch(error => {
            this.stats.failedConnections++;
            reject(error);
          });
        return;
      }

      // Add to waiting queue
      const timeout = setTimeout(() => {
        const index = this.waitingQueue.findIndex(
          item => item.resolve === resolve
        );
        if (index !== -1) {
          this.waitingQueue.splice(index, 1);
          reject(new Error("Connection timeout"));
        }
      }, this.config.connectionTimeout);

      this.waitingQueue.push({
        resolve: (client: SupabaseClient<Database>) => {
          clearTimeout(timeout);
          this.updateResponseTime(Date.now() - startTime);
          resolve(client);
        },
        reject: (error: Error) => {
          clearTimeout(timeout);
          reject(error);
        },
        timestamp: startTime,
      });
    });
  }

  // Release a connection back to the pool
  async releaseConnection(client: SupabaseClient<Database>): Promise<void> {
    const connectionId = this.findConnectionId(client);
    if (!connectionId) {
      console.warn("[Connection Pool] Attempted to release unknown connection");
      return;
    }

    const connection = this.connections.get(connectionId);
    if (!connection) return;

    connection.isActive = false;
    connection.lastUsed = Date.now();
    connection.queryCount++;
    this.stats.activeConnections--;
    this.stats.idleConnections++;

    // Process waiting queue
    if (this.waitingQueue.length > 0) {
      const waiter = this.waitingQueue.shift();
      if (waiter) {
        this.activateConnection(connection);
        waiter.resolve(client);
      }
    }
  }

  // Create a new connection
  private async createConnection(): Promise<PooledConnection> {
    try {
      const client = createClient<Database>(
        this.config.url,
        this.config.anonKey,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
          db: {
            schema: "public",
          },
          global: {
            headers: {
              "X-Connection-Pool": "true",
            },
          },
        }
      );

      // Test the connection
      const { error } = await client.from("customers").select("id").limit(1);
      if (
        error &&
        !error.message.includes("relation") &&
        !error.message.includes("does not exist")
      ) {
        throw error;
      }

      const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const connection: PooledConnection = {
        client,
        isActive: false,
        lastUsed: Date.now(),
        createdAt: Date.now(),
        queryCount: 0,
      };

      this.connections.set(connectionId, connection);
      this.stats.totalConnections++;
      this.stats.idleConnections++;

      console.log(`[Connection Pool] Created new connection: ${connectionId}`);
      return connection;
    } catch (error) {
      console.error("[Connection Pool] Failed to create connection:", error);
      throw error;
    }
  }

  // Find an idle connection
  private findIdleConnection(): PooledConnection | null {
    for (const connection of this.connections.values()) {
      if (!connection.isActive) {
        return connection;
      }
    }
    return null;
  }

  // Activate a connection
  private activateConnection(connection: PooledConnection): void {
    connection.isActive = true;
    connection.lastUsed = Date.now();
    this.stats.activeConnections++;
    this.stats.idleConnections--;
    this.stats.totalQueries++;
  }

  // Find connection ID by client
  private findConnectionId(client: SupabaseClient<Database>): string | null {
    for (const [id, connection] of this.connections.entries()) {
      if (connection.client === client) {
        return id;
      }
    }
    return null;
  }

  // Update average response time
  private updateResponseTime(responseTime: number): void {
    const totalTime =
      this.stats.avgResponseTime * (this.stats.totalQueries - 1);
    this.stats.avgResponseTime =
      (totalTime + responseTime) / this.stats.totalQueries;
  }

  // Start cleanup task for idle connections
  private startCleanupTask(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupIdleConnections();
    }, 30000); // Run every 30 seconds
  }

  // Clean up idle connections that exceed idle timeout
  private cleanupIdleConnections(): void {
    const now = Date.now();
    const idsToRemove: string[] = [];

    for (const [id, connection] of this.connections.entries()) {
      if (
        !connection.isActive &&
        now - connection.lastUsed > this.config.idleTimeout
      ) {
        idsToRemove.push(id);
      }
    }

    for (const id of idsToRemove) {
      const connection = this.connections.get(id);
      if (connection) {
        // Note: Supabase client doesn't have explicit close method
        this.connections.delete(id);
        this.stats.totalConnections--;
        this.stats.idleConnections--;
        console.log(`[Connection Pool] Cleaned up idle connection: ${id}`);
      }
    }
  }

  // Get pool statistics
  getStats(): ConnectionStats {
    return { ...this.stats };
  }

  // Get pool status
  getStatus() {
    return {
      poolSize: this.config.poolSize,
      totalConnections: this.connections.size,
      activeConnections: this.stats.activeConnections,
      idleConnections: this.stats.idleConnections,
      waitingCount: this.waitingQueue.length,
      utilizationRate:
        (this.stats.activeConnections / this.config.poolSize) * 100,
    };
  }

  // Execute query with automatic connection management
  async executeQuery<T>(
    queryFn: (client: SupabaseClient<Database>) => Promise<T>,
    retries = 0
  ): Promise<T> {
    let client: SupabaseClient<Database> | null = null;

    try {
      client = await this.getConnection();
      const result = await queryFn(client);
      return result;
    } catch (error) {
      if (retries < this.config.retryAttempts) {
        console.warn(
          `[Connection Pool] Query failed, retrying... (${retries + 1}/${this.config.retryAttempts})`
        );
        await new Promise(resolve =>
          setTimeout(resolve, this.config.retryDelay)
        );
        return this.executeQuery(queryFn, retries + 1);
      }
      throw error;
    } finally {
      if (client) {
        await this.releaseConnection(client);
      }
    }
  }

  // Warm up the pool by creating initial connections
  async warmUp(
    initialConnections = Math.min(2, this.config.poolSize)
  ): Promise<void> {
    console.log(
      `[Connection Pool] Warming up pool with ${initialConnections} connections...`
    );

    const promises = Array.from({ length: initialConnections }, () =>
      this.createConnection().catch(error => {
        console.error(
          "[Connection Pool] Failed to create connection during warmup:",
          error
        );
        return null;
      })
    );

    const results = await Promise.allSettled(promises);
    const successful = results.filter(
      result => result.status === "fulfilled" && result.value !== null
    ).length;

    console.log(
      `[Connection Pool] Warmup complete: ${successful}/${initialConnections} connections created`
    );
  }

  // Shutdown the pool
  async shutdown(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    // Reject all waiting requests
    for (const waiter of this.waitingQueue) {
      waiter.reject(new Error("Connection pool is shutting down"));
    }
    this.waitingQueue.length = 0;

    // Clear all connections
    this.connections.clear();

    // Reset stats
    this.stats = {
      totalConnections: 0,
      activeConnections: 0,
      idleConnections: 0,
      failedConnections: 0,
      avgResponseTime: 0,
      totalQueries: 0,
    };

    console.log("[Connection Pool] Pool shutdown complete");
  }
}

// Initialize connection pool with environment variables
export function initializeConnectionPool(): SupabaseConnectionPool {
  const config: ConnectionPoolConfig = {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    poolSize: parseInt(process.env.SUPABASE_POOL_SIZE || "10"),
    connectionTimeout: parseInt(
      process.env.SUPABASE_CONNECTION_TIMEOUT || "5000"
    ),
    idleTimeout: parseInt(process.env.SUPABASE_IDLE_TIMEOUT || "300000"), // 5 minutes
    retryAttempts: parseInt(process.env.SUPABASE_RETRY_ATTEMPTS || "3"),
    retryDelay: parseInt(process.env.SUPABASE_RETRY_DELAY || "1000"),
  };

  const pool = SupabaseConnectionPool.getInstance(config);

  // Warm up the pool
  pool.warmUp().catch(error => {
    console.error("[Connection Pool] Failed to warm up pool:", error);
  });

  return pool;
}

// Middleware for automatic connection management
export function connectionPoolMiddleware() {
  const pool = SupabaseConnectionPool.getInstance();

  return async (req: any, res: any, next: any) => {
    const startTime = Date.now();

    // Attach pool methods to request object
    req.supabasePool = {
      getConnection: () => pool.getConnection(),
      executeQuery: (queryFn: any) => pool.executeQuery(queryFn),
      getStats: () => pool.getStats(),
      getStatus: () => pool.getStatus(),
    };

    res.on("finish", () => {
      const responseTime = Date.now() - startTime;
      if (responseTime > 1000) {
        console.warn(
          `[Connection Pool] Slow request detected: ${req.method} ${req.path} took ${responseTime}ms`
        );
      }
    });

    next();
  };
}

export { SupabaseConnectionPool };
