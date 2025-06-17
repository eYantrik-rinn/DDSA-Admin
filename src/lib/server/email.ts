import nodemailer from 'nodemailer';
import { env } from '$env/dynamic/private';

const transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  port: parseInt(env.EMAIL_PORT, 10),
  secure: false, // use STARTTLS for port 587
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS
  }
});

export async function sendPasswordResetEmail(email: string, resetToken: string, appUrl: string) {
  const resetUrl = `${appUrl}/auth/reset-password?token=${resetToken}`;

  // Log reset link during development only
  if (env.NODE_ENV === 'development') {
    console.log(`Password reset link for ${email}: ${resetUrl}`);
    return { messageId: 'dev-log' }; // Return mock response in development
  }

  const mailOptions = {
    from: env.EMAIL_FROM,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">Password Reset Request</h2>
        <p>You have requested to reset your password. Click the link below to reset it:</p>
        <a href="${resetUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}