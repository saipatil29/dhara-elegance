import { z } from "zod";

/**
 * Contact / enquiry form schema.
 */
export const contactFormSchema = z.object({
  fullName: z
    .string()
    .min(2, "Please enter your full name")
    .max(100, "Name is too long"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .min(10, "Please enter a valid phone number")
    .max(15, "Please enter a valid phone number")
    .optional()
    .or(z.literal("")),
  subject: z.string().min(3, "Subject is too short").max(150),
  message: z
    .string()
    .min(10, "Message should be at least 10 characters")
    .max(2000, "Message is too long"),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

/**
 * Newsletter subscription schema.
 */
export const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export type NewsletterValues = z.infer<typeof newsletterSchema>;

/**
 * Shipping address schema.
 */
export const addressSchema = z.object({
  fullName: z.string().min(2, "Please enter the recipient's name"),
  line1: z.string().min(3, "Please enter a valid address"),
  line2: z.string().optional(),
  city: z.string().min(2, "Please enter a city"),
  state: z.string().min(2, "Please enter a state"),
  postalCode: z
    .string()
    .min(4, "Please enter a valid postal code")
    .max(10, "Please enter a valid postal code"),
  country: z.string().min(2, "Please select a country"),
  phone: z.string().min(10, "Please enter a valid phone number"),
});

export type AddressValues = z.infer<typeof addressSchema>;

/**
 * Auth: sign in / sign up schemas.
 */
export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signUpSchema = signInSchema
  .extend({
    fullName: z.string().min(2, "Please enter your full name"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
