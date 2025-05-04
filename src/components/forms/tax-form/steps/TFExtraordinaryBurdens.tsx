import React from 'react';
import FKExpenseArray from '../../../ui/FKExpenseArray';
import FKYesNo from '../../../ui/FKYesNo';
import { LanguageCode } from '../constants';
import { ValidationErrors } from '../validation';

interface TFExtraordinaryBurdensProps {
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

const TFExtraordinaryBurdens: React.FC<TFExtraordinaryBurdensProps> = ({
  formData,
  handleChange,
  i18nData,
  germanI18nData,
  validationErrors,
  showValidationErrors
}) => {
  
  // Helper to call handleChange with section prefix
  const handleFieldChange = (field: string, value: any) => {
    console.log(`TFExtraordinaryBurdens - Updating field: ${field} with value:`, value);
    
    // For direct fields
    if (!field.includes('.')) {
      handleChange('expenses', field, value);
      return;
    }

    // For nested fields, use the main handleChange function directly
    // which properly handles nested paths
    handleChange('expenses', field, value);
  };

  // Get translations
  const t = i18nData?.taxForm?.expenses?.extraordinaryExpenses || {};
  const germanT = germanI18nData?.taxForm?.expenses?.extraordinaryExpenses || {};

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
      {/* Extraordinary Burdens Section */}
      <FormSection title={<>{germanT?.title} / {t.title}</>}>
        {/* Medical Expenses */}
        <div className="border border-gray-100 rounded p-4 space-y-4">
          <h4 className="font-medium text-sm">{germanT?.medicalExpenses?.title} / {t.medicalExpenses?.title}</h4>
          
          <FKYesNo
            id="extraordinaryBurdens.medicalExpenses.hasMedicalExpenses"
            mainLanguage={germanT?.medicalExpenses?.hasMedicalExpenses}
            selectedLanguage={t.medicalExpenses?.hasMedicalExpenses}
            value={expensesData.extraordinaryBurdens?.medicalExpenses?.hasMedicalExpenses}
            onChange={(value) => handleFieldChange('extraordinaryBurdens.medicalExpenses.hasMedicalExpenses', value)}
            mandatory={true}
            hasError={fieldHasError('extraordinaryBurdens.medicalExpenses.hasMedicalExpenses')}
            validationError={getValidationMessage('extraordinaryBurdens.medicalExpenses.hasMedicalExpenses')}
          />

          {expensesData.extraordinaryBurdens?.medicalExpenses?.hasMedicalExpenses === true && (
            <FKExpenseArray
              label={`${germanT?.medicalExpenses?.expenses} / ${t.medicalExpenses?.expenses}`}
              expenseTypes={{
                "doctor": "Doctor Visits",
                "medication": "Medication",
                "therapy": "Therapy",
                "aids": "Medical Aids",
                "other": "Other Medical Expenses"
              }}
              onChange={(expenses) => handleExpenseArrayChange('extraordinaryBurdens.medicalExpenses.expenses', expenses)}
              value={expensesData.extraordinaryBurdens?.medicalExpenses?.expenses || []}
              withFile={true}
              germanT={germanI18nData}
              t={i18nData}
            />
          )}
        </div>

        {/* Care Expenses */}
        <div className="border border-gray-100 rounded p-4 space-y-4">
          <h4 className="font-medium text-sm">{germanT?.careCosts?.title} / {t.careCosts?.title}</h4>
          
          <FKYesNo
            id="extraordinaryBurdens.careCosts.hasCareCosts"
            mainLanguage={germanT?.careCosts?.hasCareCosts}
            selectedLanguage={t.careCosts?.hasCareCosts}
            value={expensesData.extraordinaryBurdens?.careCosts?.hasCareCosts}
            onChange={(value) => handleFieldChange('extraordinaryBurdens.careCosts.hasCareCosts', value)}
            mandatory={true}
            hasError={fieldHasError('extraordinaryBurdens.careCosts.hasCareCosts')}
            validationError={getValidationMessage('extraordinaryBurdens.careCosts.hasCareCosts')}
          />

          {expensesData.extraordinaryBurdens?.careCosts?.hasCareCosts === true && (
            <FKExpenseArray
              label={`${germanT?.careCosts?.expenses} / ${t.careCosts?.expenses}`}
              expenseTypes={{
                "nursing": "Nursing Care",
                "assistance": "Personal Assistance",
                "equipment": "Care Equipment",
                "other": "Other Care Expenses"
              }}
              onChange={(expenses) => handleExpenseArrayChange('extraordinaryBurdens.careCosts.expenses', expenses)}
              value={expensesData.extraordinaryBurdens?.careCosts?.expenses || []}
              withFile={true}
              germanT={germanI18nData}
              t={i18nData}
            />
          )}
        </div>

        {/* Disability Expenses */}
        <div className="border border-gray-100 rounded p-4 space-y-4">
          <h4 className="font-medium text-sm">{germanT?.disabilityExpenses?.title} / {t.disabilityExpenses?.title}</h4>
          
          <FKYesNo
            id="extraordinaryBurdens.disabilityExpenses.hasDisabilityExpenses"
            mainLanguage={germanT?.disabilityExpenses?.hasDisabilityExpenses}
            selectedLanguage={t.disabilityExpenses?.hasDisabilityExpenses}
            value={expensesData.extraordinaryBurdens?.disabilityExpenses?.hasDisabilityExpenses}
            onChange={(value) => handleFieldChange('extraordinaryBurdens.disabilityExpenses.hasDisabilityExpenses', value)}
            mandatory={true}
            hasError={fieldHasError('extraordinaryBurdens.disabilityExpenses.hasDisabilityExpenses')}
            validationError={getValidationMessage('extraordinaryBurdens.disabilityExpenses.hasDisabilityExpenses')}
          />

          {expensesData.extraordinaryBurdens?.disabilityExpenses?.hasDisabilityExpenses === true && (
            <FKExpenseArray
              label={`${germanT?.disabilityExpenses?.expenses} / ${t.disabilityExpenses?.expenses}`}
              expenseTypes={{
                "equipment": "Disability Equipment",
                "modification": "Home Modifications",
                "transport": "Transport Adaptations",
                "other": "Other Disability Expenses"
              }}
              onChange={(expenses) => handleExpenseArrayChange('extraordinaryBurdens.disabilityExpenses.expenses', expenses)}
              value={expensesData.extraordinaryBurdens?.disabilityExpenses?.expenses || []}
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

export default TFExtraordinaryBurdens; 