import React from 'react';
import FKYesNo from '../../../ui/FKYesNo';
import FKInputField from '../../../ui/FKInputField';
import { ValidationErrors } from '../validation';
import { LanguageCode } from '../constants/languageTypes';

interface TFRentalIncomeProps {
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

const TFRentalIncome: React.FC<TFRentalIncomeProps> = ({
  formData,
  handleChange,
  i18nData,
  germanI18nData,
  validationErrors,
  showValidationErrors
}) => {
  // Helper to call handleChange with section prefix
  const handleFieldChange = (field: string, value: any) => {
    handleChange('incomeInfo', field, value);
  };

  // Get translations
  const t = i18nData?.taxForm?.incomeInfo.rentalIncome || {};
  const germanT = germanI18nData?.taxForm?.incomeInfo.rentalIncome;

  // Ensure section exists in formData
  const incomeData = formData.incomeInfo || {};

  // Helper to get error message key for a field
  const getErrorKey = (field: string): string | undefined => {
    if (!showValidationErrors || !validationErrors?.incomeInfo) {
      return undefined;
    }

    try {
      if (field.includes('.')) {
        const keys = field.split('.');
        let currentErrorLevel: any = validationErrors.incomeInfo;
        for (const key of keys) {
          if (!currentErrorLevel || typeof currentErrorLevel !== 'object' || !(key in currentErrorLevel)) {
            return undefined;
          }
          currentErrorLevel = currentErrorLevel[key];
        }
        return typeof currentErrorLevel === 'string' ? currentErrorLevel : undefined;
      }

      const error = validationErrors.incomeInfo[field];
      return typeof error === 'string' ? error : undefined;
    } catch (e) {
      console.error("Error in getErrorKey for field:", field, e);
      return undefined;
    }
  };

  const fieldHasError = (field: string): boolean => {
    return !!getErrorKey(field);
  };

  const getValidationMessage = (field: string): string | undefined => {
    const errorKey = getErrorKey(field);
    if (!errorKey) return undefined;

    const germanMsg = germanI18nData?.validation?.[errorKey];
    const selectedMsg = i18nData?.validation?.[errorKey];

    if (germanMsg && selectedMsg && germanMsg !== selectedMsg) {
      return `${germanMsg} / ${selectedMsg}`;
    }
    return germanMsg || selectedMsg || errorKey;
  };

  // Helper for address fields
  const handleAddressChange = (field: string, value: string) => {
    handleFieldChange('rentalPropertyAddress', {
      ...incomeData.rentalPropertyAddress,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      {/* Rental Income Section */}
      <FormSection title={<>{germanT?.rentalTitle || 'Mieteinnahmen'} / {t.rentalTitle || 'Rental Income'}</>}>
        <FKYesNo
          id="hasRentalProperty"
          mainLanguage={germanT?.hasRentalProperty || 'Haben Sie Mieteinnahmen?'}
          selectedLanguage={t.hasRentalProperty || 'Do you have rental income?'}
          value={incomeData.hasRentalProperty}
          onChange={(value) => handleFieldChange('hasRentalProperty', value)}
          mandatory={true}
          hasError={fieldHasError('hasRentalProperty')}
          validationError={getValidationMessage('hasRentalProperty')}
        />

        {incomeData.hasRentalProperty === true && (
          <div className="space-y-4 ml-4">
            <FKInputField
              id="rentalIncome"
              type="number"
              mainLanguage={germanT?.rentalIncome || 'Mieteinnahmen'}
              selectedLanguage={t.rentalIncome || 'Rental Income'}
              value={incomeData.rentalIncome || ''}
              onChange={(e) => handleFieldChange('rentalIncome', e.target.value)}
              mandatory={true}
              hasError={fieldHasError('rentalIncome')}
              validationError={getValidationMessage('rentalIncome')}
              min={0}
            />

            <FKInputField
              id="rentalCosts"
              type="number"
              mainLanguage={germanT?.rentalCosts || 'Mietnebenkosten'}
              selectedLanguage={t.rentalCosts || 'Rental Costs'}
              value={incomeData.rentalCosts || ''}
              onChange={(e) => handleFieldChange('rentalCosts', e.target.value)}
              mandatory={true}
              hasError={fieldHasError('rentalCosts')}
              validationError={getValidationMessage('rentalCosts')}
              min={0}
            />

            {/* Property Address */}
            <div className="border border-gray-100 rounded p-4 space-y-4">
              <h4 className="font-medium text-sm">
                {germanT?.rentalPropertyAddress || 'Adresse der Mietimmobilie'} / {t.rentalPropertyAddress || 'Rental Property Address'}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FKInputField
                  id="street"
                  mainLanguage={germanT?.street || 'Straße'}
                  selectedLanguage={t.street || 'Street'}
                  value={incomeData.rentalPropertyAddress?.street || ''}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                  mandatory={true}
                  hasError={fieldHasError('rentalPropertyAddress.street')}
                  validationError={getValidationMessage('rentalPropertyAddress.street')}
                />

                <FKInputField
                  id="houseNumber"
                  mainLanguage={germanT?.houseNumber || 'Hausnummer'}
                  selectedLanguage={t.houseNumber || 'House Number'}
                  value={incomeData.rentalPropertyAddress?.houseNumber || ''}
                  onChange={(e) => handleAddressChange('houseNumber', e.target.value)}
                  mandatory={true}
                  hasError={fieldHasError('rentalPropertyAddress.houseNumber')}
                  validationError={getValidationMessage('rentalPropertyAddress.houseNumber')}
                />

                <FKInputField
                  id="postalCode"
                  mainLanguage={germanT?.postalCode || 'Postleitzahl'}
                  selectedLanguage={t.postalCode || 'Postal Code'}
                  value={incomeData.rentalPropertyAddress?.postalCode || ''}
                  onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                  mandatory={true}
                  hasError={fieldHasError('rentalPropertyAddress.postalCode')}
                  validationError={getValidationMessage('rentalPropertyAddress.postalCode')}
                />

                <FKInputField
                  id="city"
                  mainLanguage={germanT?.city || 'Stadt'}
                  selectedLanguage={t.city || 'City'}
                  value={incomeData.rentalPropertyAddress?.city || ''}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  mandatory={true}
                  hasError={fieldHasError('rentalPropertyAddress.city')}
                  validationError={getValidationMessage('rentalPropertyAddress.city')}
                />
              </div>
            </div>
          </div>
        )}
      </FormSection>
    </div>
  );
};

export default TFRentalIncome; 