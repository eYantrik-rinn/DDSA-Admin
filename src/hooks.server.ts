import { sequence } from '@sveltejs/kit/hooks';
import { dev } from '$app/environment';
import { validateSession } from '$lib/server/auth';
import type { Handle, HandleServerError } from '@sveltejs/kit';
import { safeDbOperation, prisma } from '$lib/server/database';

// Authentication hook
const authentication: Handle = async ({ event, resolve }) => {
  // Initialize default locals
  event.locals.user = null;
  event.locals.authErrors = [];

  try {
    // Check for session token in cookies
    const sessionToken = event.cookies.get('session');
    
    // Protected routes that require authentication
    const authRequired = event.url.pathname.startsWith('/dashboard') || 
                         event.url.pathname.startsWith('/api/') ||
                         event.url.pathname.startsWith('/profile');

    if (sessionToken) {
      // Try to get user from session
      const user = await validateSession(sessionToken);
      
      if (user) {
        event.locals.user = {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          isActive: user.isActive,
          firstName: user.firstName,
          lastName: user.lastName,
          sessionToken,
          returnUrl: event.url.pathname
        };
        
        // Track user activity
        if (!event.url.pathname.startsWith('/api/')) {
          await safeDbOperation(async () => {
            await prisma.examSession.update({
              where: { token: sessionToken },
              data: { expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } // Extend session by 7 days
            });
          });
        }
      } else {
        // Clear invalid cookies
        event.cookies.delete('session', { path: '/' });
      }
    }
    
    // Handle protected routes
    if (authRequired && !event.locals.user) {
      // Remember the page they were trying to visit
      const returnUrl = event.url.pathname + event.url.search;
      
      return new Response(null, {
        status: 302,
        headers: { Location: `/login?returnUrl=${encodeURIComponent(returnUrl)}` }
      });
    }
    
    // Continue to the endpoint or page
    return resolve(event);
  } catch (error) {
    console.error('Hook error:', error);
    event.locals.authErrors?.push({
      status: 500,
      message: 'Authentication service error',
      timestamp: new Date().toISOString()
    });
    
    // Continue with the request, errors will be available in locals
    return resolve(event);
  }
};

// Rate limiting hook
const rateLimit: Handle = async ({ event, resolve }) => {
  // Get client IP
  const clientIp = event.getClientAddress();
  
  // Only rate limit specific endpoints that might be abused
  const shouldRateLimit = 
    event.url.pathname.startsWith('/login') || 
    event.url.pathname.startsWith('/register') || 
    event.url.pathname.startsWith('/api/auth') ||
    event.url.pathname.includes('reset-password');
  
  if (shouldRateLimit && event.request.method !== 'GET') {
    const MAX_REQUESTS = 10; // Max requests per minute
    const WINDOW_MS = 60 * 1000; // 1 minute window
    
    // Use memory cache for dev, would use Redis in production
    const cacheKey = `rate-limit:${clientIp}:${event.url.pathname}`;
    
    // In production you'd use Redis instead
    const cache = global as any;
    cache.rateLimits = cache.rateLimits || {};
    const now = Date.now();
    
    // Get existing record or create new one
    const record = cache.rateLimits[cacheKey] || { count: 0, resetAt: now + WINDOW_MS };
    
    // Reset if window has passed
    if (now > record.resetAt) {
      record.count = 0;
      record.resetAt = now + WINDOW_MS;
    }
    
    // Increment request count
    record.count += 1;
    cache.rateLimits[cacheKey] = record;
    
    // Check if rate limit exceeded
    if (record.count > MAX_REQUESTS) {
      return new Response(JSON.stringify({
        error: 'Too many requests, please try again later.'
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil((record.resetAt - now) / 1000))
        }
      });
    }
  }
  
  return resolve(event);
};

// Security headers hook
const securityHeaders: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);
  
  // Add security headers
  const headers = {
    // Prevent clickjacking
    'X-Frame-Options': 'SAMEORIGIN',
    // Help prevent XSS attacks
    'X-Content-Type-Options': 'nosniff',
    // Control browser features
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    // Enforce HTTPS
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    // Specify valid sources for loading resources
    'Content-Security-Policy': dev 
      ? "" // Disable in dev for hot reload
      : "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'"
  };
  
  // Apply all headers to the response
  Object.entries(headers).forEach(([key, value]) => {
    if (value) {
      response.headers.append(key, value);
    }
  });
  
  return response;
};

// Main handle function is a sequence of all middleware
export const handle = sequence(rateLimit, authentication, securityHeaders);

// Error handling
export const handleError: HandleServerError = ({ error, event }) => {
  console.error(`Error during request to ${event.url.pathname}:`, error);
  
  // Log the error to your monitoring system here
  
  return {
    message: 'An unexpected error occurred',
    code: (error as any)?.code || 'UNKNOWN',
  };
};
