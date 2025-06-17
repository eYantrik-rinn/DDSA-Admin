<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { toasts } from '$lib/stores/toast';
  
  export let data;
  
  let banks = data.banks || [];
  let loading = false;
  let searchQuery = '';
  let showDeleted = false;
  let filteredBanks = [...banks];
  
  $: {
    if (banks.length > 0) {
      filteredBanks = banks.filter(bank => 
        bank.bankName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bank.classification.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
  }
  
  async function loadBanks() {
    try {
      loading = true;
      const response = await fetch(`/api/banks?includeDeleted=${showDeleted}`);
      if (!response.ok) throw new Error('Failed to fetch banks');
      const data = await response.json();
      banks = data.banks;
      loading = false;
    } catch (error) {
      console.error('Error loading banks:', error);
      toasts.error('Failed to load bank data');
      loading = false;
    }
  }
  
  async function deleteBank(id) {
    if (!confirm('Are you sure you want to delete this bank?')) return;
    
    try {
      loading = true;
      const response = await fetch(`/api/banks/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete bank');
      
      toasts.success('Bank deleted successfully');
      loadBanks();
    } catch (error) {
      console.error('Error deleting bank:', error);
      toasts.error('Failed to delete bank');
      loading = false;
    }
  }
  
  async function restoreBank(id) {
    try {
      loading = true;
      const response = await fetch(`/api/banks/${id}/restore`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Failed to restore bank');
      
      toasts.success('Bank restored successfully');
      loadBanks();
    } catch (error) {
      console.error('Error restoring bank:', error);
      toasts.error('Failed to restore bank');
      loading = false;
    }
  }
  
  function formatCurrency(value) {
    if (!value) return '-';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  }
  
  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  onMount(() => {
    if (data.error) {
      toasts.error(data.error);
    }
  });
</script>

<svelte:head>
  <title>Bank Management - Admin Dashboard</title>
</svelte:head>

<div class="space-y-6">
  <!-- Page header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-gray-900">Bank Management</h1>
      <p class="mt-2 text-sm text-gray-600">Manage bank eligibility criteria and loan details</p>
    </div>
    <div>
      <a
        href="/dashboard/banks/create"
        class="px-4 py-2 bg-primary-600 text-white rounded-lg shadow-sm text-sm font-medium hover:bg-primary-700 transition-all transform hover:scale-105"
      >
        Add New Bank
      </a>
    </div>
  </div>

  <!-- Search and filter controls -->
  <div class="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200">
    <div class="flex-1 min-w-[260px]">
      <div class="relative">
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Search by bank name or classification..."
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
        />
        <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
    </div>
    
    <div class="flex items-center">
      <label class="inline-flex items-center cursor-pointer">
        <input type="checkbox" bind:checked={showDeleted} on:change={loadBanks} class="form-checkbox h-5 w-5 text-primary-600" />
        <span class="ml-2 text-sm text-gray-700">Show deleted banks</span>
      </label>
      
      <button
        on:click={loadBanks}
        class="ml-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
      >
        <span class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </span>
      </button>
    </div>
  </div>

  <!-- Banks table -->
  <div class="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classification</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max PL Amount</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max BL Amount</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          {#if loading}
            <tr>
              <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                <div class="flex justify-center items-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading banks...
                </div>
              </td>
            </tr>
          {:else if filteredBanks.length === 0}
            <tr>
              <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                {#if searchQuery}
                  No banks match your search criteria
                {:else if showDeleted}
                  No deleted banks found
                {:else}
                  No banks available. Add your first bank!
                {/if}
              </td>
            </tr>
          {:else}
            {#each filteredBanks as bank (bank.id)}
              <tr class="{bank.isDeleted ? 'bg-red-50' : 'hover:bg-gray-50'} transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    {#if bank.logoUrl}
                      <div class="flex-shrink-0 h-10 w-10 mr-4">
                        <img class="h-10 w-10 object-contain" src={bank.logoUrl} alt="{bank.bankName} logo" />
                      </div>
                    {:else}
                      <div class="flex-shrink-0 h-10 w-10 bg-primary-100 mr-4 flex items-center justify-center rounded-full">
                        <span class="text-primary-600 font-medium text-sm">
                          {bank.bankName.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    {/if}
                    <div>
                      <div class="text-sm font-medium text-gray-900">{bank.bankName}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {bank.classification}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(bank.maximumPlAmount)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(bank.maximumBlAmount)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(bank.updatedAt)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  {#if bank.isDeleted}
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Deleted
                    </span>
                  {:else}
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  {/if}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex justify-end space-x-2">
                    <a 
                      href={`/dashboard/banks/${bank.id}/history`}
                      class="text-primary-600 hover:text-primary-900"
                      title="View History"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </a>
                    
                    {#if !bank.isDeleted}
                      <a 
                        href={`/dashboard/banks/${bank.id}`}
                        class="text-gray-600 hover:text-gray-900"
                        title="View Details"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </a>
                        <a 
                        href={`/dashboard/banks/edit/${bank.id}`}
                        class="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </a>
                      
                      <button
                        on:click={() => deleteBank(bank.id)}
                        class="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    {:else}
                      <button
                        on:click={() => restoreBank(bank.id)}
                        class="text-green-600 hover:text-green-900"
                        title="Restore"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    {/if}
                  </div>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </div>
  
  <!-- Info card -->
  <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
    <div class="flex">
      <div class="flex-shrink-0">
        <svg class="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="ml-3 flex-1 md:flex md:justify-between">
        <p class="text-sm text-blue-700">
          This dashboard allows you to manage bank eligibility data. Deleted banks are marked for deletion but not permanently removed.
        </p>
      </div>
    </div>
  </div>
</div>
