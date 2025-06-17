/**
 * Adds a listener for redirect messages from iframes or child windows.
 * Only processes messages from the same origin.
 */
export function addRedirectHandler() {
  if (typeof window === 'undefined') return;

  window.addEventListener('message', (event: MessageEvent<{ type: string; url: string }>) => {
    // Accept messages only from same origin
    if (event.origin !== window.location.origin) return;

    if (event.data?.type === 'REDIRECT' && typeof event.data.url === 'string') {
      console.log('Received redirect message to:', event.data.url);
      window.location.href = event.data.url;
    }
  });
}

/**
 * Navigate to the specified URL.
 * If running inside an iframe or child window, posts a redirect message to the parent or opener.
 * Otherwise, performs direct navigation.
 * @param url - The URL to navigate to
 */
export function sendRedirect(url: string) {
  if (typeof window === 'undefined') return;

  // If inside an iframe, post message to parent window
  if (window.parent !== window) {
    window.parent.postMessage({ type: 'REDIRECT', url }, window.location.origin);
  } else if (window.opener && !window.opener.closed) {
    // If opened by another window, post message to opener
    window.opener.postMessage({ type: 'REDIRECT', url }, window.location.origin);
  } else {
    // Otherwise, do direct navigation
    window.location.href = url;
  }
}