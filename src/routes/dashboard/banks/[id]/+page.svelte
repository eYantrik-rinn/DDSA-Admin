<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { toasts } from '$lib/stores/toast';
  
  export let data;
  
  const bank = data.bank;
  const history = data.history || [];
  
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
  
  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete ${bank.bankName}?`)) return;
    
    try {
      const response = await fetch(`/api/banks/${bank.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete bank');
      
      toasts.success(`${bank.bankName} has been deleted`);
      goto('/dashboard/banks');
    } catch (error) {
      console.error('Error deleting bank:', error);
      toasts.error('Failed to delete bank');
    }
  }
</script>

<svelte:head>
  <title>{bank.bankName} - Bank Details</title>
</svelte:head>

<div class="space-y-6">
  <!-- Page header -->
  <div class="flex items-center justify-between">
    <div class="flex items-center space-x-3">
      <a href="/dashboard/banks" class="text-gray-400 hover:text-gray-600">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </a>
      
      <div>
        <h1 class="text-3xl font-bold text-gray-900">{bank.bankName}</h1>
        <p class="mt-1 text-sm text-gray-500">Bank Details and Eligibility Criteria</p>
      </div>
    </div>
    
    <div class="flex space-x-2">
      <a 
        href={`/dashboard/banks/${bank.id}/edit`}
        class="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        Edit Bank
      </a>
      
      <button 
        on:click={handleDelete}
        class="px-4 py-2 bg-red-600 text-white rounded-lg shadow-sm text-sm font-medium hover:bg-red-700 transition-colors"
      >
        Delete
      </button>
    </div>
  </div>

  <!-- Bank details cards -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div class="md:col-span-2">
      <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Bank Information</h2>
        
        <div class="flex items-center mb-6">
          {#if bank.logoUrl}
            <div class="mr-4">
              <img src={bank.logoUrl} alt={bank.bankName} class="h-16 w-16 object-contain" />
            </div>
          {:else}
            <div class="mr-4 h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center">
              <span class="text-primary-600 font-bold text-lg">
                {bank.bankName.slice(0, 2).toUpperCase()}
              </span>
            </div>
          {/if}
          
          <div>
            <h3 class="text-lg font-medium text-gray-900">{bank.bankName}</h3>
            <p class="text-sm text-gray-500">Classification: {bank.classification}</p>
            <p class="text-sm text-gray-500">Last Updated: {formatDate(bank.updatedAt)}</p>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 class="font-medium text-gray-700 mb-2">Maximum Amounts</h4>
            <dl class="space-y-2">
              <div class="flex justify-between">
                <dt class="text-sm text-gray-500">Max Personal Loan:</dt>
                <dd class="text-sm font-medium">{formatCurrency(bank.maximumPlAmount)}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-sm text-gray-500">Max Business Loan:</dt>
                <dd class="text-sm font-medium">{formatCurrency(bank.maximumBlAmount)}</dd>
              </div>
            </dl>
          </div>
          
          <div>
            <h4 class="font-medium text-gray-700 mb-2">Status</h4>
            <div class="flex items-center">
              <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bank.isDeleted ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                {bank.isDeleted ? 'Deleted' : 'Active'}
              </span>
              {#if bank.isDeleted}
                <span class="ml-2 text-xs text-gray-500">
                  Deleted on: {formatDate(bank.deletedAt)}
                </span>
              {/if}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div>
      <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Processing Fees</h2>
        
        {#if bank.processingFees}
          <div class="space-y-4">
            {#each Object.entries(bank.processingFees) as [key, value]}
              {#if value}
                <div class="border-b border-gray-100 pb-3">
                  <h4 class="font-medium text-gray-700 capitalize mb-1">{key.replace(/([A-Z])/g, ' $1')}</h4>
                  <p class="text-sm text-gray-600 whitespace-pre-line">{value}</p>
                </div>
              {/if}
            {/each}
          </div>
        {:else}
          <p class="text-gray-500 italic">No processing fee information available</p>
        {/if}
      </div>
    </div>
  </div>
  
  <!-- Eligibility data -->
  <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
    <h2 class="text-xl font-semibold text-gray-900 mb-4">Loan Eligibility Criteria</h2>
    
    <div class="space-y-8">
      <!-- Home Loan Section -->
      <div>
        <h3 class="text-lg font-medium text-gray-900 mb-3">Home Loan</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criteria</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Eligibility</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr>
                <td class="px-6 py-4 text-sm font-medium text-gray-900">Direct Sale</td>
                <td class="px-6 py-4 text-sm text-gray-500">{bank.eligibilityData['Home Loan-Direct Sale'] || '-'}</td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-sm font-medium text-gray-900">Resale with Registry</td>
                <td class="px-6 py-4 text-sm text-gray-500">{bank.eligibilityData['Home Loan-Resale with Registry'] || '-'}</td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-sm font-medium text-gray-900">Resale Without Registry (Endorsement)</td>
                <td class="px-6 py-4 text-sm text-gray-500">{bank.eligibilityData['Home Loan-Resale Without Regsitry (Endorsement)'] || '-'}</td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-sm font-medium text-gray-900">Seller BT in Lease Hold</td>
                <td class="px-6 py-4 text-sm text-gray-500">{bank.eligibilityData['Home Loan-Seller BT in Lease Hold'] || '-'}</td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-sm font-medium text-gray-900">Seller BT in Free Hold</td>
                <td class="px-6 py-4 text-sm text-gray-500">{bank.eligibilityData['Home Loan-Seller BT in Free Hold'] || '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- ROI Section -->
      <div>
        <h3 class="text-lg font-medium text-gray-900 mb-3">Rate of Interest (ROI) by CIBIL Score</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan Type</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">650-699</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">700-729</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">730-749</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">750-779</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">780-799</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">800+</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No CIBIL</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr>
                <td class="px-6 py-4 text-sm font-medium text-gray-900">Home Loan</td>
                <td class="px-6 py-4 text-sm text-gray-500">{bank.eligibilityData['(HL/Construction/Plot+Construction/Plot) ROI as per CIBIL / 650-699']}%</td>
                <td class="px-6 py-4 text-sm text-gray-500">{bank.eligibilityData['(HL/Construction/Plot+Construction/Plot) ROI as per CIBIL / 700-729']}%</td>
                <td class="px-6 py-4 text-sm text-gray-500">{bank.eligibilityData['(HL/Construction/Plot+Construction/Plot) ROI as per CIBIL / 730-749']}%</td>
                <td class="px-6 py-4 text-sm text-gray-500">{bank.eligibilityData['(HL/Construction/Plot+Construction/Plot) ROI as per CIBIL / 750-779']}%</td>
                <td class="px-6 py-4 text-sm text-gray-500">{bank.eligibilityData['(HL/Construction/Plot+Construction/Plot) ROI as per CIBIL / 780-799']}%</td>
                <td class="px-6 py-4 text-sm text-gray-500">{bank.eligibilityData['(HL/Construction/Plot+Construction/Plot) ROI as per CIBIL / 800+']}%</td>
                <td class="px-6 py-4 text-sm text-gray-500">{bank.eligibilityData['(HL/Construction/Plot+Construction/Plot) ROI as per CIBIL / No CIBIL or -1']}%</td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-sm font-medium text-gray-900">Top Up</td>
                <td class="px-6 py-4 text-sm text-gray-500">{bank.eligibilityData['Top up  ROI as per CIBIL / 650-699']}%</td>
                <td class="px-6 py-4 text-sm text-gray-500">{bank.eligibilityData['Top up  ROI as per CIBIL / 700-729']}%</td>
                <td class="px-6 py-4 text-sm text-gray-500">{bank.eligibilityData['Top up  ROI as per CIBIL / 730-749']}%</td>
                <td class="px-6 py-4 text-sm text-gray-500">{bank.eligibilityData['Top up  ROI as per CIBIL / 750-779']}%</td>
                <td class="px-6 py-4 text-sm text-gray-500">{bank.eligibilityData['Top up  ROI as per CIBIL / 780-799']}%</td>
                <td class="px-6 py-4 text-sm text-gray-500">{bank.eligibilityData['Top up  ROI as per CIBIL / 800+']}%</td>
                <td class="px-6 py-4 text-sm text-gray-500">{bank.eligibilityData['Top up  ROI as per CIBIL / No CIBIL or -1']}%</td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-sm font-medium text-gray-900">LAP</td>
                <td class="px-6 py-4 text-sm text-gray-500">{bank.eligibilityData['LAP  ROI as per CIBIL / 650-699']}%</td>
                <td class="px-6 py-4 text-sm text-gray-500">{bank.eligibilityData['LAP  ROI as per CIBIL / 700-729']}%</td>
                <td class="px-6 py-4 text-sm text-gray-500">{bank.eligibilityData['LAP  ROI as per CIBIL / 730-749']}%</td>
                <td class="px-6 py-4 text-sm text-gray-500">{bank.eligibilityData['LAP  ROI as per CIBIL / 750-779']}%</td>
                <td class="px-6 py-4 text-sm text-gray-500">{bank.eligibilityData['LAP  ROI as per CIBIL / 780-799']}%</td>
                <td class="px-6 py-4 text-sm text-gray-500">{bank.eligibilityData['LAP  ROI as per CIBIL / 800+']}%</td>
                <td class="px-6 py-4 text-sm text-gray-500">{bank.eligibilityData['LAP  ROI as per CIBIL / No CIBIL or -1']}%</td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-sm font-medium text-gray-900">Personal Loan</td>
                <td class="px-6 py-4 text-sm text-gray-500">{bank.eligibilityData['Personal Loan ROI as per CIBIL / 650-699']}%</td>
                <td class="px-6 py-4 text-sm text-gray-500">{bank.eligibilityData['Personal Loan ROI as per CIBIL / 700-729']}%</td>
                <td class="px-6 py-4 text-sm text-gray-500">{bank.eligibilityData['Personal Loan ROI as per CIBIL / 730-749']}%</td>
                <td class="px-6 py-4 text-sm text-gray-500">{bank.eligibilityData['Personal Loan ROI as per CIBIL / 750-779']}%</td>
                <td class="px-6 py-4 text-sm text-gray-500">{bank.eligibilityData['Personal Loan ROI as per CIBIL / 780-799']}%</td>
                <td class="px-6 py-4 text-sm text-gray-500">{bank.eligibilityData['Personal Loan ROI as per CIBIL / 800+']}%</td>
                <td class="px-6 py-4 text-sm text-gray-500">{bank.eligibilityData['Personal Loan ROI as per CIBIL / No CIBIL or -1']}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  
  <!-- History section -->
  <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-semibold text-gray-900">Recent Changes</h2>
      <a href={`/dashboard/banks/${bank.id}/history`} class="text-primary-600 hover:underline text-sm font-medium">
        View Full History
      </a>
    </div>
    
    {#if history.length === 0}
      <div class="py-6 text-center text-gray-500">
        No history available for this bank
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change Type</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Changed Fields</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each history as record}
              <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(record.createdAt)}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getChangeTypeColor(record.changeType)}`}>
                    {record.changeType}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  {#if record.changedFields.includes('ALL')}
                    All fields (Initial creation)
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
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>
