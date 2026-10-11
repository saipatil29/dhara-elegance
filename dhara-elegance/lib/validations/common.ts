import { z } from "zod";

/** Indian mobile number, with or without +91. */
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^(\+?91[\s-]?)?[6-9]\d{9}$/, "Enter a valid 10-digit mobile number");

export const pincodeSchema = z
  .string()
  .trim()
  .regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit PIN code");

/** Money as a non-negative amount with at most 2 decimals. */
export const moneySchema = z
  .number({ invalid_type_error: "Enter a valid amount" })
  .nonnegative("Amount cannot be negative")
  .multipleOf(0.01, "Use at most two decimal places");

export const addressSchema = z.object({
  label: z.string().max(40).optional(),
  fullName: z.string().min(2, "Enter the recipient's name").max(100),
  phone: phoneSchema,
  line1: z.string().min(3, "Enter the address").max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(2, "Enter the city").max(80),
  state: z.string().min(2, "Enter the state").max(80),
  pincode: pincodeSchema,
  country: z.string().default("India"),
  isDefault: z.boolean().default(false),
});

export const newsletterSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export type AddressValues = z.infer<typeof addressSchema>;
export type NewsletterValues = z.infer<typeof newsletterSchema>;
