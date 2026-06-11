import { z } from "zod";

const DENOMINATIONS = [100, 200, 750, 1500, 7500, 25000, 40000] as const;

export const bondNumberSchema = z
  .string()
  .regex(/^\d{6}$/, "Bond number must be exactly 6 digits");

export const denominationSchema = z
  .number()
  .refine((v) => DENOMINATIONS.includes(v as typeof DENOMINATIONS[number]), {
    message: "Invalid denomination. Must be one of: 100, 200, 750, 1500, 7500, 25000, 40000",
  });

export const createBondSchema = z.object({
  bondNumber: bondNumberSchema,
  denomination: denominationSchema,
});

export const paymentSchema = z.object({
  planId: z.string().min(1),
});

export const ocrUsageSchema = z.object({
  bondNumber: bondNumberSchema,
  denomination: denominationSchema,
});

export const importSchema = z.object({
  fileType: z.enum(["csv", "xlsx", "txt"]),
});

export const notificationPrefsSchema = z.object({
  emailEnabled: z.boolean().optional(),
  whatsappEnabled: z.boolean().optional(),
  smsEnabled: z.boolean().optional(),
});

export const updateProfileSchema = z.object({
  fullName: z.string().optional(),
  phone: z.string().optional(),
  whatsappNumber: z.string().optional(),
});
