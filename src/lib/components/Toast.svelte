<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { toasts, type Toast } from '$lib/stores/toast';

  export let toast: Toast;

  // Auto-dismiss logic
  let progressWidth = 100;
  let interval: ReturnType<typeof setInterval> | undefined;

  onMount(() => {
    if (toast.duration && toast.duration > 0) {
      const startTime = Date.now();
      const endTime = startTime + toast.duration;

      interval = setInterval(() => {
        const now = Date.now();
        progressWidth = ((endTime - now) / toast.duration) * 100;

        if (now >= endTime) {
          clearInterval(interval);
          toasts.remove(toast.id);
        }
      }, 10);
    }

    return () => interval && clearInterval(interval);
  });

  // Visual + icon styles based on toast type
  let bgColor: string;
  let progressColor: string;
  let iconSvg: string;

  $: {
    switch (toast.type) {
      case 'success':
        bgColor = 'bg-green-50';
        progressColor = 'bg-green-500';
        iconSvg = `<svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
        </svg>`;
        break;
      case 'error':
        bgColor = 'bg-red-50';
        progressColor = 'bg-red-500';
        iconSvg = `<svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
        </svg>`;
        break;
      case 'warning':
        bgColor = 'bg-yellow-50';
        progressColor = 'bg-yellow-500';
        iconSvg = `<svg class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
        </svg>`;
        break;
      case 'info':
      default:
        bgColor = 'bg-blue-50';
        progressColor = 'bg-blue-500';
        iconSvg = `<svg class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clip-rule="evenodd"></path>
        </svg>`;
        break;
    }
  }
</script>

<!-- Toast UI -->
<div
  class="toast-item flex w-full max-w-xs items-center rounded-lg p-4 text-gray-500 shadow-lg mb-3 {bgColor} pointer-events-auto"
  role="status"
  in:fly={{ y: 20, duration: 300 }}
  out:fade={{ duration: 200 }}
>
  <!-- Icon -->
  <div class="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center">
    {@html iconSvg}
  </div>

  <!-- Message -->
  <div class="ml-3 text-sm font-normal">{toast.message}</div>

  <!-- Close Button -->
  <button
    type="button"
    class="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 hover:bg-gray-100 hover:text-gray-900 focus:ring-2 focus:ring-gray-300"
    on:click={() => toasts.remove(toast.id)}
  >
    <span class="sr-only">Close</span>
    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
    </svg>
  </button>
</div>

<!-- Progress bar (only if timed) -->
{#if toast.duration && toast.duration > 0}
  <div class="relative h-0.5 overflow-hidden rounded-b-lg">
    <div
      class="absolute bottom-0 left-0 h-full {progressColor} transition-all duration-[10ms]"
      style="width: {progressWidth}%"
    ></div>
  </div>
{/if}