import { json } from '@sveltejs/kit';
import * as bankService from '$lib/server/bank.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
  try {
    // Only allow authenticated users
    if (!locals.user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if id is "create" - this is a special route
    if (params.id === 'create') {
      return json({ error: 'Invalid route' }, { status: 400 });
    }
    
    // Validate that the ID is a valid MongoDB ObjectID
    const MONGODB_OBJECTID_REGEX = /^[0-9a-fA-F]{24}$/;
    if (!MONGODB_OBJECTID_REGEX.test(params.id)) {
      return json({ error: 'Invalid bank ID format' }, { status: 400 });
    }
    
    const history = await bankService.getBankHistory(params.id);
    
    return json({ history });
  } catch (error) {
    console.error(`Error fetching history for bank ${params.id}:`, error);
    return json({ error: 'Failed to fetch bank history' }, { status: 500 });
  }
};
