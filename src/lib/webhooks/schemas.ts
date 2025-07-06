import { z } from "zod";

// Shopify customer webhook payload (simplified to required fields)
export const shopifyCustomerSchema = z.object({
  id: z.number().or(z.string()),
  email: z.string().email(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  orders_count: z.number().optional(),
  total_spent: z.union([z.string(), z.number()]).optional(),
  tags: z.string().optional(),
});

export type ShopifyCustomerPayload = z.infer<typeof shopifyCustomerSchema>;

// Kajabi customer webhook payload (simplified)
export const kajabiCustomerSchema = z.object({
  id: z.number().or(z.string()),
  email: z.string().email(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  purchases_count: z.number().optional(),
  total_spent: z.union([z.string(), z.number()]).optional(),
  tags: z.array(z.string()).optional(),
});

export type KajabiCustomerPayload = z.infer<typeof kajabiCustomerSchema>;
