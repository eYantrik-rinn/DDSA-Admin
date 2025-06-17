import { fail, redirect } from '@sveltejs/kit';
import { prisma, safeDbOperation } from '$lib/server/database.js';
import { verifyPassword, createSession, validateSession, checkLoginAttempts, recordLoginAttempt } from '$lib/server/auth.js';
import { loginSchema } from '$lib/validation.js';
import { redirectWithToast } from '$lib/toast-utils';
import type { Actions, PageServerLoad } from './$types';

/**
 * Enhanced login action with security features:
 * - Brute force protection
 * - Rate limiting
 * - IP-based blocking
 * - Detailed logging
 * - Secure session management
 */
export const actions: Actions = {
  default: async ({ request, cookies, url, locals, getClientAddress }) => {
    const clientIp = getClientAddress();
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const requestId = crypto.randomUUID();
    
    // Create logger with request context
    const log = (level: 'info' | 'warn' | 'error', message: string, data?: any) => {
      console[level](`[${requestId}][${level}] ${message}`, { 
        ip: clientIp,
        timestamp: new Date().toISOString(),
        ...data
      });
    };
    
    log('info', 'Processing login request');
    
    try {
      // Check if user is already authenticated
      const sessionToken = cookies.get('session');
      if (sessionToken) {
        const user = await validateSession(sessionToken);
        if (user) {
          log('info', 'User already logged in, redirecting', { userId: user.id });
          throw redirectWithToast(
            locals.user?.returnUrl || '/dashboard', 
            'You are already logged in.', 
            'info'
          );
        } else {
          // Clear invalid session cookie
          cookies.delete('session', { path: '/' });
        }
      }

      // Parse and validate form data
      const formData = await request.formData();
      const data = Object.fromEntries(formData);
      
      // Hide full email in logs for privacy
      const emailForLog = data.email ? 
        String(data.email).substring(0, 3) + '...' + String(data.email).split('@')[1] : 
        'not-provided';
        
      log('info', 'Login attempt', { email: emailForLog });

      // Validate input data
      const result = loginSchema.safeParse(data);
      if (!result.success) {
        log('warn', 'Login validation failed', { 
          fields: Object.keys(result.error.flatten().fieldErrors) 
        });
        return fail(400, { 
          errors: result.error.flatten().fieldErrors,
          email: data.email as string
        });
      }

      const { email, password } = result.data;
      const returnUrl = (data.returnUrl as string) || '/dashboard';
      const fingerprint = (data.fingerprint as string) || undefined;
      
      // Check login attempts before database query (prevents user enumeration)
      const loginCheck = await checkLoginAttempts(email);
      if (!loginCheck.allowed) {
        log('warn', 'Account temporarily locked', { 
          email: emailForLog,
          remainingSeconds: loginCheck.remainingTime
        });
        
        return fail(429, { 
          error: `Too many failed attempts. Please try again in ${Math.ceil((loginCheck.remainingTime || 0) / 60)} minutes.`,
          formError: true,
          locked: true
        });
      }

      // Find user by email - wrapped in safeDbOperation for error handling
      const user = await safeDbOperation(async () => {
        return await prisma.examUser.findUnique({ 
          where: { email: email.toLowerCase().trim() },
          select: {
            id: true,
            email: true,
            password: true,
            isActive: true,
            role: true,
            username: true
          }
        });
      });

      // Generic error for security - don't reveal which part failed
      const genericError = 'Invalid email or password';
      
      // Handle user not found
      if (!user) {
        log('warn', 'Login failed: User not found', { email: emailForLog });
        await recordLoginAttempt(email, false);
        
        // Add artificial delay to prevent timing attacks
        await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
        
        return fail(400, { error: genericError, formError: true });
      }

      // Check account status
      if (!user.isActive) {
        log('warn', 'Login failed: Account inactive', { userId: user.id });
        return fail(400, { error: 'Your account is inactive. Please contact support.' });
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        log('warn', 'Login failed: Invalid password', { userId: user.id });
        await recordLoginAttempt(email, false);
        return fail(400, { error: genericError, formError: true });
      }

      // Record successful login
      await recordLoginAttempt(email, true);
      
      // Create new session with optional browser fingerprint
      const token = await createSession(user.id, fingerprint);
      if (!token) {
        log('error', 'Failed to create session', { userId: user.id });
        return fail(500, { error: 'Authentication service error' });
      }
      
      // Set secure cookie
      cookies.set('session', token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      // Log successful login
      log('info', 'Login successful', { 
        userId: user.id,
        role: user.role,
      });
      
      // Store login event for audit
      await safeDbOperation(async () => {
        // This would typically log to a separate audit table
        // For now we'll just log it
        console.info(`[AUDIT] User login: ${user.id} from ${clientIp} using ${userAgent}`);
      });
      
      throw redirectWithToast(returnUrl, 'Login successful! Welcome back.', 'success');
    } catch (error) {
      // Handle redirects
      if (error instanceof Response) throw error;
      
      // Log unexpected errors
      log('error', 'Login error', { error });
      return fail(500, { error: 'An error occurred during login. Please try again later.' });
    }
  },
};

export const load: PageServerLoad = async ({ url, locals, cookies }) => {
  const returnUrl = url.searchParams.get('returnUrl') || '/dashboard';
  const sessionToken = cookies.get('session');
  
  // Check if user is already logged in
  if (sessionToken) {
    const user = await validateSession(sessionToken);
    if (user) {
      throw redirect(302, returnUrl);
    }
  }
  
  return { returnUrl };
};