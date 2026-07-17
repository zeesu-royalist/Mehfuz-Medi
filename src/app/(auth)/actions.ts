"use server";

import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import {
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  type RegisterInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
  type ChangePasswordInput,
} from "@/lib/validators/auth";
import { sendPasswordResetEmail } from "@/lib/email";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";

type ActionResult = { success: true } | { success: false; error: string };

export async function registerUser(input: RegisterInput): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }
  const { name, email, password } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: "An account with this email already exists." };
  }

  const passwordHash = await hashPassword(password);

  await db.user.create({
    data: {
      name,
      email,
      passwordHash,
      cart: { create: {} },
      wishlist: { create: {} },
    },
  });

  return { success: true };
}

export async function requestPasswordReset(
  input: ForgotPasswordInput
): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }
  const { email } = parsed.data;

  const user = await db.user.findUnique({ where: { email } });
  // Always return success even if the user doesn't exist — avoids leaking
  // which emails are registered.
  if (!user) return { success: true };

  const token = randomUUID();
  const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await db.passwordResetToken.create({
    data: { email, token, expires },
  });

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
  await sendPasswordResetEmail(email, resetUrl);

  return { success: true };
}

export async function resetPassword(input: ResetPasswordInput): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }
  const { token, password } = parsed.data;

  const resetToken = await db.passwordResetToken.findUnique({ where: { token } });
  if (!resetToken || resetToken.expires < new Date()) {
    return { success: false, error: "This reset link is invalid or has expired." };
  }

  const passwordHash = await hashPassword(password);

  await db.$transaction([
    db.user.update({
      where: { email: resetToken.email },
      data: { passwordHash },
    }),
    db.passwordResetToken.delete({ where: { token } }),
  ]);

  return { success: true };
}

export async function changePassword(input: ChangePasswordInput): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "You must be logged in." };
  }

  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }
  const { currentPassword, newPassword } = parsed.data;

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user?.passwordHash) {
    return { success: false, error: "Password change is unavailable for this account." };
  }

  const isValid = await verifyPassword(currentPassword, user.passwordHash);
  if (!isValid) {
    return { success: false, error: "Current password is incorrect." };
  }

  const passwordHash = await hashPassword(newPassword);
  await db.user.update({ where: { id: user.id }, data: { passwordHash } });

  return { success: true };
}
