// check-prisma-direct.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Checking Prisma client configuration...');
    
    // List all models and tables that Prisma knows about
    console.log('Prisma client object keys:');
    console.log(Object.keys(prisma));
    
    // Try to access our models
    console.log('\nTesting bank model access:');
    
    if (prisma.bankEligibility) {
      console.log('BankEligibility exists in Prisma client');
      try {
        const banks = await prisma.bankEligibility.findMany({
          take: 1
        });
        console.log('Success! Found banks:', banks.length);
        if (banks.length > 0) {
          console.log('Sample bank id:', banks[0].id);
        }
      } catch (error) {
        console.error('Error accessing BankEligibility:', error);
      }
    } else {
      console.error('BankEligibility does not exist in Prisma client');
    }
    
    if (prisma.bankEligibilityHistory) {
      console.log('\nBankEligibilityHistory exists in Prisma client');
      try {
        const history = await prisma.bankEligibilityHistory.findMany({
          take: 1
        });
        console.log('Success! Found history entries:', history.length);
        if (history.length > 0) {
          console.log('Sample history id:', history[0].id);
        }
      } catch (error) {
        console.error('Error accessing BankEligibilityHistory:', error);
      }
    } else {
      console.error('BankEligibilityHistory does not exist in Prisma client');
    }
    
  } catch (error) {
    console.error('Error in main function:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
