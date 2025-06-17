<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { toasts } from '$lib/stores/toast';

  export let data: { user?: App.Locals['user'] };

  let sidebarOpen = false;

  // Redirect if not authenticated
  onMount(() => {
    if (!data.user) {
      goto('/auth/login', { replaceState: true });
    } else {
      // Welcome message when entering dashboard
      toasts.success(`Welcome back, ${data.user.firstName || data.user.username}!`);
    }

    // Check for URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const messageParam = urlParams.get('message');

    if (messageParam) {
      toasts.info(decodeURIComponent(messageParam));
    }
  });

  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }

  function closeSidebar() {
    sidebarOpen = false;
  }

  // Navigation items
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Bank Management', href: '/dashboard/banks', icon: '🏦' },
    { name: 'Users', href: '/dashboard/users', icon: '👥' },
    { name: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
    { name: 'Analytics', href: '/dashboard/analytics', icon: '📈' },
    { name: 'Reports', href: '/dashboard/reports', icon: '📋' },
  ];
</script>

{#if data.user}
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Mobile sidebar backdrop -->
    {#if sidebarOpen}
      <div
        class="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity lg:hidden z-20"
        on:click={closeSidebar}
        on:keydown={(e) => e.key === 'Escape' && closeSidebar()}
        role="button"
        tabindex="0"
      ></div>
    {/if}

    <!-- Sidebar -->
    <div
      class="fixed inset-y-0 left-0 flex flex-col w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 z-30"
      class:translate-x-0={sidebarOpen}
      class:-translate-x-full={!sidebarOpen}
    >
      <!-- Sidebar header -->
      <div class="flex items-center justify-between h-16 px-6 bg-primary-600">
        <div class="flex items-center">
          <h1 class="text-xl font-bold text-white">Admin Panel</h1>
        </div>
        <button class="text-white hover:text-gray-200 lg:hidden" on:click={closeSidebar}>
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-4 py-6 space-y-2">
        {#each navigation as item}
          <a
            href={item.href}
            class="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-gray-100 group"
            class:bg-primary-50={$page.url.pathname === item.href}
            class:text-primary-700={$page.url.pathname === item.href}
            class:border-r-2={$page.url.pathname === item.href}
            class:border-primary-600={$page.url.pathname === item.href}
            class:text-gray-700={$page.url.pathname !== item.href}
            on:click={closeSidebar}
          >
            <span class="text-lg mr-3">{item.icon}</span>
            {item.name}
          </a>
        {/each}
      </nav>

      <!-- User menu -->
      <div class="p-4 border-t border-gray-200">
        <div class="flex items-center mb-4">
          <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <span class="text-primary-600 font-medium text-sm">
              {(data.user.firstName?.[0] ?? '') + (data.user.lastName?.[0] ?? '')}
            </span>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-900">
              {data.user.firstName ?? ''} {data.user.lastName ?? ''}
            </p>
            <p class="text-xs text-gray-500">{data.user.email}</p>
          </div>
        </div>
        <a
          href="/auth/logout"
          class="flex items-center px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <span class="mr-3">🚪</span>
          Sign out
        </a>
      </div>
    </div>

    <!-- Main content -->
    <div class="flex-1 flex flex-col lg:ml-0">
      <!-- Top navigation -->
      <header class="bg-white shadow-sm border-b border-gray-200">
        <div class="flex items-center justify-between h-16 px-6">
          <button class="text-gray-500 hover:text-gray-700 lg:hidden" on:click={toggleSidebar}>
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>

          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-500">Welcome back, {data.user.firstName ?? data.user.username}!</span>
          </div>
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </div>
{/if}