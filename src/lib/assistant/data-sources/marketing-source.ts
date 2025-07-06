import type { IDataSource } from "./data-source";

export interface MarketingQuery {
  type: "not_implemented";
  params?: Record<string, unknown>;
}

export interface MarketingResult {
  status: "not_implemented";
  message: string;
}

export const marketingSource: IDataSource<MarketingQuery, MarketingResult> = {
  name: "marketing",

  async testConnection() {
    // Always true for now
    return true;
  },

  async fetch() {
    return {
      status: "not_implemented",
      message: "Marketing data source will be implemented in Task 6",
    };
  },
};

export default marketingSource;
