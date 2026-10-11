import { z } from "zod";

import { phoneSchema, pincodeSchema } from "@/lib/validations/common";

export const cartItemInputSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().nullable().optional(),
  quantity: z.number().int().min(1).max(99),
});

export const checkoutSchema = z.object({
  customerName: z.string().min(2, "Enter your full name").max(120),
  customerEmail: z.string().email("Enter a valid email address"),
  customerPhone: phoneSchema,

  addressLine1: z.string().min(3, "Enter your address").max(200),
  addressLine2: z.string().max(200).optional(),
  city: z.string().min(2, "Enter your city").max(80),
  state: z.string().min(2, "Enter your state").max(80),
  pincode: pincodeSchema,
  country: z.string().default("India"),

  items: z.array(cartItemInputSchema).min(1, "Your cart is empty"),
  couponCode: z.string().max(40).optional().nullable(),
  paymentMethod: z.enum(["razorpay", "cod"]),
  customerNotes: z.string().max(500).optional(),
});

export type CheckoutValues = z.infer<typeof checkoutSchema>;
