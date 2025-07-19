import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(4000),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("❌ Invalid environment variables: ");
  console.error(JSON.stringify(parsed.error.format(), null, 2));

  process.exit(1);
}

export const config = parsed.data;
export const isProd = config.NODE_ENV === "production";
export const isDev = config.NODE_ENV === "development";
export type AppConfig = typeof config;
