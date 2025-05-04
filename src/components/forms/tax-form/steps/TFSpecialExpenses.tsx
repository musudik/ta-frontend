import React from 'react';
import FKExpenseArray from '../../../ui/FKExpenseArray';
import FKYesNo from '../../../ui/FKYesNo';
import { LanguageCode } from '../constants';
import { ValidationErrors } from '../validation';

interface TFSpecialExpensesProps {
  formData: { [key: string]: any };
  handleChange: (section: string, field: string, value: any) => void;
  selectedLanguage: LanguageCode;
  i18nData: any;
  germanI18nData: any;    
  validationErrors: ValidationErrors | null;
  showValidationErrors: boolean;
}

// Helper component for section styling
const FormSection = ({ title, children }: { title: React.ReactNode, children: React.ReactNode }) => (
  <div className="border border-gray-200 rounded-md p-4 space-y-4">
    <h3 className="text-md font-semibold text-neutral-800">{title}</h3>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const TFSpecialExpenses: React.FC<TFSpecialExpensesProps> = ({
  formData,
  handleChange,
  i18nData,
  germanI18nData,
  validationErrors,
  showValidationErrors
}) => {
  
  // Helper to call handleChange with section prefix
  const handleFieldChange = (field: string, value: any) => {
    console.log(`TFSpecialExpenses - Updating field: ${field} with value:`, value);
    
    // For direct fields
    if (!field.includes('.')) {
      handleChange('expenses', field, value);
      return;
    }

    // For nested fields, we'll use the main handleChange function directly
    // which properly handles nested paths
    handleChange('expenses', field, value);
  };

  // Get translations
  const t = i18nData?.taxForm?.expenses?.specialExpenses || {};
  const germanT = germanI18nData?.taxForm?.expenses?.specialExpenses || {};

  // Ensure section exists in formData
  const expensesData = formData.expenses || {};

  // Helper to handle expense array updates - simplified to use main handleChange
  const handleExpenseArrayChange = (field: string, expenses: any[]) => {
    handleChange('expenses', field, expenses);
  };

  // --- Helper to get error message key for a field ---
  const getErrorKey = (field: string): string | undefined => {
    if (!showValidationErrors || !validationErrors?.expenses) {
      return undefined;
    }

    try {
      if (field.includes('.')) {
        const keys = field.split('.');
        let currentErrorLevel: any = validationErrors.expenses;
        for (const key of keys) {
          if (!currentErrorLevel || typeof currentErrorLevel !== 'object' || !(key in currentErrorLevel)) {
            return undefined;
          }
          currentErrorLevel = currentErrorLevel[key];
        }
        return typeof currentErrorLevel === 'string' ? currentErrorLevel : undefined;
      }

      const errorKey = validationErrors.expenses[field];
      return typeof errorKey === 'string' ? errorKey : undefined;
    } catch (e) {
      console.error("Error in getErrorKey for field:", field, e);
      return undefined;
    }
  };

  // --- Helper to check if a field has an error ---
  const fieldHasError = (field: string): boolean => {
    return !!getErrorKey(field);
  };

  // --- Helper to get bilingual validation message ---
  const getValidationMessage = (field: string): string | undefined => {
    const errorKey = getErrorKey(field);
    if (!errorKey) return undefined;

    const germanMsg = germanI18nData?.validation?.[errorKey];
    const selectedMsg = i18nData?.validation?.[errorKey];

    if (germanMsg && selectedMsg && germanMsg !== selectedMsg) {
      return `${germanMsg} / ${selectedMsg}`;
    } else {
      return germanMsg || selectedMsg || errorKey;
    }
  };

  return (
    <div className="space-y-6">
      {/* Special Expenses Section */}
      <FormSection title={<>{germanT?.title} / {t.title}</>}>
        {/* Insurance Expenses */}
        <div className="border border-gray-100 rounded p-4 space-y-4">
          <h4 className="font-medium text-sm">{germanT?.insurance?.title} / {t.insurance?.title}</h4> 
          
          <FKYesNo
            id="specialExpenses.insurance.hasInsurance"
            mainLanguage={germanT?.insurance?.hasInsurance}
            selectedLanguage={t.insurance?.hasInsurance}
            value={expensesData.specialExpenses?.insurance?.hasInsurance}
            onChange={(value) => handleFieldChange('specialExpenses.insurance.hasInsurance', value)}
            mandatory={true}
            hasError={fieldHasError('specialExpenses.insurance.hasInsurance')}
            validationError={getValidationMessage('specialExpenses.insurance.hasInsurance')}
          />

          {expensesData.specialExpenses?.insurance?.hasInsurance === true && (
            <FKExpenseArray 
              label={`${germanT?.insurance?.expenses} / ${t.insurance?.expenses}`}
              expenseTypes={{
                "health": "Health Insurance",
                "life": "Life Insurance",
                "liability": "Liability Insurance",
                "accident": "Accident Insurance",
                "disability": "Disability Insurance",
                "other": "Other Insurance"
              }}
              onChange={(expenses) => handleExpenseArrayChange('specialExpenses.insurance.expenses', expenses)}
              value={expensesData.specialExpenses?.insurance?.expenses || []}
              withFile={true}
              germanT={germanI18nData}
              t={i18nData}
            />
          )}
        </div>

        {/* Donations */}
        <div className="border border-gray-100 rounded p-4 space-y-4">
          <h4 className="font-medium text-sm">{germanT?.donations?.title || 'Donations (DE)'} / {t.donations?.title || 'Donations'}</h4>
          
          <FKYesNo
            id="specialExpenses.donations.hasDonations"
            mainLanguage={germanT?.donations?.hasDonations || 'Do you have donations? (DE)'}
            selectedLanguage={t.donations?.hasDonations || 'Do you have donations?'}
            value={expensesData.specialExpenses?.donations?.hasDonations}
            onChange={(value) => handleFieldChange('specialExpenses.donations.hasDonations', value)}
            mandatory={true}
            hasError={fieldHasError('specialExpenses.donations.hasDonations')}
            validationError={getValidationMessage('specialExpenses.donations.hasDonations')}
          />

          {expensesData.specialExpenses?.donations?.hasDonations === true && (
            <FKExpenseArray
              label={`${germanT?.donations?.expenses || 'Donations (DE)'} / ${t.donations?.expenses || 'Donations'}`}
              expenseTypes={{
                "charity": "Charitable Organizations",
                "church": "Church Tax",
                "political": "Political Parties",
                "other": "Other Donations"
              }}
              onChange={(expenses) => handleExpenseArrayChange('specialExpenses.donations.expenses', expenses)}
              value={expensesData.specialExpenses?.donations?.expenses || []}
              withFile={true}
              germanT={germanI18nData}
              t={i18nData}
            />
          )}
        </div>

        {/* Professional Development */}
        <div className="border border-gray-100 rounded p-4 space-y-4">
          <h4 className="font-medium text-sm">{germanT?.professionalDevelopment?.title} / {t.professionalDevelopment?.title}</h4>
          
          <FKYesNo
            id="specialExpenses.professionalDevelopment.hasProfessionalDevelopment"
            mainLanguage={germanT?.professionalDevelopment?.hasProfessionalDevelopment}
            selectedLanguage={t.professionalDevelopment?.hasProfessionalDevelopment}
            value={expensesData.specialExpenses?.professionalDevelopment?.hasProfessionalDevelopment}
            onChange={(value) => handleFieldChange('specialExpenses.professionalDevelopment.hasProfessionalDevelopment', value)}
            mandatory={true}
            hasError={fieldHasError('specialExpenses.professionalDevelopment.hasProfessionalDevelopment')}
            validationError={getValidationMessage('specialExpenses.professionalDevelopment.hasProfessionalDevelopment')}
          />

          {expensesData.specialExpenses?.professionalDevelopment?.hasProfessionalDevelopment === true && (
            <FKExpenseArray
              label={`${germanT?.professionalDevelopment?.expenses} / ${t.professionalDevelopment?.expenses}`}
              expenseTypes={{
                "tuition": "Tuition Fees",
                "books": "Books and Materials",
                "travel": "Travel Costs",
                "other": "Other Expenses"
              }}
              onChange={(expenses) => handleExpenseArrayChange('specialExpenses.professionalDevelopment.expenses', expenses)}
              value={expensesData.specialExpenses?.professionalDevelopment?.expenses || []}
              withFile={true}
              germanT={germanI18nData}
              t={i18nData}
            />
          )}
        </div>
      </FormSection>
    </div>
  );
};

export default TFSpecialExpenses; 