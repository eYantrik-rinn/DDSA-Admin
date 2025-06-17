<script lang="ts">
  import { enhance } from '$app/forms';
  import { onMount } from 'svelte';
  import { toasts } from '$lib/stores/toast';
  import type { PageData, ActionData } from './$types';

  export let data: PageData;
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
    const errorParam = urlParams.get('error');
    
    if (errorParam) {
      toasts.error(decodeURIComponent(errorParam));
    }
  });
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Reset your password
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Enter your new password below
      </p>
    </div>

    {#if form?.success}
      <div class="rounded-md bg-green-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-green-800">
              {form.success}
            </p>
            <p class="mt-2 text-sm text-green-700">
              <a href="/auth/login" class="font-medium underline">Go to login</a>
            </p>
          </div>
        </div>
      </div>
    {:else}      <form method="POST" class="mt-8 space-y-6" use:enhance={({ form, data, action, cancel }) => {
        loading = true;
        toasts.info('Resetting password...');
        
        return {
          result({ result }) {
            console.log('Password reset result:', result);
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
                toasts.error(errorMessages || 'Password reset failed');
              } else {
                toasts.error('An error occurred. Please try again.');
              }
            }
          }
        };
      }}>
        <input type="hidden" name="token" value={data.token} />

        {#if form?.error}
          <div class="rounded-md bg-red-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">
                  {form.error}
                </h3>
              </div>
            </div>
          </div>
        {/if}

        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="password" class="sr-only">New Password</label>
            <input id="password" name="password" type="password" required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="New Password" />
            {#if form?.errors?.password}
              <p class="text-red-500 text-xs mt-1">{form.errors.password[0]}</p>
            {/if}
          </div>
          <div>
            <label for="confirmPassword" class="sr-only">Confirm New Password</label>
            <input id="confirmPassword" name="confirmPassword" type="password" required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Confirm New Password" />
            {#if form?.errors?.confirmPassword}
              <p class="text-red-500 text-xs mt-1">{form.errors.confirmPassword[0]}</p>
            {/if}
          </div>
        </div>

        <div>
          <button type="submit"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Reset Password
          </button>
        </div>
      </form>
    {/if}
  </div>
</div>
