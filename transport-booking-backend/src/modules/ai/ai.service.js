import { env } from "../../config/env.js";

function normalizeBaseUrl(url) {
  return String(url || "http://localhost:4100").replace(/\/+$/, "");
}

function buildUpstreamError(status, fallbackMessage) {
  const error = new Error(fallbackMessage);
  error.statusCode = status;
  return error;
}

async function callAi(path, payload, method = "POST") {
  const baseUrl = normalizeBaseUrl(env.AI_AGENT_BASE_URL);
  const timeoutMs = Number(env.AI_AGENT_TIMEOUT_MS || 8000);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: method === "GET" ? undefined : JSON.stringify(payload || {}),
      signal: controller.signal
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = data?.message || data?.error || `AI agent request failed (${response.status})`;
      throw buildUpstreamError(502, message);
    }

    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      throw buildUpstreamError(504, "AI agent timeout");
    }

    if (error.statusCode) {
      throw error;
    }

    throw buildUpstreamError(502, "Could not reach AI agent service");
  } finally {
    clearTimeout(timer);
  }
}

export const getAiHealth = async () => callAi("/health", null, "GET");
export const getAiAssist = async (payload) => callAi("/v1/decision/assist", payload);
export const getAiChat = async (payload) => callAi("/v1/chat/respond", payload);
export const getAiVoice = async (payload) => callAi("/v1/voice/respond", payload);
