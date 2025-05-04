// Tax Form Types
export interface TaxForm {
  id: string;
  applicationId: string;
  createdAt: string;
  updatedAt: string;
  userId?: string;
  currentStep: number;
  status: string;
  personalInfo?: any;
  firstName?: string;
  lastName?: string;
  submissionYear?: string;
  submittedAt?: string;
  taxYear?: any;
  language?: string;
  [key: string]: any; // Allow any other fields to prevent type errors
}

// Response type for API calls
export interface TaxFormResponse {
  id: string;
  applicationId: string;
  createdAt: string;
  updatedAt: string;
  userId?: string;
  currentStep: number;
  status: string;
  personalInfo?: any;
  incomeInfo?: any;
  rentalIncome?: any;
  foreignIncome?: any;
  workRelatedExpenses?: any;
  specialExpenses?: any;
  extraordinaryBurdens?: any;
  craftsmenServices?: any;
  businessExpenses?: any;
  expenses?: any;
  signature?: any;
  language: string;
  submittedAt?: string;
  businessInfo?: any;
  taxYear?: any;
  firstName?: string;
  lastName?: string;
  submissionYear?: string;
} 