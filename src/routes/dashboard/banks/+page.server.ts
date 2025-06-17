import { prisma } from '$lib/server/database.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  try {
    // Runtime validation of Prisma client
    const banks = await prisma.bankEligibility.findMany({
      where: {
        isDeleted: false
      },
      orderBy: {
        bankName: 'asc'
      },
      select: {
        id: true,
        bankName: true,
        classification: true,
        logoUrl: true,
        maximumPlAmount: true,
        maximumBlAmount: true,
        updatedAt: true,
        createdAt: true
      }
    });
    
    return {
      banks,
      user: locals.user
    };
  } catch (error) {
    console.error('Error in bank list page load:', error);
    return {
      banks: [],
      error: 'Failed to load bank data. Please ensure your database is properly set up and run "npm run db:reset" to seed the bank data.',
      user: locals.user
    };
  }
};
