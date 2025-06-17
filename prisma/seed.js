import { PrismaClient } from '@prisma/client';
import { banks } from '../src/lib/bankEligibilityData (3).js';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting to seed bank eligibility data...');
  
  // Clear existing data for clean start (remove in production)
  await prisma.bankEligibilityHistory.deleteMany({});
  await prisma.bankEligibility.deleteMany({});
  
  console.log(`Processing ${banks.length} banks...`);
  
  for (const bank of banks) {
    // Extract some common fields
    const { 
      BankName, 
      Classification, 
      URL, 
      MaximumPlAmount, 
      MaximumBlAmount 
    } = bank;
    
    // Extract processing fee details
    const processingFees = {
      homeLoan: bank['Processing Fee-(Home Loan/Plot/Plot+Construction/Construction)'] || '',
      topUp: bank['Processing Fee-Top up'] || '',
      lap: bank['Processing Fee-LAP'] || '', 
      personalLoan: bank['Processing Fee-Personal Loan'] || '',
      businessLoan: bank['Processing Fee-Business Loan'] || '',
      professionalLoan: bank['Processing Fee-Professional Loan'] || ''
    };
    
    // Remove specific fields that we've extracted separately
    const eligibilityData = { ...bank };
    delete eligibilityData.BankName;
    delete eligibilityData.Classification;
    delete eligibilityData.URL;
    delete eligibilityData.MaximumPlAmount;
    delete eligibilityData.MaximumBlAmount;
    delete eligibilityData['Processing Fee-(Home Loan/Plot/Plot+Construction/Construction)'];
    delete eligibilityData['Processing Fee-Top up'];
    delete eligibilityData['Processing Fee-LAP'];
    delete eligibilityData['Processing Fee-Personal Loan'];
    delete eligibilityData['Processing Fee-Business Loan'];
    delete eligibilityData['Processing Fee-Professional Loan'];
    
    try {
      // Create the bank entry
      const newBank = await prisma.bankEligibility.create({
        data: {
          bankName: BankName,
          classification: Classification || 'UNKNOWN',
          logoUrl: URL || null,
          maximumPlAmount: MaximumPlAmount || null,
          maximumBlAmount: MaximumBlAmount || null,
          eligibilityData: eligibilityData,
          processingFees: processingFees,
          history: {
            create: {
              bankName: BankName,
              eligibilityData: eligibilityData,
              maximumPlAmount: MaximumPlAmount || null,
              maximumBlAmount: MaximumBlAmount || null,
              processingFees: processingFees,
              changeType: 'CREATE',
              changedFields: ['ALL'],
            }
          }
        }
      });
      
      console.log(`Created bank: ${BankName}`);
    } catch (error) {
      console.error(`Error creating bank ${BankName}:`, error);
    }
  }
  
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
