<script lang="ts">  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { toasts } from '$lib/stores/toast';
  import { 
    eligibilityFields, 
    roiFields, 
    processingFeeFields, 
    createDefaultEligibilityData, 
    cibilScoreRanges,
    roiFieldTemplates
  } from '$lib/bank-form-utils.js';
  
  export let data;
  
  let loading = false;
  let bankData = {
    bankName: '',
    classification: 'PVT', // Default value
    logoUrl: '',
    eligibilityData: createDefaultEligibilityData(),
    maximumPlAmount: 0,
    maximumBlAmount: 0,
    processingFees: {
      homeLoan: '',
      topUp: '',
      lap: '',
      personalLoan: '',
      businessLoan: '',
      professionalLoan: ''
    }
  };
    // We're already using the full eligibility data structure from createDefaultEligibilityData()
  
  async function handleSubmit() {
    if (!bankData.bankName) {
      toasts.error('Bank name is required');
      return;
    }
    
    try {
      loading = true;
      
      const response = await fetch('/api/banks/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bankData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create bank');
      }
      
      toasts.success('Bank created successfully');
      goto(`/dashboard/banks/${data.bank.id}`);
    } catch (error) {
      console.error('Error creating bank:', error);
      toasts.error(error.message || 'Failed to create bank');
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Create New Bank - Admin Dashboard</title>
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
        <h1 class="text-3xl font-bold text-gray-900">Create New Bank</h1>
        <p class="mt-1 text-sm text-gray-500">Add a new bank to the system</p>
      </div>
    </div>
  </div>

  <!-- Form -->
  <form on:submit|preventDefault={handleSubmit} class="space-y-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Basic Information -->
      <div class="space-y-6">
        <h2 class="text-xl font-semibold text-gray-900">Basic Information</h2>
        
        <div>
          <label for="bankName" class="block text-sm font-medium text-gray-700">Bank Name *</label>
          <input 
            type="text" 
            id="bankName" 
            bind:value={bankData.bankName} 
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            required
          />
        </div>
        
        <div>
          <label for="classification" class="block text-sm font-medium text-gray-700">Classification</label>
          <select 
            id="classification" 
            bind:value={bankData.classification}
            class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          >
            <option value="PVT">PVT</option>
            <option value="PSB">PSB</option>
            <option value="NBFC">NBFC</option>
            <option value="OTHER">OTHER</option>
          </select>
        </div>
        
        <div>
          <label for="logoUrl" class="block text-sm font-medium text-gray-700">Logo URL</label>
          <input 
            type="text" 
            id="logoUrl" 
            bind:value={bankData.logoUrl} 
            placeholder="https://example.com/logo.png"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>
      </div>
      
      <!-- Financial Details -->
      <div class="space-y-6">
        <h2 class="text-xl font-semibold text-gray-900">Financial Details</h2>
        
        <div>
          <label for="maximumPlAmount" class="block text-sm font-medium text-gray-700">Maximum Personal Loan Amount</label>
          <div class="mt-1 relative rounded-md shadow-sm">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span class="text-gray-500 sm:text-sm">₹</span>
            </div>
            <input 
              type="number" 
              id="maximumPlAmount" 
              bind:value={bankData.maximumPlAmount} 
              class="block w-full pl-7 pr-12 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="0"
              min="0"
            />
          </div>
        </div>
        
        <div>
          <label for="maximumBlAmount" class="block text-sm font-medium text-gray-700">Maximum Business Loan Amount</label>
          <div class="mt-1 relative rounded-md shadow-sm">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span class="text-gray-500 sm:text-sm">₹</span>
            </div>
            <input 
              type="number" 
              id="maximumBlAmount" 
              bind:value={bankData.maximumBlAmount} 
              class="block w-full pl-7 pr-12 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="0"
              min="0"
            />
          </div>
        </div>
      </div>
    </div>
      <!-- Eligibility Criteria -->
    <div>
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Basic Eligibility Criteria</h2>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {#each eligibilityFields as criteria}          
          <div class="border rounded-md p-4 bg-gray-50">
            <label class="flex items-center space-x-2">
              <input 
                type="checkbox" 
                checked={bankData.eligibilityData[criteria] === 'Yes'}
                on:change={(e) => bankData.eligibilityData[criteria] = e.target.checked ? 'Yes' : 'No'} 
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span class="text-sm font-medium text-gray-700">{criteria}</span>
            </label>
          </div>        {/each}
      </div>
      
      <!-- Interest Rate (ROI) Section -->
      <div class="mt-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Interest Rates (ROI) by CIBIL Score</h2>
        
        {#each roiFieldTemplates as template, i}
          <div class="mb-6 border-t pt-4">
            <h3 class="text-lg font-medium text-gray-800 mb-3">{template.split(' ROI as per CIBIL')[0]}</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {#each cibilScoreRanges as range}
                {@const fieldName = template.replace('{range}', range)}
                <div class="flex flex-col">
                  <label class="text-sm font-medium text-gray-700 mb-1">{range}</label>
                  <input
                    type="number"
                    step="0.01"
                    bind:value={bankData.eligibilityData[fieldName]}
                    class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0.00"
                  />
                </div>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    </div>
      <!-- Processing Fees -->
    <div>
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Processing Fees</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="processingFeesHomeLoan" class="block text-sm font-medium text-gray-700">Home Loan Processing Fee</label>
          <textarea 
            id="processingFeesHomeLoan" 
            bind:value={bankData.processingFees.homeLoan} 
            rows="2"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="e.g., 0.5% of loan amount + GST"
          ></textarea>
        </div>
        
        <div>
          <label for="processingFeesTopUp" class="block text-sm font-medium text-gray-700">Top-up Loan Processing Fee</label>
          <textarea 
            id="processingFeesTopUp" 
            bind:value={bankData.processingFees.topUp} 
            rows="2"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="e.g., 0.5% of loan amount + GST"
          ></textarea>
        </div>
        
        <div>
          <label for="processingFeesLAP" class="block text-sm font-medium text-gray-700">LAP Processing Fee</label>
          <textarea 
            id="processingFeesLAP" 
            bind:value={bankData.processingFees.lap} 
            rows="2"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="e.g., 1% of loan amount + GST"
          ></textarea>
        </div>
        
        <div>
          <label for="processingFeesPersonalLoan" class="block text-sm font-medium text-gray-700">Personal Loan Processing Fee</label>
          <textarea 
            id="processingFeesPersonalLoan" 
            bind:value={bankData.processingFees.personalLoan} 
            rows="2"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="e.g., 2% of loan amount + GST"
          ></textarea>
        </div>
        
        <div>
          <label for="processingFeesBusinessLoan" class="block text-sm font-medium text-gray-700">Business Loan Processing Fee</label>
          <textarea 
            id="processingFeesBusinessLoan" 
            bind:value={bankData.processingFees.businessLoan} 
            rows="2"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="e.g., 2.5% of loan amount + GST"
          ></textarea>
        </div>
        
        <div>
          <label for="processingFeesProfessionalLoan" class="block text-sm font-medium text-gray-700">Professional Loan Processing Fee</label>
          <textarea 
            id="processingFeesProfessionalLoan" 
            bind:value={bankData.processingFees.professionalLoan} 
            rows="2"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="e.g., 1.5% of loan amount + GST"
          ></textarea>
        </div>
      </div>
    </div>
    
    <!-- Submit Button -->
    <div class="flex justify-end pt-5">
      <a 
        href="/dashboard/banks"
        class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mr-3"
      >
        Cancel
      </a>
      <button
        type="submit"
        class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        disabled={loading}
      >
        {#if loading}
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Creating...
        {:else}
          Create Bank
        {/if}
      </button>
    </div>
  </form>
</div>
