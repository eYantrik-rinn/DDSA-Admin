import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

function createToastStore() {
  const { subscribe, update } = writable<Toast[]>([]);

  // Generate unique IDs more reliably if supported
  function generateId() {
    return typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 9);
  }

  function addToast(message: string, type: ToastType = 'info', duration: number = 5000) {
    const id = generateId();

    update((toasts) => [...toasts, { id, message, type, duration }]);

    if (duration > 0) {
      const timeout = setTimeout(() => {
        removeToast(id);
      }, duration);

      // Optional: store timeout id if you want to clear it on manual removal
      // e.g. maintain a Map<string, ReturnType<typeof setTimeout>> here
    }

    return id;
  }

  function removeToast(id: string) {
    update((toasts) => toasts.filter((t) => t.id !== id));
    // Optional: clear timeout if stored
  }

  return {
    subscribe,
    success: (message: string, duration?: number) => addToast(message, 'success', duration),
    error: (message: string, duration?: number) => addToast(message, 'error', duration),
    info: (message: string, duration?: number) => addToast(message, 'info', duration),
    warning: (message: string, duration?: number) => addToast(message, 'warning', duration),
    remove: removeToast
  };
}

export const toasts = createToastStore();
