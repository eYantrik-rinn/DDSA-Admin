<script lang="ts">
  import { enhance } from '$app/forms';
  import { onMount } from 'svelte';
  import { addRedirectHandler } from '$lib/redirect';
  import { toasts } from '$lib/stores/toast';
  import type { ActionData, PageData } from './$types';

  export let form: ActionData;
  export let data: PageData;

  let loading = false;

  // Watch for form changes to show appropriate toasts
  $: if (form) {
    if (form.error) {
      toasts.error(form.error);
    } else if (form.errors) {
      const errorMessages = Object.values(form.errors)
        .flat()
        .join(', ');
      if (errorMessages) {
        toasts.error(errorMessages);
      }
    }
  }

  onMount(() => {
    addRedirectHandler();
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    const debugParam = urlParams.get('debug');

    if (errorParam) {
      toasts.error(decodeURIComponent(errorParam));
    }

    if (debugParam === 'toasts') {
      toasts.error('This is an error toast test');
      setTimeout(() => toasts.success('This is a success toast test'), 300);
      setTimeout(() => toasts.info('This is an info toast test'), 600);
      setTimeout(() => toasts.warning('This is a warning toast test'), 900);
    }
  });
</script>

<svelte:head>
  <title>Login - Admin Dashboard</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4">
  <div class="max-w-sm w-full space-y-6 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
    <!-- Logo or Brand -->
    <div class="text-center">
      <svg class="mx-auto h-12 w-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0-1.1.9-2 2-2s2 .9 2 2-2 4-2 4m-4-4c0-1.1-.9-2-2-2s-2 .9-2 2 2 4 2 4m8-4V6a4 4 0 00-4-4H8a4 4 0 00-4 4v12a4 4 0 004 4h8a4 4 0 004-4v-6" />
      </svg>
      <h2 class="mt-4 text-2xl font-extrabold text-gray-900">Sign in to your dashboard</h2>
      <p class="mt-2 text-sm text-gray-500">Access your account in seconds</p>
    </div>

    <form
      method="POST"
      action=""
      use:enhance={() => {
        loading = true;
        toasts.info('Logging in...');
        return async ({ result }) => {
          loading = false;
          if (result.type === 'redirect') {
            // Handled by server-side redirect
          } else if (result.type === 'failure') {
            if (result.data?.error) {
              toasts.error(result.data.error);
            } else if (result.data?.errors) {
              const errorMessages = Object.values(result.data.errors)
                .flat()
                .join(', ');
              toasts.error(errorMessages || 'Form validation failed');
            } else {
              toasts.error('Login failed. Please check your credentials.');
            }
          }
        };
      }}
      class="space-y-5"
    >
      <input type="hidden" name="returnUrl" value={data.returnUrl || '/dashboard'} />

      <!-- Email Field -->
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          class="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
          placeholder="you@example.com"
          class:border-red-500={form?.errors?.email}
          aria-invalid={form?.errors?.email ? 'true' : undefined}
          aria-describedby={form?.errors?.email ? 'email-error' : undefined}
        />
        {#if form?.errors?.email}
          <p id="email-error" class="mt-1 text-xs text-red-600">{form.errors.email[0]}</p>
        {/if}
      </div>

      <!-- Password Field -->
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          class="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
          placeholder="••••••••"
          class:border-red-500={form?.errors?.password}
          aria-invalid={form?.errors?.password ? 'true' : undefined}
          aria-describedby={form?.errors?.password ? 'password-error' : undefined}
        />
        {#if form?.errors?.password}
          <p id="password-error" class="mt-1 text-xs text-red-600">{form.errors.password[0]}</p>
        {/if}
      </div>

      <!-- Forgot Password & Trust Signal -->
      <div class="flex items-center justify-between text-sm">
        <a href="/auth/forgot-password" class="text-primary-600 hover:text-primary-700 font-medium">Forgot password?</a>
        <div class="flex items-center space-x-1 text-gray-500">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0-1.1.9-2 2-2s2 .9 2 2-2 4-2 4m-4-4c0-1.1-.9-2-2-2s-2 .9-2 2 2 4 2 4m8-4V6a4 4 0 00-4-4H8a4 4 0 00-4 4v12a4 4 0 004 4h8a4 4 0 004-4v-6" />
          </svg>
          <span>Secure login</span>
        </div>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        disabled={loading}
        class="w-full py-3 px-6 text-base font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg focus:ring-4 focus:ring-primary-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
      >
        {#if loading}
          <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Signing in...</span>
        {:else}
          <span>Sign in now</span>
        {/if}
      </button>
    </form>

    <!-- Register Link -->
    <p class="text-center text-sm text-gray-500">
      Don't have an account?
      <a href="/auth/register" class="text-primary-600 hover:text-primary-700 font-medium">Create one now</a>
    </p>
  </div>
</div>

<style>
  /* Ensure input fields are touch-friendly */
  input {
    min-height: 44px; /* Minimum touch target size */
  }

  /* Improve button tap area for mobile */
  button {
    min-height: 48px;
  }

  /* High contrast for accessibility */
  .text-primary-600 {
    color: #2563eb;
  }
  .bg-primary-600 {
    background-color: #2563eb;
  }
  .hover\:text-primary-700:hover {
    color: #1e40af;
  }
  .hover\:bg-primary-700:hover {
    background-color: #1e40af;
  }
</style>