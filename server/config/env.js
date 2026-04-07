import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server folder
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

function required(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing env variable: ${name}`);
  }
  return value.trim();
}

function toBool(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value).toLowerCase() === 'true';
}

const rawOrigins = process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000';

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  APP_BASE_URL: process.env.APP_BASE_URL || 'http://localhost:5173',
  MONGO_URI: required("MONGO_URI"),
  JWT_SECRET: required("JWT_SECRET"),
  JWT_EXPIRE: process.env.JWT_EXPIRE || "7d",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: process.env.SMTP_PORT || '',
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: process.env.SMTP_FROM || '',
  NVIDIA_API_KEY: process.env.NVIDIA_API_KEY || '',
  NVIDIA_BASE_URL: process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1',
  NVIDIA_MODEL: process.env.NVIDIA_MODEL || 'openai/gpt-oss-20b',
  ALLOW_DB_OPTIONAL: toBool(process.env.ALLOW_DB_OPTIONAL, false),
  CORS_ORIGINS: rawOrigins.split(',').map((item) => item.trim()).filter(Boolean),
};