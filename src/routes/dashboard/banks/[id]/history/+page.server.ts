import { prisma } from '$lib/server/database.js';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
  // Ensure user is authenticated
  if (!locals.user) {
    throw error(401, 'Unauthorized');
  }
  
  // Check if id is "create" - this is a special case
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
      },
      select: {
        id: true,
        bankName: true,
        classification: true,
        logoUrl: true,
        isDeleted: true
      }
    });
    
    if (!bank) {
      throw error(404, 'Bank not found');
    }
    
    // Get full history for the bank
    const history = await prisma.bankEligibilityHistory.findMany({
      where: {
        bankEligibilityId: params.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return {
      bank,
      history
    };
  } catch (err) {
    console.error('Error loading bank history:', err);
    throw error(500, 'Error loading bank history: ' + (err instanceof Error ? err.message : String(err)));
  }
};
