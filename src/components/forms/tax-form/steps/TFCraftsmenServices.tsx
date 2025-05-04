import React from 'react';
import FKInputField from '../../../ui/FKInputField';
import FKYesNo from '../../../ui/FKYesNo';
import FKFileField from '../../../ui/FKFileField';
import { ValidationErrors } from '../validation';
import { LanguageCode } from '../constants';

interface TFCraftsmenServicesProps {
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

const TFCraftsmenServices: React.FC<TFCraftsmenServicesProps> = ({
  formData,
  handleChange,
  i18nData,
  germanI18nData,
  validationErrors,
  showValidationErrors
}) => {
  
  // Helper to call handleChange with section prefix
  const handleFieldChange = (field: string, value: any) => {
    console.log(`TFCraftsmenServices - Updating field: ${field} with value:`, value);
    
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
  const t = i18nData?.taxForm?.expenses?.craftsmenServices || {};
  const germanT = germanI18nData?.taxForm?.expenses?.craftsmenServices || {};

  // Ensure section exists in formData
  const expensesData = formData.expenses || {};

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
      {/* Craftsmen Services Section */}
      <FormSection title={<>{germanT?.title || 'Craftsmen Services (DE)'} / {t.title || 'Craftsmen Services'}</>}>
        <div className="border border-gray-100 rounded p-4 space-y-4">
          <h4 className="font-medium text-sm">{germanT?.title || 'Craftsmen Services (DE)'} / {t.title || 'Craftsmen Services'}</h4>
          
          <FKYesNo
            id="craftsmenServices.hasMaintenancePayments"
            mainLanguage={germanT?.hasMaintenancePayments || 'Do you have maintenance payments? (DE)'}
            selectedLanguage={t.hasMaintenancePayments || 'Do you have maintenance payments?'}
            value={expensesData.craftsmenServices?.hasMaintenancePayments}
            onChange={(value) => handleFieldChange('craftsmenServices.hasMaintenancePayments', value)}
            mandatory={true}
            hasError={fieldHasError('craftsmenServices.hasMaintenancePayments')}
            validationError={getValidationMessage('craftsmenServices.hasMaintenancePayments')}
          />

          {expensesData.craftsmenServices?.hasMaintenancePayments === true && (
            <>
              <FKInputField
                id="craftsmenServices.maintenanceRecipient"
                mainLanguage={germanT?.maintenanceRecipient || 'Maintenance Recipient (DE)'}
                selectedLanguage={t.maintenanceRecipient || 'Maintenance Recipient'}
                value={expensesData.craftsmenServices?.maintenanceRecipient || ''}
                onChange={(e) => handleFieldChange('craftsmenServices.maintenanceRecipient', e.target.value)}
                mandatory={true}
                hasError={fieldHasError('craftsmenServices.maintenanceRecipient')}
                validationError={getValidationMessage('craftsmenServices.maintenanceRecipient')}
              />

              <FKInputField
                id="craftsmenServices.maintenanceAmount"
                type="number"
                mainLanguage={germanT?.maintenanceAmount || 'Maintenance Amount (DE)'}
                selectedLanguage={t.maintenanceAmount || 'Maintenance Amount'}
                value={expensesData.craftsmenServices?.maintenanceAmount || ''}
                onChange={(e) => handleFieldChange('craftsmenServices.maintenanceAmount', e.target.value)}
                mandatory={true}
                hasError={fieldHasError('craftsmenServices.maintenanceAmount')}
                validationError={getValidationMessage('craftsmenServices.maintenanceAmount')}
                min={0}
              />

              <FKFileField
                id="craftsmenServices.invoiceCraftsmenServices"
                mainLanguage={germanT?.invoiceCraftsmenServices || 'Upload Craftsmen Services Invoice (DE)'}
                selectedLanguage={t.invoiceCraftsmenServices || 'Upload Craftsmen Services Invoice'}
                value={expensesData.craftsmenServices?.invoiceCraftsmenServices || null}
                onChange={(files) => handleFieldChange('craftsmenServices.invoiceCraftsmenServices', files)}
                multiple={true}
                accept=".pdf,.jpg,.jpeg,.png"
                maxSize={5}
                hasError={fieldHasError('craftsmenServices.invoiceCraftsmenServices')}
                validationError={getValidationMessage('craftsmenServices.invoiceCraftsmenServices')}
              />
            </>
          )}
        </div>
      </FormSection>
    </div>
  );
};

export default TFCraftsmenServices; 