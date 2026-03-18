const dotenv = require("dotenv");

dotenv.config();

const supportedLanguages = (process.env.SUPPORTED_LANGUAGES || "en,sw")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

module.exports = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4100),
  defaultLanguage: process.env.DEFAULT_LANGUAGE || "en",
  supportedLanguages,
  voiceProvider: process.env.VOICE_PROVIDER || "gemini",
  ttsProvider: process.env.TTS_PROVIDER || (process.env.ELEVENLABS_API_KEY ? "elevenlabs" : "browser"),
  hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  hasElevenLabsKey: Boolean(process.env.ELEVENLABS_API_KEY),
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  geminiModel: process.env.GEMINI_MODEL || "gemini-2.0-flash",
  geminiApiBaseUrl: process.env.GEMINI_API_BASE_URL || "https://generativelanguage.googleapis.com/v1beta",
  elevenLabsApiKey: process.env.ELEVENLABS_API_KEY || "",
  elevenLabsBaseUrl: process.env.ELEVENLABS_BASE_URL || "https://api.elevenlabs.io/v1",
  elevenLabsModel: process.env.ELEVENLABS_MODEL || "eleven_turbo_v2_5",
  elevenLabsVoiceEn: process.env.ELEVENLABS_VOICE_EN || "21m00Tcm4TlvDq8ikWAM",
  elevenLabsVoiceSw: process.env.ELEVENLABS_VOICE_SW || process.env.ELEVENLABS_VOICE_EN || "21m00Tcm4TlvDq8ikWAM"
};
