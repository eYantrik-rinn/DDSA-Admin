import { prisma } from '$lib/server/database.js';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
  // Ensure user is authenticated
  if (!locals.user) {
    throw error(401, 'Unauthorized');
  }
  
  // Check if id is "create" - this is a special route we'll handle separately
  if (params.id === 'create') {
    throw redirect(307, '/dashboard/banks/create');
  }
  
  // Validate that the ID is a valid MongoDB ObjectID
  const MONGODB_OBJECTID_REGEX = /^[0-9a-fA-F]{24}$/;
  if (!MONGODB_OBJECTID_REGEX.test(params.id)) {
    throw error(400, 'Invalid bank ID format');
  }
  
  try {
    const bank = await prisma.bankEligibility.findUnique({
      where: {
        id: params.id
      }
    });
    
    if (!bank) {
      throw error(404, 'Bank not found');
    }
    
    // Get the recent history entries (last 5)
    const recentHistory = await prisma.bankEligibilityHistory.findMany({
      where: {
        bankEligibilityId: params.id
      },
      take: 5,
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return {
      bank,
      recentHistory
    };
  } catch (err) {
    console.error('Error loading bank details:', err);
    throw error(500, 'Error loading bank details: ' + (err instanceof Error ? err.message : String(err)));
  }
};
