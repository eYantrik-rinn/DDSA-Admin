import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Checking Prisma client configuration...');
    
    // List all models and tables that Prisma knows about
    console.log('Prisma client object keys:', Object.keys(prisma));
    
    // Try to access our models
    console.log('Testing bank model access:');
    
    try {
      const banks = await prisma.bankEligibility.findMany({
        take: 1
      });
      console.log('Success! BankEligibility model is accessible.');
      console.log('Sample bank:', banks[0]);
    } catch (error) {
      console.error('Error accessing BankEligibility:', error);
    }
    
    try {
      const history = await prisma.bankEligibilityHistory.findMany({
        take: 1
      });
      console.log('Success! BankEligibilityHistory model is accessible.');
      console.log('Sample history:', history[0]);
    } catch (error) {
      console.error('Error accessing BankEligibilityHistory:', error);
    }
    
  } catch (error) {
    console.error('Error in main function:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
