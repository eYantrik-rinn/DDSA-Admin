import { fail, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/database.js';
import { hashPassword } from '$lib/server/auth.js';
import { resetPasswordSchema } from '$lib/validation.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  const token = url.searchParams.get('token');
  
  if (!token) {
    throw redirect(302, '/auth/login');
  }

  // Check if token is valid
  const user = await prisma.examUser.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: {
        gt: new Date()
      }
    }
  });

  if (!user) {
    throw redirect(302, '/auth/login?error=Invalid+or+expired+token');
  }

  return { token };
};

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    const token = formData.get('token') as string;
    if (!token) {
      return fail(400, {
        error: 'Reset token is missing'
      });
    }

    // Validate input
    const result = resetPasswordSchema.safeParse(data);
    if (!result.success) {
      return fail(400, {
        errors: result.error.flatten().fieldErrors
      });
    }

    try {
      // Find user by token
      const user = await prisma.examUser.findFirst({
        where: {
          resetToken: token,
          resetTokenExpiry: {
            gt: new Date()
          }
        }
      });

      if (!user) {
        return fail(400, {
          error: 'Invalid or expired token'
        });
      }

      // Hash new password
      const hashedPassword = await hashPassword(result.data.password);

      // Update user password and clear reset token
      await prisma.examUser.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null
        }
      });

      return {
        success: 'Password reset successful. You can now log in with your new password.'
      };
    } catch (error) {
      console.error('Password reset error:', error);
      return fail(500, {
        error: 'An error occurred while resetting your password'
      });
    }
  }
};
