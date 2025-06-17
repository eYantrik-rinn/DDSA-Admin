import { prisma } from './database.js';
import type { BankEligibility, BankEligibilityHistory, ChangeType } from '@prisma/client';

/**
 * Get all banks with optional filtering for deleted items
 */
export async function getAllBanks(includeDeleted: boolean = false) {
  return prisma.bankEligibility.findMany({
    where: includeDeleted ? {} : { isDeleted: false },
    orderBy: { bankName: 'asc' }
  });
}

/**
 * Get a single bank by ID
 */
export async function getBankById(id: string) {
  return prisma.bankEligibility.findUnique({
    where: { id }
  });
}

/**
 * Create a new bank
 */
export async function createBank(
  data: {
    bankName: string;
    classification: string;
    logoUrl?: string | null;
    eligibilityData: any;
    maximumPlAmount?: number | null;
    maximumBlAmount?: number | null;
    processingFees?: any | null;
  },
  userId: string | null = null
) {
  try {
    console.log('Creating bank in service with data:', {
      bankName: data.bankName,
      classification: data.classification,
      logoUrl: data.logoUrl
    });
    
    // Ensure proper type conversion for numeric fields
    const bankData = {
      ...data,
      maximumPlAmount: data.maximumPlAmount ? Number(data.maximumPlAmount) : null,
      maximumBlAmount: data.maximumBlAmount ? Number(data.maximumBlAmount) : null,
      createdBy: userId
    };
    
    // Create the bank
    const newBank = await prisma.bankEligibility.create({
      data: bankData
    });
    
    console.log('Bank created with ID:', newBank.id);
    
    // Now create the history record separately
    const historyRecord = await prisma.bankEligibilityHistory.create({
      data: {
        bankEligibilityId: newBank.id,
        bankName: data.bankName,
        eligibilityData: data.eligibilityData,
        maximumPlAmount: bankData.maximumPlAmount,
        maximumBlAmount: bankData.maximumBlAmount,
        processingFees: data.processingFees,
        changeType: 'CREATE',
        changedFields: ['ALL'],
        createdBy: userId
      }
    });
    
    console.log('History record created with ID:', historyRecord.id);
    
    return newBank;
  } catch (error) {
    console.error('Error in createBank service:', error);
    throw error;
  }
}
}
}

/**
 * Update an existing bank
 */
export async function updateBank(
  id: string,
  data: {
    bankName?: string;
    classification?: string;
    logoUrl?: string | null;
    eligibilityData?: any;
    maximumPlAmount?: number | null;
    maximumBlAmount?: number | null;
    processingFees?: any | null;
  },
  userId: string | null = null
) {
  // Get current data to track changes
  const currentBank = await prisma.bankEligibility.findUnique({
    where: { id }
  });

  if (!currentBank) {
    throw new Error('Bank not found');
  }

  // Track which fields are changing
  const changedFields: string[] = [];
  Object.keys(data).forEach(key => {
    if (JSON.stringify(data[key]) !== JSON.stringify(currentBank[key])) {
      changedFields.push(key);
    }
  });

  if (changedFields.length === 0) {
    return currentBank; // No changes needed
  }

  return prisma.bankEligibility.update({
    where: { id },
    data: {
      ...data,
      updatedBy: userId,
      updatedAt: new Date(),
      history: {
        create: {
          bankName: data.bankName || currentBank.bankName,
          eligibilityData: data.eligibilityData || currentBank.eligibilityData,
          maximumPlAmount: data.maximumPlAmount ?? currentBank.maximumPlAmount,
          maximumBlAmount: data.maximumBlAmount ?? currentBank.maximumBlAmount,
          processingFees: data.processingFees || currentBank.processingFees,
          changeType: 'UPDATE',
          changedFields,
          createdBy: userId
        }
      }
    }
  });
}

/**
 * Soft delete a bank
 */
export async function softDeleteBank(id: string, userId: string | null = null) {
  const bank = await prisma.bankEligibility.findUnique({
    where: { id }
  });

  if (!bank) {
    throw new Error('Bank not found');
  }

  return prisma.bankEligibility.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: userId,
      history: {
        create: {
          bankName: bank.bankName,
          eligibilityData: bank.eligibilityData,
          maximumPlAmount: bank.maximumPlAmount,
          maximumBlAmount: bank.maximumBlAmount,
          processingFees: bank.processingFees,
          changeType: 'DELETE',
          changedFields: ['isDeleted'],
          createdBy: userId
        }
      }
    }
  });
}

/**
 * Restore a soft-deleted bank
 */
export async function restoreBank(id: string, userId: string | null = null) {
  const bank = await prisma.bankEligibility.findUnique({
    where: { id }
  });

  if (!bank) {
    throw new Error('Bank not found');
  }

  if (!bank.isDeleted) {
    return bank; // Already active
  }

  return prisma.bankEligibility.update({
    where: { id },
    data: {
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
      history: {
        create: {
          bankName: bank.bankName,
          eligibilityData: bank.eligibilityData,
          maximumPlAmount: bank.maximumPlAmount,
          maximumBlAmount: bank.maximumBlAmount,
          processingFees: bank.processingFees,
          changeType: 'RESTORE',
          changedFields: ['isDeleted'],
          createdBy: userId
        }
      }
    }
  });
}

/**
 * Get history for a bank
 */
export async function getBankHistory(bankId: string) {
  return prisma.bankEligibilityHistory.findMany({
    where: {
      bankEligibilityId: bankId
    },
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      bankEligibility: {
        select: {
          bankName: true
        }
      }
    }
  });
}
