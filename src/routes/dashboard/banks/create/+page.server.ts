import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    return { status: 302, redirect: '/auth/login' };
  }

  return {
    user: locals.user
  };
};
