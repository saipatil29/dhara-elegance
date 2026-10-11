"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, Loader2 } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { signUpSchema, type SignUpValues } from "@/lib/validations/auth";
import { signUpWithPassword } from "@/lib/auth/actions";

export default function SignupPage() {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [submitted, setSubmitted] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { marketingOptIn: false },
  });

  async function onSubmit(values: SignUpValues) {
    setServerError(null);
    const result = await signUpWithPassword(values);
    if (!result.success) {
      setServerError(result.error);
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <AuthShell title="Check Your Email">
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <CheckCircle className="h-10 w-10 text-success" />
          <p className="text-sm text-muted-foreground">
            We&apos;ve sent a confirmation link to your email. Click it to activate your account.
          </p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create Your Account"
      subtitle="Join Dhara Elegance"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-navy hover:text-gold">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" className="mt-1.5" {...register("fullName")} />
          {errors.fullName && <p className="mt-1 text-xs text-destructive">{errors.fullName.message}</p>}
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" className="mt-1.5" {...register("email")} />
          {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" className="mt-1.5" {...register("password")} />
          {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input id="confirmPassword" type="password" className="mt-1.5" {...register("confirmPassword")} />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        <label className="flex items-start gap-2.5 text-sm text-navy/80">
          <Checkbox
            checked={watch("marketingOptIn")}
            onCheckedChange={(c) => setValue("marketingOptIn", c === true)}
            className="mt-0.5"
          />
          Send me new arrivals and offers by email
        </label>

        {serverError && <p className="text-sm text-destructive">{serverError}</p>}

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
        </Button>
      </form>
    </AuthShell>
  );
}
