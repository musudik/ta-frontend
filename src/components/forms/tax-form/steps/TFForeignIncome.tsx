import React from 'react';
import FKYesNo from '../../../ui/FKYesNo';
import FKInputField from '../../../ui/FKInputField';
import FKFileField from '../../../ui/FKFileField';
import FKSelectField from '../../../ui/FKSelectField';
import { ValidationErrors } from '../validation';
import { LanguageCode } from '../constants/languageTypes';

interface TFForeignIncomeProps {
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

const TFForeignIncome: React.FC<TFForeignIncomeProps> = ({
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
  const t = i18nData?.taxForm?.incomeInfo.foreignIncome || {};  
  const germanT = germanI18nData?.taxForm?.incomeInfo.foreignIncome;

  // Get country options
  const countryOptions = Object.entries(i18nData?.countries || {}).map(([key, value]) => ({
    value: key,
    mainLabel: germanI18nData?.countries?.[key] as string || value as string,
    selectedLabel: value as string
  }));

  // Add "Other" option to country list
  countryOptions.push({
    value: 'other',
    mainLabel: germanI18nData?.countries?.other || 'Andere',
    selectedLabel: i18nData?.countries?.other || 'Other'
  });

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

  // Handle country selection change
  const handleCountryChange = (value: string) => {
    handleFieldChange('foreignIncomeCountry', value);
    // Clear other country field if not "other"
    if (value !== 'other') {
      handleFieldChange('foreignIncomeOtherCountry', '');
    }
  };

  return (
    <div className="space-y-6">
      {/* Foreign Income Section */}
      <FormSection title={<>{germanT?.foreignTitle || 'Ausländische Einkünfte'} / {t.foreignTitle || 'Foreign Income'}</>}>
        <FKYesNo
          id="hasForeignIncome"
          mainLanguage={germanT?.hasForeignIncome || 'Haben Sie ausländische Einkünfte?'}
          selectedLanguage={t.hasForeignIncome || 'Do you have foreign income?'}
          value={incomeData.hasForeignIncome}
          onChange={(value) => handleFieldChange('hasForeignIncome', value)}
          mandatory={true}
          hasError={fieldHasError('hasForeignIncome')}
          validationError={getValidationMessage('hasForeignIncome')}
        />

        {incomeData.hasForeignIncome === true && (
          <div className="space-y-4 ml-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <FKSelectField
                  id="foreignIncomeCountry"
                  mainLanguage={germanT?.countryQuestion || 'Land der Einkünfte'}
                  selectedLanguage={t.countryQuestion || 'Country of Income'}
                  value={incomeData.foreignIncomeCountry || ''}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  options={countryOptions}
                  mandatory={true}
                  hasError={fieldHasError('foreignIncomeCountry')}
                  validationError={getValidationMessage('foreignIncomeCountry')}
                />

                {incomeData.foreignIncomeCountry === 'other' && (
                  <FKInputField
                    id="foreignIncomeOtherCountry"
                    mainLanguage={germanT?.otherCountryQuestion || 'Anderes Land angeben'}
                    selectedLanguage={t.otherCountryQuestion || 'Specify Other Country'}
                    value={incomeData.foreignIncomeOtherCountry || ''}
                    onChange={(e) => handleFieldChange('foreignIncomeOtherCountry', e.target.value)}
                    mandatory={true}
                    hasError={fieldHasError('foreignIncomeOtherCountry')}
                    validationError={getValidationMessage('foreignIncomeOtherCountry')}
                  />
                )}
              </div>

              <FKInputField
                id="foreignIncomeType"
                mainLanguage={germanT?.typeOfIncome || 'Art der Einkünfte'}
                selectedLanguage={t.typeOfIncome || 'Type of Income'}
                value={incomeData.foreignIncomeType || ''}
                onChange={(e) => handleFieldChange('foreignIncomeType', e.target.value)}
                mandatory={true}
                hasError={fieldHasError('foreignIncomeType')}
                validationError={getValidationMessage('foreignIncomeType')}
              />

              <FKInputField
                id="foreignIncomeAmount"
                type="number"
                mainLanguage={germanT?.totalAmountQuestion || 'Gesamtbetrag der ausländischen Einkünfte'}
                selectedLanguage={t.totalAmountQuestion || 'Total Amount of Foreign Income'}
                value={incomeData.foreignIncomeAmount || ''}
                onChange={(e) => handleFieldChange('foreignIncomeAmount', e.target.value)}
                mandatory={true}
                hasError={fieldHasError('foreignIncomeAmount')}
                validationError={getValidationMessage('foreignIncomeAmount')}
                min={0}
              />

              <FKInputField
                id="foreignIncomeTaxPaid"
                type="number"
                mainLanguage={germanT?.foreignTaxPaid || 'Gezahlte ausländische Steuer'}
                selectedLanguage={t.foreignTaxPaid || 'Foreign Tax Paid'}
                value={incomeData.foreignIncomeTaxPaid || ''}
                onChange={(e) => handleFieldChange('foreignIncomeTaxPaid', e.target.value)}
                mandatory={true}
                hasError={fieldHasError('foreignIncomeTaxPaid')}
                validationError={getValidationMessage('foreignIncomeTaxPaid')}
                min={0}
              />
            </div>

            <FKFileField
              id="foreignIncomeTaxCertificateFile"
              mainLanguage={germanT?.certificateUpload || 'Steuerbescheinigung hochladen'}
              selectedLanguage={t.certificateUpload || 'Upload Tax Certificate'}
              value={incomeData.foreignIncomeTaxCertificateFile || []}
              onChange={(files) => handleFieldChange('foreignIncomeTaxCertificateFile', files)}
              mandatory={true}
              hasError={fieldHasError('foreignIncomeTaxCertificateFile')}
              validationError={getValidationMessage('foreignIncomeTaxCertificateFile')}
              multiple={true}
            />
          </div>
        )}
      </FormSection>
    </div>
  );
};

export default TFForeignIncome; 