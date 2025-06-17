import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
  console.log('Dashboard layout check - User authenticated:', !!locals.user);

  if (!locals.user) {
    console.log('Unauthorized access attempt to dashboard, redirecting to login');
    throw redirect(302, `/auth/login?returnUrl=${encodeURIComponent(url.pathname)}`);
  }

  console.log(`User ${locals.user.email} accessing dashboard`);
  return {
    user: locals.user ?? null,
  };
};