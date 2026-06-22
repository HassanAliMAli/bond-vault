import { z } from "zod";
import { DENOMINATION_NUMBERS } from "../constants";

export const bondNumberSchema = z
  .string()
  .regex(/^\d{6}$/, "Bond number must be exactly 6 digits");

export const denominationSchema = z
  .number()
  .refine((v) => DENOMINATION_NUMBERS.includes(v as typeof DENOMINATION_NUMBERS[number]), {
    message: "Invalid denomination. Must be one of: 100, 200, 750, 1500, 7500, 15000, 25000, 40000",
  });

export const createBondSchema = z.object({
  bondNumber: bondNumberSchema,
  denomination: denominationSchema,
});

export const updateBondSchema = z.object({
  bondNumber: bondNumberSchema.optional(),
  denomination: denominationSchema.optional(),
});

export const paymentSchema = z.object({
  planId: z.string().min(1),
});

export const txtImportSchema = z.object({
  bonds: z.array(z.object({
    bondNumber: bondNumberSchema,
    denomination: denominationSchema,
  })).min(1).max(10000),
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

export const createDrawSchema = z.object({
  denomination: denominationSchema,
  drawNumber: z.string().min(1),
  drawDate: z.string().min(1),
  source: z.string().optional(),
});

export const createWinningNumberSchema = z.object({
  bondNumber: bondNumberSchema,
  prizeType: z.enum(["1st Prize", "2nd Prize", "3rd Prize"]),
  prizeAmount: z.number().positive(),
});

export const updateUserSchema = z.object({
  fullName: z.string().optional(),
  phone: z.string().optional(),
  whatsappNumber: z.string().optional(),
  status: z.enum(["active", "suspended"]).optional(),
});

export const updateSettingsSchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
});

export const updateDrawSchema = z.object({
  denomination: denominationSchema.optional(),
  drawNumber: z.string().min(1).optional(),
  drawDate: z.string().min(1).optional(),
  source: z.string().optional(),
  pdfR2Key: z.string().optional(),
});
