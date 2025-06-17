import { fail } from '@sveltejs/kit';
import { prisma } from '$lib/server/database.js';
import { generateResetToken, logAuthEvent } from '$lib/server/auth.js';
import { sendPasswordResetEmail } from '$lib/server/email.js';
import { forgotPasswordSchema } from '$lib/validation.js';
import { env } from '$env/dynamic/private';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    // Validate input
    const result = forgotPasswordSchema.safeParse(data);
    if (!result.success) {
      return fail(400, {
        errors: result.error.flatten().fieldErrors
      });
    }

    const { email } = result.data;

    try {
      // Find user
      const user = await prisma.examUser.findUnique({
        where: { email }
      });

      // Always return success to prevent email enumeration
      if (!user) {
        return {
          success: 'If an account with that email exists, we\'ve sent a password reset link.'
        };
      }

      // Generate reset token
      const resetToken = await generateResetToken();
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Update user with reset token
      await prisma.examUser.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry
        }
      });

      // Send reset email
      await sendPasswordResetEmail(email, resetToken, env.APP_URL);

      // Log forgot password event
      await logAuthEvent(user.id, 'forgot_password', { email });

      return {
        success: 'If an account with that email exists, we\'ve sent a password reset link.'
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      return fail(500, {
        error: 'An error occurred while processing your request'
      });
    }
  }
};
