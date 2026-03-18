import { z } from "zod";

export const aiAssistSchema = z.object({
  trips: z.array(z.record(z.any())).default([]),
  intent: z.record(z.any()).default({}),
  route: z.string().optional(),
  departureTime: z.string().optional(),
  currentPrice: z.number().or(z.string()).optional(),
  riskFactors: z.record(z.any()).default({}),
  fraudSignals: z.record(z.any()).default({}),
  prompt: z.string().max(500).optional(),
  language: z.string().optional()
});

export const aiChatSchema = z.object({
  text: z.string().min(1).max(500),
  language: z.string().optional()
});

export const aiVoiceSchema = z.object({
  transcript: z.string().min(1).max(500),
  language: z.string().optional()
});
