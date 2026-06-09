import { z } from "zod";
import { DENOMINATIONS } from "./constants";

export const bondSchema = z.object({
  denomination: z.enum(DENOMINATIONS),
  bond_number: z
    .string()
    .min(4, "Bond number must be at least 4 digits")
    .max(7, "Bond number must be at most 7 digits")
    .regex(/^\d+$/, "Bond number must contain only digits"),
});

export type BondInput = z.infer<typeof bondSchema>;
