import { fail, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/database.js';
import { hashPassword, createSession, generateEmailVerificationToken, logAuthEvent, isStrongPassword } from '$lib/server/auth.js';
import { registerSchema } from '$lib/validation.js';
import { redirectWithToast } from '$lib/toast-utils';
import { sendEmailVerification } from '$lib/server/email.js';
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

    // Enforce strong password
    const passwordCheck = isStrongPassword(password);
    if (!passwordCheck.valid) {
      return fail(400, {
        error: passwordCheck.message || 'Password does not meet security requirements',
      });
    }

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

      // Create new user in the database with isEmailVerified false
      const user = await prisma.examUser.create({
        data: {
          username,
          email,
          password: hashedPassword,
          firstName: firstName ?? null,
          lastName: lastName ?? null,
          isEmailVerified: false,
        },
      });

      // Generate email verification token and send email
      const verificationToken = await generateEmailVerificationToken(user.id);
      await sendEmailVerification(email, verificationToken);

      // Log registration event
      await logAuthEvent(user.id, 'register', { email });

      // Create a new session token (optional: could require email verification before login)
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
      throw redirectWithToast('/dashboard', 'Account created successfully! Please verify your email.', 'success');
    } catch (error) {
      if (error instanceof Response) throw error;

      console.error('Registration error:', error);
      return fail(500, {
        error: 'An error occurred during registration',
      });
    }
  },
};
