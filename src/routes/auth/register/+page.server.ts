import { fail, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/database.js';
import { hashPassword, createSession } from '$lib/server/auth.js';
import { registerSchema } from '$lib/validation.js';
import { redirectWithToast } from '$lib/toast-utils';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    // Validate form data
    const result = registerSchema.safeParse(data);
    if (!result.success) {
      return fail(400, {
        errors: result.error.flatten().fieldErrors,
      });
    }

    const { username, email, password, firstName, lastName } = result.data;

    try {
      // Check if email or username already exists
      const existingUser = await prisma.examUser.findFirst({
        where: {
          OR: [{ email }, { username }],
        },
      });

      if (existingUser) {
        return fail(400, {
          error:
            existingUser.email === email
              ? 'An account with this email already exists'
              : 'This username is already taken',
        });
      }

      // Hash the password
      const hashedPassword = await hashPassword(password);

      // Create new user in the database
      const user = await prisma.examUser.create({
        data: {
          username,
          email,
          password: hashedPassword,
          firstName: firstName ?? null,
          lastName: lastName ?? null,
        },
      });

      // Create a new session token
      const token = await createSession(user.id);

      // Set the session cookie
      cookies.set('session', token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      // Redirect to dashboard with a success message
      throw redirectWithToast('/dashboard', 'Account created successfully! Welcome to the dashboard', 'success');
    } catch (error) {
      if (error instanceof Response) throw error;

      console.error('Registration error:', error);
      return fail(500, {
        error: 'An error occurred during registration',
      });
    }
  },
};