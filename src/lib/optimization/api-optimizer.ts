interface OptimizationConfig {
  enableDataMinification: boolean;
  enableFieldSelection: boolean;
  enablePagination: boolean;
  defaultPageSize: number;
  maxPageSize: number;
  enableCaching: boolean;
  cacheTTL: number;
}

interface OptimizationStats {
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  fieldsRemoved: number;
  recordsLimited: number;
  cacheHit: boolean;
}

const defaultConfig: OptimizationConfig = {
  enableDataMinification: true,
  enableFieldSelection: true,
  enablePagination: true,
  defaultPageSize: 50,
  maxPageSize: 1000,
  enableCaching: true,
  cacheTTL: 300,
};

class APIOptimizer {
  private static instance: APIOptimizer;
  private config: OptimizationConfig;
  private optimizationStats = new Map<string, OptimizationStats>();

  private constructor(config: OptimizationConfig) {
    this.config = config;
  }

  static getInstance(config?: OptimizationConfig): APIOptimizer {
    if (!APIOptimizer.instance) {
      APIOptimizer.instance = new APIOptimizer(config || defaultConfig);
    }
    return APIOptimizer.instance;
  }

  // Optimize API response data
  optimizeResponse(
    data: any,
    options: {
      fields?: string[];
      page?: number;
      pageSize?: number;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    } = {}
  ): {
    data: any;
    metadata: {
      total?: number;
      page?: number;
      pageSize?: number;
      totalPages?: number;
    };
    stats: OptimizationStats;
  } {
    const startTime = Date.now();
    const originalData = JSON.stringify(data);
    const originalSize = Buffer.byteLength(originalData, "utf8");

    let optimizedData = data;
    let fieldsRemoved = 0;
    let recordsLimited = 0;
    let total: number | undefined;

    // Apply field selection if enabled and fields specified
    if (
      this.config.enableFieldSelection &&
      options.fields &&
      options.fields.length > 0
    ) {
      const result = this.selectFields(optimizedData, options.fields);
      optimizedData = result.data;
      fieldsRemoved = result.fieldsRemoved;
    }

    // Apply pagination if enabled and data is an array
    if (this.config.enablePagination && Array.isArray(optimizedData)) {
      const pageSize = Math.min(
        options.pageSize || this.config.defaultPageSize,
        this.config.maxPageSize
      );
      const page = options.page || 1;

      total = optimizedData.length;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;

      optimizedData = optimizedData.slice(startIndex, endIndex);
      recordsLimited = total - optimizedData.length;
    }

    // Apply sorting if specified
    if (options.sortBy && Array.isArray(optimizedData)) {
      optimizedData = this.sortData(
        optimizedData,
        options.sortBy,
        options.sortOrder
      );
    }

    // Apply data minification if enabled
    if (this.config.enableDataMinification) {
      optimizedData = this.minifyData(optimizedData);
    }

    const optimizedString = JSON.stringify(optimizedData);
    const optimizedSize = Buffer.byteLength(optimizedString, "utf8");
    const compressionRatio =
      ((originalSize - optimizedSize) / originalSize) * 100;

    const stats: OptimizationStats = {
      originalSize,
      optimizedSize,
      compressionRatio,
      fieldsRemoved,
      recordsLimited,
      cacheHit: false,
    };

    const metadata: any = {};
    if (total !== undefined) {
      const pageSize = options.pageSize || this.config.defaultPageSize;
      metadata.total = total;
      metadata.page = options.page || 1;
      metadata.pageSize = pageSize;
      metadata.totalPages = Math.ceil(total / pageSize);
    }

    console.log(
      `[API Optimizer] Optimized response: ${originalSize}B -> ${optimizedSize}B (${compressionRatio.toFixed(1)}% reduction)`
    );

    return {
      data: optimizedData,
      metadata,
      stats,
    };
  }

  // Select specific fields from data
  private selectFields(
    data: any,
    fields: string[]
  ): { data: any; fieldsRemoved: number } {
    let fieldsRemoved = 0;

    const selectFromObject = (obj: any): any => {
      if (obj === null || typeof obj !== "object") return obj;

      if (Array.isArray(obj)) {
        return obj.map(item => selectFromObject(item));
      }

      const result: any = {};
      const originalKeys = Object.keys(obj);

      for (const field of fields) {
        if (field.includes(".")) {
          // Handle nested fields like "user.name"
          const [parent, ...nested] = field.split(".");
          if (obj[parent] && typeof obj[parent] === "object") {
            if (!result[parent]) result[parent] = {};
            const nestedValue = this.getNestedValue(
              obj[parent],
              nested.join(".")
            );
            if (nestedValue !== undefined) {
              this.setNestedValue(
                result[parent],
                nested.join("."),
                nestedValue
              );
            }
          }
        } else if (obj.hasOwnProperty(field)) {
          result[field] = obj[field];
        }
      }

      fieldsRemoved += originalKeys.length - Object.keys(result).length;
      return result;
    };

    return {
      data: selectFromObject(data),
      fieldsRemoved,
    };
  }

