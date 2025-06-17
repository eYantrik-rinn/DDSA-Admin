<script>
  import Sidebar from '$lib/Sidebar.svelte';
  import { onMount } from 'svelte';

  let userEmail = '';

  onMount(async () => {
    const res = await fetch('/dashboard');
    if (res.ok) {
      const data = await res.json();
      userEmail = data.email;
    }
  });
</script>

<svelte:head>
  <title>Dashboard - Admin Dashboard</title>
</svelte:head>

<div class="container">
  <Sidebar />
  <main class="main-content" aria-label="Dashboard main content">
    <h1>Welcome to your Dashboard</h1>
    {#if userEmail}
      <p>Logged in as: {userEmail}</p>
    {/if}
    <section>
      <h2>Widgets</h2>
      <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
        <div style="background: white; padding: 1rem; border-radius: 0.5rem; flex: 1 1 200px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
          <h3>Widget 1</h3>
          <p>Placeholder content</p>
        </div>
        <div style="background: white; padding: 1rem; border-radius: 0.5rem; flex: 1 1 200px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
          <h3>Widget 2</h3>
          <p>Placeholder content</p>
        </div>
        <div style="background: white; padding: 1rem; border-radius: 0.5rem; flex: 1 1 200px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
          <h3>Widget 3</h3>
          <p>Placeholder content</p>
        </div>
      </div>
    </section>
  </main>
</div>
