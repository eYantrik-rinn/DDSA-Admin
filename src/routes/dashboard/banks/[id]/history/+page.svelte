<script lang="ts">
  import { onMount } from 'svelte';
  import { toasts } from '$lib/stores/toast';
  
  export let data;
  
  const bank = data.bank;
  const history = data.history || [];
  
  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  function getChangeTypeColor(type) {
    switch(type) {
      case 'CREATE': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-blue-100 text-blue-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'RESTORE': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
</script>

<svelte:head>
  <title>{bank.bankName} - Change History</title>
</svelte:head>

<div class="space-y-6">
  <!-- Page header -->
  <div class="flex items-center justify-between">
    <div class="flex items-center space-x-3">
      <a href="/dashboard/banks/{bank.id}" class="text-gray-400 hover:text-gray-600">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </a>
      
      <div>
        <h1 class="text-3xl font-bold text-gray-900">{bank.bankName} History</h1>
        <p class="mt-1 text-sm text-gray-500">Complete change history log</p>
      </div>
    </div>
  </div>

  <!-- Bank info -->
  <div class="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
    <div class="flex items-center">
      {#if bank.logoUrl}
        <div class="mr-4">
          <img src={bank.logoUrl} alt={bank.bankName} class="h-12 w-12 object-contain" />
        </div>
      {:else}
        <div class="mr-4 h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
          <span class="text-primary-600 font-bold text-lg">
            {bank.bankName.slice(0, 2).toUpperCase()}
          </span>
        </div>
      {/if}
      
      <div>
        <h3 class="text-lg font-medium text-gray-900">{bank.bankName}</h3>
        <p class="text-sm text-gray-500">Classification: {bank.classification}</p>
      </div>
      
      <div class="ml-auto">
        <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bank.isDeleted ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
          {bank.isDeleted ? 'Deleted' : 'Active'}
        </span>
      </div>
    </div>
  </div>
  
  <!-- History table -->
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-200">
      <h3 class="text-lg font-medium text-gray-900">Change History</h3>
      <p class="text-sm text-gray-500 mt-1">Complete audit trail of all changes to this bank</p>
    </div>
    
    {#if history.length === 0}
      <div class="py-8 text-center text-gray-500">
        No history records found for this bank
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change Type</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Changed Fields</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Changed By</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each history as record}
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(record.createdAt)}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getChangeTypeColor(record.changeType)}`}>
                    {record.changeType}
                  </span>
                </td>
                <td class="px-6 py-4">
                  {#if record.changedFields.includes('ALL')}
                    <span class="text-sm text-gray-500">All fields (Initial creation)</span>
                  {:else}
                    <div class="flex flex-wrap gap-1">
                      {#each record.changedFields as field}
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100">
                          {field}
                        </span>
                      {/each}
                    </div>
                  {/if}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.createdBy || 'System'}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <p class="text-sm text-gray-500">
          Showing {history.length} {history.length === 1 ? 'record' : 'records'} in chronological order
        </p>
      </div>
    {/if}
  </div>
</div>
