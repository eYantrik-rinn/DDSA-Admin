// create-bank-test.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Testing bank creation...');
    
    // Create test bank data
    const testBank = {
      bankName: "Test Bank " + new Date().toISOString().slice(0, 19),
      classification: "PVT",
      logoUrl: "/bankList/HDFC-Bank.svg",
      eligibilityData: {
        "Home Loan-Direct Sale": "Yes",
        "Personal Loan": "Yes",
        "Business Loan": "No"
      },
      maximumPlAmount: 5000000,
      maximumBlAmount: 1000000,
      processingFees: {
        homeLoan: "0.5%",
        personalLoan: "1%",
        businessLoan: "2%"
      }
    };
    
    console.log('Creating bank with data:', testBank);
    
    // Create bank
    const createdBank = await prisma.bankEligibility.create({
      data: testBank
    });
    
    console.log('Bank created successfully with ID:', createdBank.id);
    
    // Create history entry
    const history = await prisma.bankEligibilityHistory.create({
      data: {
        bankEligibilityId: createdBank.id,
        bankName: testBank.bankName,
        eligibilityData: testBank.eligibilityData,
        maximumPlAmount: testBank.maximumPlAmount,
        maximumBlAmount: testBank.maximumBlAmount,
        processingFees: testBank.processingFees,
        changeType: 'CREATE',
        changedFields: ['ALL']
      }
    });
    
    console.log('History created successfully with ID:', history.id);
    
    return { bank: createdBank, history: history };
  } catch (error) {
    console.error('Error creating test bank:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(result => {
    console.log('Test completed successfully!');
  })
  .catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });
