import { json } from '@sveltejs/kit';
import * as bankService from '$lib/server/bank.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  try {
    // Only allow authenticated users
    if (!locals.user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const banks = await bankService.getAllBanks();
    return json({ banks });
  } catch (error) {
    console.error('Error fetching banks:', error);
    return json({ error: 'Failed to fetch banks' }, { status: 500 });
  }
};
