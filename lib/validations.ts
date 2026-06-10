import { z } from "zod";
import { DENOMINATIONS } from "./constants";

export const bondSchema = z.object({
  denomination: z.enum(DENOMINATIONS),
  bond_number: z
    .string()
    .regex(/^\d{6}$/, "Bond number must be exactly 6 digits"),
});

export type BondInput = z.infer<typeof bondSchema>;
