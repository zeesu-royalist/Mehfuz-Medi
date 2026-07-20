import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM ?? "MR.SMEXO <no-reply@example.com>";

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  if (!resend) {
    // SMTP/Resend not configured — log so the flow is still testable locally.
    console.log(`[email:dev] Password reset link for ${email}: ${resetUrl}`);
    return;
  }
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Reset your password",
    html: `<p>We received a request to reset your password.</p>
           <p><a href="${resetUrl}">Click here to set a new password</a>. This link expires in 1 hour.</p>
           <p>If you didn't request this, you can safely ignore this email.</p>`,
  });
}

export async function sendVerificationEmail(email: string, verifyUrl: string) {
  if (!resend) {
    console.log(`[email:dev] Verification link for ${email}: ${verifyUrl}`);
    return;
  }
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Verify your email",
    html: `<p>Welcome! Please verify your email address.</p>
           <p><a href="${verifyUrl}">Click here to verify</a>.</p>`,
  });
}
