// Define TaxFormData type directly in this file since the external import is removed
interface TaxFormData {
  id?: string;
  clientId?: string;
  partnerId?: string;
  status?: string;
  type?: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    zipCode?: string;
    country?: string;
    taxIdentifier?: string;
    dateOfBirth?: string;
  };
  children?: Array<{
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    taxIdentifier?: string;
  }>;
  incomeInfo: {
    isEmployed?: boolean;
    isBusinessOwner?: boolean;
    hasStockIncome?: boolean;
    hasRentalProperty?: boolean;
    hasForeignIncome?: boolean;
    employmentDetails?: Array<{
      employer: string;
      income: number;
      taxWithheld: number;
      startDate: string;
      endDate?: string;
    }>;
    businessDetails?: Array<{
      businessName: string;
      businessType: string;
      income: number;
      expenses: number;
    }>;
    investmentDetails?: Array<{
      investmentType: string;
      provider: string;
      income: number;
      taxWithheld: number;
    }>;
    rentalDetails?: Array<{
      propertyAddress: string;
      income: number;
      expenses: number;
    }>;
    foreignIncomeDetails?: Array<{
      country: string;
      incomeType: string;
      amount: number;
      taxPaid: number;
    }>;
  };
  deductions?: {
    healthInsurance?: number;
    retirementContributions?: number;
    donations?: number;
    homeBuying?: number;
    education?: number;
    medicalExpenses?: number;
    childcare?: number;
    other?: Array<{
      type: string;
      amount: number;
      description?: string;
    }>;
  };
  taxCredits?: {
    childTaxCredit?: number;
    educationCredit?: number;
    energyCredit?: number;
    other?: Array<{
      type: string;
      amount: number;
      description?: string;
    }>;
  };
  signature?: {
    name: string;
    dateSigned: string;
    signatureImage?: string;
  };
  submittedAt?: string;
  updatedAt?: string;
}

import axios from 'axios';

// Use '/api' without domain to utilize the proxy
const API_BASE_URL = '/api';

/**
 * IMPORTANT: This service has been deprecated in favor of the TaxFormService.
 * All the methods in this file now redirect to the corresponding endpoints in the tax-form service.
 * Please use the TaxFormService directly instead.
 */

/**
 * Saves a tax return form to the database
 * @param formData The tax return form data
 * @param partnerId The partner ID
 * @returns The ID of the saved form
 */
export const saveTaxReturnForm = async (formData: TaxFormData, partnerId: string): Promise<string> => {
  try {
    console.warn('taxReturnService.saveTaxReturnForm is deprecated. Please use taxFormService.createForm instead.');
    
    // Ensure the data matches the DTO structure exactly
    const payload = {
      clientId: formData.clientId || '',
      partnerId: partnerId,
      status: 'submitted',
      type: formData.type || 'standard',
      personalInfo: formData.personalInfo,
      children: formData.children || [],
      incomeInfo: {
        ...formData.incomeInfo,
        isEmployed: formData.incomeInfo.isEmployed === undefined ? false : formData.incomeInfo.isEmployed,
        isBusinessOwner: formData.incomeInfo.isBusinessOwner === undefined ? false : formData.incomeInfo.isBusinessOwner,
        hasStockIncome: formData.incomeInfo.hasStockIncome === undefined ? false : formData.incomeInfo.hasStockIncome,
        hasRentalProperty: formData.incomeInfo.hasRentalProperty === undefined ? false : formData.incomeInfo.hasRentalProperty,
        hasForeignIncome: formData.incomeInfo.hasForeignIncome === undefined ? false : formData.incomeInfo.hasForeignIncome
      },
      deductions: formData.deductions,
      taxCredits: formData.taxCredits,
      signature: formData.signature || null,
      submittedAt: new Date().toISOString()
    };

    console.log('Submitting tax form with payload:', JSON.stringify(payload));

    // Make API call to save the tax form using the new endpoint
    const response = await axios.post(`${API_BASE_URL}/tax-forms`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Return the ID of the saved form
    return response.data.id;
  } catch (error) {
    console.error('Error saving tax form:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response:', error.response.data);
        throw new Error(`Failed to save tax form: ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response received from server. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error(`Request setup error: ${error.message}`);
      }
    }
    
    throw new Error('Failed to save tax form');
  }
};

/**
 * Gets a tax return form by ID
 * @param formId The ID of the form to get
 * @returns The tax return form data
 */
export const getTaxReturnForm = async (formId: string): Promise<TaxFormData> => {
  try {
    console.warn('taxReturnService.getTaxReturnForm is deprecated. Please use taxFormService.getFormById instead.');
    const response = await axios.get(`${API_BASE_URL}/tax-forms/${formId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting tax form:', error);
    throw new Error('Failed to get tax form');
  }
};

/**
 * Gets all tax return forms for a client
 * @param clientId The client ID
 * @returns Array of tax return forms
 */
export const getClientTaxReturnForms = async (clientId: string): Promise<TaxFormData[]> => {
  try {
    console.warn('taxReturnService.getClientTaxReturnForms is deprecated. Please use taxFormService.getFormsByUserId instead.');
    const response = await axios.get(`${API_BASE_URL}/tax-forms/user/${clientId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting client tax forms:', error);
    throw new Error('Failed to get client tax forms');
  }
};

/**
 * Gets all tax return forms for a partner
 * @param partnerId The partner ID
 * @returns Array of tax return forms
 */
export const getPartnerTaxReturnForms = async (partnerId: string): Promise<TaxFormData[]> => {
  try {
    console.warn('taxReturnService.getPartnerTaxReturnForms is deprecated. Please use taxFormService.getFormsByPartnerId instead.');
    const response = await axios.get(`${API_BASE_URL}/tax-forms/partner/${partnerId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting partner tax forms:', error);
    throw new Error('Failed to get partner tax forms');
  }
};

/**
 * Updates a tax return form
 * @param formId The ID of the form to update
 * @param formData The updated form data
 * @returns The updated tax return form
 */
export const updateTaxReturnForm = async (formId: string, formData: Partial<TaxFormData>): Promise<TaxFormData> => {
  try {
    console.warn('taxReturnService.updateTaxReturnForm is deprecated. Please use taxFormService.updateForm instead.');
    const payload = {
      ...formData,
      updatedAt: new Date().toISOString()
    };
    
    const response = await axios.put(`${API_BASE_URL}/tax-forms/${formId}`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error updating tax form:', error);
    throw new Error('Failed to update tax form');
  }
};

/**
 * Deletes a tax return form
 * @param formId The ID of the form to delete
 * @returns A success message
 */
export const deleteTaxReturnForm = async (formId: string): Promise<{ message: string }> => {
  try {
    console.warn('taxReturnService.deleteTaxReturnForm is deprecated. Please use taxFormService.deleteForm instead.');
    const response = await axios.delete(`${API_BASE_URL}/tax-forms/${formId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting tax form:', error);
    throw new Error('Failed to delete tax form');
  }
}; 