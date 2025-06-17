import { redirect } from '@sveltejs/kit';
import { deleteSession } from '$lib/server/auth.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, locals }) => {
  // We don't need to modify locals directly, it will be cleared on the next request
  
  const token = cookies.get('session');
  
  if (token) {
    try {
      await deleteSession(token);
      console.log('Session deleted successfully');
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  }
  
  // Make sure the cookie is deleted with the correct path
  cookies.delete('session', { path: '/' });
  
  // Use a 303 status code for redirection after POST/DELETE operations
  throw redirect(303, '/auth/login?message=You+have+been+successfully+logged+out&type=success');
};