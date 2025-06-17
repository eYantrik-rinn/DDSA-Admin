<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { toasts } from '$lib/stores/toast';
</script>

<slot />
