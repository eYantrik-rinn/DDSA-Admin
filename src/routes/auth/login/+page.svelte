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
      console.log('Error detected in form data:', form.error);
      toasts.error(form.error);
    } else if (form.errors) {
      console.log('Validation errors detected:', form.errors);
      const errorMessages = Object.values(form.errors)
        .flat()
        .join(', ');
      if (errorMessages) {
        toasts.error(errorMessages);
      }
    }
  }

  onMount(() => {
    // Add global redirect handler for cross-window redirects
    addRedirectHandler();

    // Check for URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    const debugParam = urlParams.get('debug');

    if (errorParam) {
      toasts.error(decodeURIComponent(errorParam));
    }

    // Test toasts if debug parameter is present
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

<div
  class="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
>
  <div class="max-w-md w-full space-y-8">
    <div class="text-center">
      <h2 class="mt-6 text-3xl font-bold text-gray-900">Sign in to your account</h2>
      <p class="mt-2 text-sm text-gray-600">
        Or
        <a href="/auth/register" class="font-medium text-primary-600 hover:text-primary-500 transition-colors">
          create a new account
        </a>
        <span class="hidden">
          (<a href="?debug=toasts" class="text-xs text-gray-400">Test Toasts</a>)
        </span>
      </p>
    </div>

    <div class="bg-white py-8 px-6 shadow-xl rounded-xl border border-gray-100">
      <form
        method="POST"
        action=""
        use:enhance={() => {
          loading = true;
          toasts.info('Logging in...');
          return async ({ result }) => {
            loading = false;
            console.log('Form submission result:', result);

            if (result.type === 'redirect') {
              console.log('Redirecting to:', result.location);
              // Handled by server-side redirect
            } else if (result.type === 'failure') {
              console.log('Login failed:', result.data);
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
      >
        <input type="hidden" name="returnUrl" value={data.returnUrl || '/dashboard'} />
        {#if form?.error}
          <div class="mb-4 rounded-md bg-red-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-red-800">{form.error}</p>
              </div>
            </div>
          </div>
        {/if}
        <div class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2"> Email address </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="Enter your email"
              class:border-red-500={form?.errors?.email}
              aria-invalid={form?.errors?.email ? 'true' : undefined}
              aria-describedby={form?.errors?.email ? 'email-error' : undefined}
            />
            {#if form?.errors?.email}
              <p id="email-error" class="mt-1 text-sm text-red-600">{form.errors.email[0]}</p>
            {/if}
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2"> Password </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="Enter your password"
              class:border-red-500={form?.errors?.password}
              aria-invalid={form?.errors?.password ? 'true' : undefined}
              aria-describedby={form?.errors?.password ? 'password-error' : undefined}
            />
            {#if form?.errors?.password}
              <p id="password-error" class="mt-1 text-sm text-red-600">{form.errors.password[0]}</p>
            {/if}
          </div>

          <div class="flex items-center justify-between">
            <div class="text-sm">
              <a
                href="/auth/forgot-password"
                class="font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                Forgot your password?
              </a>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {#if loading}
              <svg
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Signing in...
            {:else}
              Sign in
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
</div>