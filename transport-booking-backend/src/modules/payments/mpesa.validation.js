import { z } from "zod";

export const stkPushSchema = z.object({
  amount: z.number().int().positive(),
  phoneNumber: z.string().min(10),
  accountReference: z.string().min(2).max(30).optional(),
  transactionDesc: z.string().min(2).max(60).optional()
});
