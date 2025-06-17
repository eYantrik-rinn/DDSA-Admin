import { json } from '@sveltejs/kit';
import * as bankService from '$lib/server/bank.js';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    // Only allow authenticated users
    if (!locals.user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('Creating new bank...');
    const data = await request.json();
    console.log('Bank data:', JSON.stringify(data, null, 2));
    
    try {
      const newBank = await bankService.createBank(data, locals.user.id);
      console.log('Bank created successfully:', newBank.id);
      return json({ bank: newBank, success: true }, { status: 201 });
    } catch (serviceError: any) {
      console.error('Bank service error:', serviceError);
      console.error('Error details:', serviceError.message || String(serviceError));
      if (serviceError.code) {
        console.error('Prisma error code:', serviceError.code);
      }
      return json({ error: `Service error: ${serviceError.message || String(serviceError)}` }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error creating new bank:', error);
    return json({ error: `Failed to create bank: ${error.message || String(error)}` }, { status: 500 });
  }
};
