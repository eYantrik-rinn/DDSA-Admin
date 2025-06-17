import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma, safeDbOperation } from './database.js';
import { env } from '$env/dynamic/private';
import type { ExamUser } from '@prisma/client';
import crypto from 'crypto';
import speakeasy from 'speakeasy'; // For TOTP MFA

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  fingerprint?: string; // Browser fingerprint for advanced security
  // MFA is not in the schema, commenting out
  // mfaVerified?: boolean; // MFA verification flag
}

// Constants
const SALT_ROUNDS = 12;
const TOKEN_EXPIRY = '7d';
const SESSION_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// --- Password Utilities ---
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) return false;
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}

// --- Strong Password Validation ---
export function isStrongPassword(password: string): {valid: boolean; message?: string} {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  
  // Check for complexity requirements
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
    return { 
      valid: false, 
      message: 'Password must contain uppercase, lowercase, numbers, and special characters' 
    };
  }
  
  // Check if password is in common password list (simplified example)
  const commonPasswords = ['password123', 'Password123', 'admin123', '12345678'];
  if (commonPasswords.includes(password)) {
    return { valid: false, message: 'This password is too common and easily guessed' };
  }
  
  return { valid: true };
}

// --- JWT Utilities ---
export function generateToken(payload: TokenPayload): string {
  if (!env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  return jwt.sign(payload, env.JWT_SECRET, { 
    expiresIn: TOKEN_EXPIRY,
    jwtid: crypto.randomUUID() // Add unique identifier to each token
  });
}

export function verifyToken(token: string): TokenPayload | null {
  if (!token || !env.JWT_SECRET) return null;
  
  try {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// --- Login Security ---
export async function checkLoginAttempts(email: string): Promise<{allowed: boolean, remainingTime?: number}> {
  // This would ideally use Redis in production for better performance
  const cacheKey = `login:attempts:${email.toLowerCase()}`;
  const cache = global as any;
  cache.loginAttempts = cache.loginAttempts || {};
  
  const record = cache.loginAttempts[cacheKey] || { 
    count: 0, 
    lockedUntil: null 
  };
  
  const now = Date.now();
  
  // Check if account is locked
  if (record.lockedUntil && now < record.lockedUntil) {
    const remainingTime = Math.ceil((record.lockedUntil - now) / 1000);
    return { allowed: false, remainingTime };
  }
  
  // Reset lockout if it has expired
  if (record.lockedUntil && now >= record.lockedUntil) {
    record.count = 0;
    record.lockedUntil = null;
  }
  
  return { allowed: true };
}

export async function recordLoginAttempt(email: string, success: boolean): Promise<void> {
  const cacheKey = `login:attempts:${email.toLowerCase()}`;
  const cache = global as any;
  cache.loginAttempts = cache.loginAttempts || {};
  
  const record = cache.loginAttempts[cacheKey] || { 
    count: 0, 
    lockedUntil: null 
  };
  
  if (success) {
    // Reset on successful login
    record.count = 0;
    record.lockedUntil = null;
  } else {
    // Increment failure count
    record.count += 1;
    
    // Lock account after too many attempts
    if (record.count >= MAX_LOGIN_ATTEMPTS) {
      record.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
    }
  }
  
  cache.loginAttempts[cacheKey] = record;
}

// --- Session Management ---
export async function createSession(userId: string, fingerprint?: string, mfaVerified: boolean = false): Promise<string> {
  return await safeDbOperation(async () => {
    const user = await prisma.examUser.findUnique({ 
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true
        // MFA fields are not in the schema
        // mfaEnabled: true,
        // mfaSecret: true
      }
    });
    
    if (!user) throw new Error('User not found');
    if (!user.isActive) throw new Error('User account is inactive');    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      fingerprint
      // MFA is not in the schema
      // mfaVerified
    });

    await prisma.examSession.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + SESSION_EXPIRY_MS),
      },
    });

    return token;
  }, null) as string | null;
}

export async function validateSession(token: string, fingerprint?: string): Promise<ExamUser | null> {
  if (!token) return null;
  
  return await safeDbOperation(async () => {
    // First verify the JWT is valid without database lookup
    const payload = verifyToken(token);
    if (!payload) return null;
    
    // Optional fingerprint validation for advanced security
    if (fingerprint && payload.fingerprint && fingerprint !== payload.fingerprint) {
      console.warn('Session fingerprint mismatch, possible session hijacking attempt');
      await deleteSession(token);
      return null;
    }
    
    // Then check session in database
    const session = await prisma.examSession.findUnique({ where: { token } });
    if (!session) return null;

    // Check expiry
    if (session.expiresAt < new Date()) {
      await prisma.examSession.delete({ where: { id: session.id } });
      return null;
    }

    // Get user data
    const user = await prisma.examUser.findUnique({ where: { id: session.userId } });
    if (!user || !user.isActive) {
      await prisma.examSession.delete({ where: { id: session.id } });
      return null;
    }

    return user;
  }, null);
}

export async function deleteSession(token: string): Promise<boolean> {
  return await safeDbOperation(async () => {
    await prisma.examSession.deleteMany({ where: { token } });
    return true;
  }, false);
}

export async function deleteAllUserSessions(userId: string): Promise<boolean> {
  return await safeDbOperation(async () => {
    await prisma.examSession.deleteMany({ where: { userId } });
    return true;
  }, false);
}

// --- MFA (TOTP) Utilities ---
export function generateMfaSecret(): { ascii: string; base32: string; otpauth_url: string } {
  const secret = speakeasy.generateSecret({ length: 20, name: 'YourAppName' });
  return secret;
}

export function verifyMfaToken(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 1
  });
}

// --- Email Verification ---
export async function generateEmailVerificationToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.emailVerification.upsert({
    where: { userId },
    update: { token, expiresAt: expiry },
    create: { userId, token, expiresAt: expiry }
  });

  return token;
}

export async function verifyEmailVerificationToken(token: string): Promise<boolean> {
  const record = await prisma.emailVerification.findUnique({ where: { token } });
  if (!record) return false;
  if (record.expiresAt < new Date()) return false;

  await prisma.examUser.update({
    where: { id: record.userId },
    data: { isEmailVerified: true }
  });

  await prisma.emailVerification.delete({ where: { token } });

  return true;
}

// --- Audit Logging ---
export async function logAuthEvent(userId: string, event: string, data?: any): Promise<void> {
  await safeDbOperation(async () => {
    await prisma.authAuditLog.create({
      data: {
        userId,
        event,
        data: JSON.stringify(data || {}),
        timestamp: new Date()
      }
    });
  });
}

// --- Reset Token Generation ---
export async function generateResetToken(): Promise<string> {
  return crypto.randomBytes(32).toString('hex');
}
