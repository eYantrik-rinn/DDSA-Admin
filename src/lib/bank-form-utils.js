// This file contains the full data structure for bank eligibility fields
// Used by both create and edit forms to ensure consistency

// All eligibility fields (Yes/No fields)
export const eligibilityFields = [
  // Home Loan Fields
  'Home Loan-Direct Sale',
  'Home Loan-Resale with Registry',
  'Home Loan-Resale Without Regsitry (Endorsement)',
  'Home Loan-Seller BT in Lease Hold',
  'Home Loan-Seller BT in Free Hold',
  
  // Plot+Construction Fields
  'Plot+Construction-Direct Sale',
  'Plot+Construction-Resale with Registry',
  'Plot+Construction-Resale Without Regsitry',
  'Plot+Construction-Seller BT in Lease Hold',
  'Plot+Construction-Seller BT in Free Hold',
  
  // Plot Loan Fields
  'Plot Loan-Direct Sale from Builder',
  'Plot Loan-Direct Sale from Authority',
  'Plot Loan-Resale with Registry',
  'Plot Loan-Resale Without Registry',
  'Plot Loan-Seller BT in Lease Hold',
  'Plot Loan-Seller BT in Free Hold',
  
  // Plot+Equity Fields
  'Plot+Equity-Direct Sale',
  'Plot+Equity-Resale',
  
  // LAP Fields
  'LAP-Against Residential Property',
  'LAP-Against Plot',
  
  // Other Loan Types
  'DOD (Drop-line Over Draft)',
  'Top up',
  'Personal Loan',
  'Business Loan',
  'Professional Loan'
];

// CIBIL score ranges used across different loan types
export const cibilScoreRanges = [
  '650-699',
  '700-729',
  '730-749',
  '750-779',
  '780-799',
  '800+',
  'No CIBIL or -1'
];

// ROI field templates for different loan types
export const roiFieldTemplates = [
  '(HL/Construction/Plot+Construction/Plot) ROI as per CIBIL / {range}',
  'Top up ROI as per CIBIL / {range}',
  'LAP ROI as per CIBIL / {range}',
  'Personal Loan ROI as per CIBIL / {range}',
  'Business Loan ROI as per CIBIL / {range}',
  'Professional Loan ROI as per CIBIL / {range}',
  'Business Loan DOD ROI as per CIBIL / {range}',
  'Personal Loan DOD ROI as per CIBIL / {range}',
  'Professional Loan DOD ROI as per CIBIL / {range}'
];

// Generate all ROI field names
export const roiFields = [];
roiFieldTemplates.forEach(template => {
  cibilScoreRanges.forEach(range => {
    roiFields.push(template.replace('{range}', range));
  });
});

// Processing fee fields
export const processingFeeFields = {
  homeLoan: 'Processing Fee-(Home Loan/Plot/Plot+Construction/Construction)',
  topUp: 'Processing Fee-Top up',
  lap: 'Processing Fee-LAP',
  personalLoan: 'Processing Fee-Personal Loan',
  businessLoan: 'Processing Fee-Business Loan',
  professionalLoan: 'Processing Fee-Professional Loan'
};

// Function to generate default eligibility data structure
export function createDefaultEligibilityData() {
  const eligibilityData = {};
  
  // Set all eligibility fields to "No" by default
  eligibilityFields.forEach(field => {
    eligibilityData[field] = 'No';
  });
  
  // Set all ROI fields to 0 by default
  roiFields.forEach(field => {
    eligibilityData[field] = 0;
  });
  
  return eligibilityData;
}
