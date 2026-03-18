import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  AI_AGENT_BASE_URL: process.env.AI_AGENT_BASE_URL || "http://localhost:4100",
  AI_AGENT_TIMEOUT_MS: Number(process.env.AI_AGENT_TIMEOUT_MS || 8000)
};