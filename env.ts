import { z } from "zod";

const envSchema = z.object({
  COMPANY_NAME: z.string(),
  TWITTER_CREATOR: z.string(),
  TWITTER_SITE: z.string(),
  SITE_NAME: z.string(),
  SHOPIFY_REVALIDATION_SECRET: z.string(),
  SHOPIFY_STOREFRONT_ACCESS_TOKEN: z.string(),
  SHOPIFY_STORE_DOMAIN: z.string(),
  // Customer Account API
  SHOPIFY_CUSTOMER_ACCOUNT_TOKEN: z.string().optional(),
  SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID: z.string().optional(),
  SHOPIFY_CUSTOMER_ACCOUNT_API_URL: z.string().optional(),
  SHOPIFY_SHOP_ID: z.string().optional(),
});

envSchema.parse(process.env);

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}
