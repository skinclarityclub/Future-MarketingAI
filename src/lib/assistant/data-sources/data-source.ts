export interface IDataSource<TQuery = any, TResult = any> {
  /**
   * Unique identifier for the data source (e.g. "shopify", "kajabi")
   */
  name: string;

  /**
   * Run a simple health-check to verify that the underlying service is reachable
   * and credentials (if required) are valid.
   */
  testConnection(): Promise<boolean>;

  /**
   * Execute a query against the underlying service and return results in a
   * service-specific shape.
   */
  fetch(query: TQuery): Promise<TResult>;
}
