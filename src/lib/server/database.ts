import { PrismaClient } from '@prisma/client';
import { env } from '$env/dynamic/private';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  errorFormat: 'pretty',
});

// Prevent multiple instances during hot reloading in dev
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Handle database connection errors
prisma.$on('error', (e) => {
  console.error('Prisma Client Error:', e);
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

/**
 * Helper to handle DB errors and safely return results
 */
export async function safeDbOperation<T>(operation: () => Promise<T>, fallback: T | null = null): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    console.error('Database operation failed:', error);
    return fallback;
  }
}

/**
 * Safely execute transactions with proper error handling and retries
 */
export async function withTransaction<T>(
  callback: (tx: PrismaClient) => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      return await prisma.$transaction(callback);
    } catch (error) {
      retries++;
      console.error(`Transaction failed (attempt ${retries}/${maxRetries}):`, error);
      
      // If max retries reached, rethrow
      if (retries >= maxRetries) throw error;
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 2 ** retries * 100));
    }
  }
  
  throw new Error('Transaction failed after maximum retries');
}