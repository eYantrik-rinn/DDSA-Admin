<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import type { PageData } from './$types';

  export let data: PageData;

  onMount(() => {
    // Redirect based on user authentication status
    goto(data?.user ? '/dashboard' : '/auth/login', { replaceState: true });
  });
</script>

<!-- Loading spinner UI -->
<div class="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
  <div class="text-center">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
    <p class="mt-4 text-gray-600">Loading...</p>
  </div>
</div>