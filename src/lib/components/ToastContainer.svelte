<script lang="ts">
  import { toasts } from '$lib/stores/toast';
  import Toast from './Toast.svelte';
</script>

<div
  id="toast-container"
  aria-live="assertive"
  class="fixed top-5 right-5 z-[9999] flex flex-col items-end space-y-2 pointer-events-none"
>
  {#each $toasts as toast (toast.id)}
    <Toast {toast} />
  {/each}
</div>