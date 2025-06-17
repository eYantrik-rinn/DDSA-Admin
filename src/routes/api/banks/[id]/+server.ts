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
    
    const bank = await bankService.getBankById(params.id);
    
    if (!bank) {
      return json({ error: 'Bank not found' }, { status: 404 });
    }
    
    return json({ bank });
  } catch (error) {
    console.error(`Error fetching bank ${params.id}:`, error);
    return json({ error: 'Failed to fetch bank details' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
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
    
    const deleted = await bankService.softDeleteBank(params.id, locals.user.id);
    
    if (!deleted) {
      return json({ error: 'Bank not found or already deleted' }, { status: 404 });
    }
    
    return json({ success: true });
  } catch (error) {
    console.error(`Error deleting bank ${params.id}:`, error);
    return json({ error: 'Failed to delete bank' }, { status: 500 });
  }
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
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
    
    const bankData = await request.json();
    const updated = await bankService.updateBank(params.id, bankData, locals.user.id);
    
    if (!updated) {
      return json({ error: 'Bank not found' }, { status: 404 });
    }
    
    return json({ success: true, bank: updated });
  } catch (error) {
    console.error(`Error updating bank ${params.id}:`, error);
    return json({ error: 'Failed to update bank' }, { status: 500 });
  }
};
