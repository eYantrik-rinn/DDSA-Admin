<script lang="ts">
  import { enhance } from '$app/forms';
  import { onMount } from 'svelte';
  import { toasts } from '$lib/stores/toast';
  import type { ActionData } from './$types';
  
  export let form: ActionData;
  
  let loading = false;
  
  $: {
    if (form?.success) {
      toasts.success(form.success);
    }
    
    if (form?.error) {
      toasts.error(form.error);
    }
  }
  
  onMount(() => {
    // Check for URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const messageParam = urlParams.get('message');
    
    if (messageParam) {
      toasts.info(decodeURIComponent(messageParam));
    }
  });
</script>

<svelte:head>
  <title>Forgot Password - Admin Dashboard</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <div class="text-center">
      <h2 class="mt-6 text-3xl font-bold text-gray-900">Forgot your password?</h2>
      <p class="mt-2 text-sm text-gray-600">
        Enter your email address and we'll send you a link to reset your password.
      </p>
    </div>
    
    <div class="bg-white py-8 px-6 shadow-xl rounded-xl border border-gray-100">
      <form method="POST" use:enhance={({ form, data, action, cancel }) => {
        loading = true;
        toasts.info('Processing your request...');
        
        return {
          result({ result }) {
            console.log('Forgot password result:', result);
            loading = false;
            
            if (result.type === 'success' && result.data?.success) {
              toasts.success(result.data.success);
            } else if (result.type === 'failure') {
              if (result.data?.error) {
                toasts.error(result.data.error);
              } else if (result.data?.errors) {
                const errorMessages = Object.values(result.data.errors)
                  .flat()
                  .join(', ');
                toasts.error(errorMessages || 'Request failed');
              } else {
                toasts.error('An error occurred. Please try again.');
              }
            }
          }
        };
      }}>
        <div class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="Enter your email"
              class:border-red-500={form?.errors?.email}
            />
            {#if form?.errors?.email}
              <p class="mt-1 text-sm text-red-600">{form.errors.email[0]}</p>
            {/if}
          </div>
          
          {#if form?.error}
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
              <p class="text-sm text-red-600">{form.error}</p>
            </div>
          {/if}
          
          {#if form?.success}
            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
              <p class="text-sm text-green-600">{form.success}</p>
            </div>
          {/if}
          
          <button
            type="submit"
            disabled={loading}
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {#if loading}
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending reset link...
            {:else}
              Send reset link
            {/if}
          </button>
          
          <div class="text-center">
            <a href="/auth/login" class="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors">
              Back to login
            </a>
          </div>
        </div>
      </form>
    </div>
  </div>
</div>