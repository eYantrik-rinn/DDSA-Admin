import { goto } from '$app/navigation';
import { toasts } from '$lib/stores/toast';
import { redirect } from '@sveltejs/kit';

/**
 * Redirect with a toast message
 * @param url - URL to redirect to
 * @param message - Optional message to show in a toast
 * @param type - Toast type ('success' | 'error' | 'info' | 'warning')
 */
export function redirectWithToast(
  url: string,
  message?: string,
  type: 'success' | 'error' | 'info' | 'warning' = 'info'
) {
  if (typeof window !== 'undefined') {
    // Client-side redirect with toast
    if (message) {
      // Show toast based on type
      toasts[type]?.(message);

      // Delay navigation slightly so toast appears first
      setTimeout(() => {
        goto(url, { replaceState: true });
      }, 100);
    } else {
      goto(url, { replaceState: true });
    }
  } else {
    // Server-side redirect with toast info in URL
    if (message) {
      const separator = url.includes('?') ? '&' : '?';
      url = `${url}${separator}message=${encodeURIComponent(message)}&type=${type}`;
    }
    // Use SvelteKit's redirect function for server-side redirects
    throw redirect(302, url);
  }
}

/**
 * Show a toast notification based on URL parameters
 * and remove those parameters from the URL after displaying
 */
export function checkUrlForToastMessages() {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);
  const message = url.searchParams.get('message');
  const type = url.searchParams.get('type') as 'success' | 'error' | 'info' | 'warning' | null;

  if (message && type && ['success', 'error', 'info', 'warning'].includes(type)) {
    toasts[type]?.(decodeURIComponent(message));

    // Remove toast parameters from URL
    url.searchParams.delete('message');
    url.searchParams.delete('type');

    window.history.replaceState({}, '', url.pathname + url.search);
  }
}