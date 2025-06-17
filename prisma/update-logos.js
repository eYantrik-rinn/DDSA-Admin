import { PrismaClient } from '@prisma/client';
import { banks } from '../src/lib/bankEligibilityData (3).js';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Function to normalize bank names to match logo filenames
function normalizeForFilename(name) {
  return name
    .replace(/\s+/g, '-')
    .replace(/&/g, '')
    .replace(/[^\w\-]/g, '');
}

// Function to find the closest matching logo filename
function findLogoFile(bankName, logoFiles) {
  const normalized = normalizeForFilename(bankName).toLowerCase();
  
  // Try exact match first
  const exactMatch = logoFiles.find(file => 
    file.toLowerCase() === `${normalized}.svg`
  );
  
  if (exactMatch) return exactMatch;
  
  // Try partial matches
  const partialMatches = logoFiles.filter(file => 
    file.toLowerCase().includes(normalized) ||
    normalized.includes(file.toLowerCase().replace(/\.svg$/, ''))
  );
  
  if (partialMatches.length > 0) {
    // Return the shortest matching name as it's likely the most precise match
    return partialMatches.sort((a, b) => a.length - b.length)[0];
  }
  
  // For banks with abbreviated names like SBI, try to match the abbreviation
  if (bankName.split(' ').length > 1) {
    const abbr = bankName.split(' ')
      .map(word => word[0])
      .join('')
      .toLowerCase();
      
    const abbrMatches = logoFiles.filter(file => 
      file.toLowerCase().includes(abbr)
    );
    
    if (abbrMatches.length > 0) {
      return abbrMatches[0];
    }
  }
  
  return null;
}

async function main() {
  try {
    console.log('Starting to update bank logos...');
    
    // Get list of all logo files
    const logoDir = path.resolve('static/bankList');
    const logoFiles = fs.readdirSync(logoDir);
    
    // Get all banks from database
    const dbBanks = await prisma.bankEligibility.findMany();
    console.log(`Found ${dbBanks.length} banks in the database`);
    
    // Update each bank with the logo URL
    let updateCount = 0;
    for (const bank of dbBanks) {
      const logoFile = findLogoFile(bank.bankName, logoFiles);
      
      if (logoFile) {
        const logoUrl = `/bankList/${logoFile}`;
        
        if (bank.logoUrl !== logoUrl) {
          // Update the bank with the new logo URL
          await prisma.bankEligibility.update({
            where: { id: bank.id },
            data: { logoUrl }
          });
          
          console.log(`Updated ${bank.bankName} with logo ${logoUrl}`);
          updateCount++;
        } else {
          console.log(`${bank.bankName} already has correct logo: ${logoUrl}`);
        }
      } else {
        console.log(`No matching logo found for ${bank.bankName}`);
      }
    }
    
    console.log(`Updated ${updateCount} banks with logo URLs`);
    console.log('Logo update completed successfully!');
  } catch (error) {
    console.error('Error updating logos:', error);
  }
}

main()
  .catch((e) => {
    console.error('Error during logo update:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