  // Get nested value from object
  private getNestedValue(obj: any, path: string): any {
    return path
      .split(".")
      .reduce((current, key) => current && current[key], obj);
  }

  // Set nested value in object
  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split(".");
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  // Sort data array
  private sortData(
    data: any[],
    sortBy: string,
    sortOrder: "asc" | "desc" = "asc"
  ): any[] {
    return [...data].sort((a, b) => {
      const aValue = this.getNestedValue(a, sortBy);
      const bValue = this.getNestedValue(b, sortBy);

      if (aValue === bValue) return 0;

      let comparison = 0;
      if (aValue > bValue) comparison = 1;
      if (aValue < bValue) comparison = -1;

      return sortOrder === "desc" ? -comparison : comparison;
    });
  }

  // Minify data by removing empty values and optimizing structure
  private minifyData(data: any): any {
    if (data === null || data === undefined) return data;

    if (Array.isArray(data)) {
      return data
        .map(item => this.minifyData(item))
        .filter(item => item !== null && item !== undefined);
    }

    if (typeof data === "object") {
      const result: any = {};

      for (const [key, value] of Object.entries(data)) {
        const minifiedValue = this.minifyData(value);

        // Skip null, undefined, empty strings, and empty arrays
        if (
          minifiedValue !== null &&
          minifiedValue !== undefined &&
          minifiedValue !== "" &&
          !(Array.isArray(minifiedValue) && minifiedValue.length === 0)
        ) {
          result[key] = minifiedValue;
        }
      }

      return result;
    }

    return data;
  }

  // Generate cache key for request
  generateCacheKey(endpoint: string, params: Record<string, any> = {}): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${JSON.stringify(params[key])}`)
      .join("&");

    return `${endpoint}?${sortedParams}`;
  }

  // Optimize query parameters
  optimizeQueryParams(params: Record<string, any>): Record<string, any> {
    const optimized: Record<string, any> = {};

    for (const [key, value] of Object.entries(params)) {
      // Skip empty or null values
      if (value === null || value === undefined || value === "") {
        continue;
      }

      // Handle arrays
      if (Array.isArray(value)) {
        if (value.length > 0) {
          optimized[key] = value;
        }
        continue;
      }

      // Handle pagination parameters
      if (key === "pageSize") {
        optimized[key] = Math.min(
          Math.max(1, parseInt(value) || this.config.defaultPageSize),
          this.config.maxPageSize
        );
        continue;
      }

      if (key === "page") {
        optimized[key] = Math.max(1, parseInt(value) || 1);
        continue;
      }

      optimized[key] = value;
    }

    return optimized;
  }

  // Get optimization statistics
  getStats(): Record<string, OptimizationStats> {
    return Object.fromEntries(this.optimizationStats);
  }

  // Reset statistics
  resetStats(): void {
    this.optimizationStats.clear();
  }

  // Update configuration
  updateConfig(newConfig: Partial<OptimizationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Get current configuration
  getConfig(): OptimizationConfig {
    return { ...this.config };
  }
}

// Middleware for automatic API optimization
export function apiOptimizationMiddleware(
  config?: Partial<OptimizationConfig>
) {
  const optimizer = APIOptimizer.getInstance({ ...defaultConfig, ...config });

  return (req: any, res: any, next: any) => {
    const originalJson = res.json;

    res.json = function (data: any) {
      try {
        // Extract optimization options from query parameters
        const options = {
          fields: req.query.fields ? req.query.fields.split(",") : undefined,
          page: req.query.page ? parseInt(req.query.page) : undefined,
          pageSize: req.query.pageSize
            ? parseInt(req.query.pageSize)
            : undefined,
          sortBy: req.query.sortBy,
          sortOrder: req.query.sortOrder as "asc" | "desc",
        };

        // Optimize the response
        const optimized = optimizer.optimizeResponse(data, options);

        // Add optimization headers
        res.set("X-Original-Size", optimized.stats.originalSize.toString());
        res.set("X-Optimized-Size", optimized.stats.optimizedSize.toString());
        res.set(
          "X-Compression-Ratio",
          `${optimized.stats.compressionRatio.toFixed(1)}%`
        );
        res.set("X-Fields-Removed", optimized.stats.fieldsRemoved.toString());
        res.set("X-Records-Limited", optimized.stats.recordsLimited.toString());

        // Include metadata in response
        const responseData = {
          data: optimized.data,
          ...(Object.keys(optimized.metadata).length > 0 && {
            metadata: optimized.metadata,
          }),
        };

        return originalJson.call(this, responseData);
      } catch (error) {
        console.error("[API Optimizer] Optimization error:", error);
        // Fall back to original response
        return originalJson.call(this, data);
      }
    };

    next();
  };
}

// Helper function to create optimized API responses
export function createOptimizedResponse(
  data: any,
  options: {
    fields?: string[];
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  } = {}
) {
  const optimizer = APIOptimizer.getInstance();
  return optimizer.optimizeResponse(data, options);
}

export { APIOptimizer };
