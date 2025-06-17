<script lang="ts">
  import { page } from '$app/stores';
  import { slide } from 'svelte/transition';
  import { getUserInitials, getUserFullName, logout } from '$lib/auth-utils';
  
  export let user = $page.data.user;
  
  // Mobile navigation state
  let isMobileNavOpen = false;
  
  // Navigation items
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: 'home' },
    { name: 'Banks', href: '/dashboard/banks', icon: 'bank' },
    { name: 'Users', href: '/dashboard/users', icon: 'users' },
    { name: 'Settings', href: '/dashboard/settings', icon: 'settings' },
    { name: 'Reports', href: '/dashboard/reports', icon: 'chart' },
  ];
  
  // Toggle mobile navigation
  function toggleMobileNav() {
    isMobileNavOpen = !isMobileNavOpen;
  }
  
  // Handle logout
  async function handleLogout() {
    await logout();
  }
  
  // SVG icons mapped to icon names
  const icons = {
    home: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>`,
    users: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>`,
    settings: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
             </svg>`,
    chart: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>`,
    bank: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
          </svg>`,
    logout: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>`
  };
  
  // Check if a navigation item is active
  function isActive(href: string): boolean {
    return $page.url.pathname === href || $page.url.pathname.startsWith(`${href}/`);
  }
</script>

<!-- Mobile menu button (visible on smaller screens) -->
<div class="md:hidden fixed top-0 left-0 z-20 p-4">
  <button 
    type="button" 
    class="text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 p-1"
    aria-controls="mobile-menu" 
    aria-expanded={isMobileNavOpen} 
    on:click={toggleMobileNav}
  >
    <span class="sr-only">{isMobileNavOpen ? 'Close menu' : 'Open menu'}</span>
    {#if isMobileNavOpen}
      <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    {:else}
      <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    {/if}
  </button>
</div>

<!-- Mobile sidebar (overlay) -->
{#if isMobileNavOpen}
<div 
  class="fixed inset-0 bg-gray-600 bg-opacity-75 z-10 md:hidden" 
  aria-hidden="true"
  on:click={() => isMobileNavOpen = false}
  transition:slide={{ duration: 200 }}
></div>
{/if}

<!-- Sidebar for mobile (off-canvas) -->
<div 
  id="mobile-menu" 
  class="transform top-0 left-0 w-64 bg-white fixed h-full overflow-auto ease-in-out transition-all duration-300 z-30 {isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'} md:hidden"
>
  <div class="flex flex-col h-full">
    <!-- Logo and close button -->
    <div class="flex items-center justify-between px-4 py-6 border-b">
      <div class="text-xl font-bold text-gray-800">Admin Dashboard</div>
      <button 
        type="button" 
        class="text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-label="Close menu"
        on:click={() => isMobileNavOpen = false}
      >
        <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    
    <!-- Mobile navigation -->
    <nav class="mt-5 flex-1 px-2 pb-4 space-y-1">
      {#each navigation as item}
        <a 
          href={item.href}
          class="group flex items-center px-2 py-2 text-base font-medium rounded-md {isActive(item.href) ? 'bg-primary-100 text-primary-800' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}"
          aria-current={isActive(item.href) ? 'page' : undefined}
        >
          <div class="mr-4 flex-shrink-0 {isActive(item.href) ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'}">
            {@html icons[item.icon]}
          </div>
          {item.name}
        </a>
      {/each}
    </nav>
    
    <!-- Mobile user profile -->
    <div class="border-t border-gray-200 p-4">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          {#if user?.avatar}
            <img class="h-10 w-10 rounded-full" src={user.avatar} alt="" />
          {:else}
            <div class="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white">
              {getUserInitials(user)}
            </div>
          {/if}
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium text-gray-700">{getUserFullName(user)}</p>
          <p class="text-xs font-medium text-gray-500">{user?.email}</p>
        </div>
      </div>
      
      <div class="mt-3 space-y-1">
        <a 
          href="/dashboard/profile" 
          class="flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        >
          Your Profile
        </a>
        <button 
          on:click={handleLogout} 
          class="flex w-full items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        >
          <div class="mr-4 flex-shrink-0 text-gray-400 group-hover:text-gray-500">
            {@html icons.logout}
          </div>
          Sign out
        </button>
      </div>
    </div>
  </div>
</div>

<!-- Desktop sidebar (static) -->
<div class="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
  <div class="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
    <!-- Logo -->
    <div class="flex items-center h-16 flex-shrink-0 px-4 bg-white border-b border-gray-200">
      <div class="text-xl font-bold text-gray-800">Admin Dashboard</div>
    </div>
    
    <!-- Desktop navigation -->
    <div class="flex-1 flex flex-col overflow-y-auto">
      <nav class="flex-1 px-2 py-4 space-y-1">
        {#each navigation as item}
          <a 
            href={item.href}
            class="group flex items-center px-2 py-2 text-sm font-medium rounded-md {isActive(item.href) ? 'bg-primary-100 text-primary-800' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}"
            aria-current={isActive(item.href) ? 'page' : undefined}
          >
            <div class="mr-3 flex-shrink-0 {isActive(item.href) ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'}">
              {@html icons[item.icon]}
            </div>
            {item.name}
          </a>
        {/each}
      </nav>
    </div>
    
    <!-- Desktop user profile -->
    <div class="flex-shrink-0 flex border-t border-gray-200 p-4">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          {#if user?.avatar}
            <img class="h-8 w-8 rounded-full" src={user.avatar} alt="" />
          {:else}
            <div class="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm">
              {getUserInitials(user)}
            </div>
          {/if}
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium text-gray-700">{getUserFullName(user)}</p>
          <button 
            on:click={handleLogout} 
            class="text-xs font-medium text-gray-500 hover:text-gray-700 focus:outline-none focus:underline"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
