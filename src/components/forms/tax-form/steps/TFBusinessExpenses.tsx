import React from 'react';
import FKYesNo from '../../../ui/FKYesNo';
import FKInputField from '../../../ui/FKInputField';
import FKSelectField from '../../../ui/FKSelectField';
import { LanguageCode } from '../constants';
import { ValidationErrors } from '../validation';

interface TFBusinessExpensesProps {
  formData: { [key: string]: any };
  handleChange: (section: string, field: string, value: any) => void;
  selectedLanguage: LanguageCode;
  i18nData: any;
  germanI18nData: any;
  validationErrors: ValidationErrors | null;
  showValidationErrors: boolean;
}

interface BusinessAddress {
  street?: string;
  houseNumber?: string;
  postalCode?: string;
  city?: string;
}

interface BusinessInfo {
  isBusinessOwner?: boolean;
  businessType?: string;
  businessEarnings?: number | string;
  businessExpenses?: number | string;
  businessAddress?: BusinessAddress;
}

const TFBusinessExpenses: React.FC<TFBusinessExpensesProps> = ({
  formData,
  handleChange,
  i18nData,
  germanI18nData,
  validationErrors,
  showValidationErrors
}) => {
  const businessInfo: BusinessInfo = formData.businessInfo || {};

  const businessTypeOptions = [
    { value: 'freelance', mainLabel: 'Freiberuflich', selectedLabel: 'Freelance' },
    { value: 'trade', mainLabel: 'Gewerblich', selectedLabel: 'Trade' },
    { value: 'agriculture', mainLabel: 'Landwirtschaftlich', selectedLabel: 'Agriculture' },
    { value: 'other', mainLabel: 'Sonstige', selectedLabel: 'Other' }
  ];

  // --- Helper to get error message key for a field ---
  const getErrorKey = (field: string): string | undefined => {
    if (!showValidationErrors || !validationErrors?.businessInfo) {
      return undefined;
    }

    try {
      if (field.includes('.')) {
        const keys = field.split('.');
        let currentErrorLevel: any = validationErrors.businessInfo;
        for (const key of keys) {
          if (!currentErrorLevel || typeof currentErrorLevel !== 'object' || !(key in currentErrorLevel)) {
            return undefined;
          }
          currentErrorLevel = currentErrorLevel[key];
        }
        return typeof currentErrorLevel === 'string' ? currentErrorLevel : undefined;
      }

      const errorKey = validationErrors.businessInfo[field];
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

  const handleFieldChange = (field: string, value: any) => {
    handleChange('businessInfo', field, value);
  };

  // Get translations
  const t = i18nData?.taxForm?.expenses?.businessExpenses || {};
  const germanT = germanI18nData?.taxForm?.expenses?.businessExpenses || {};    

  return (
    <div className="space-y-6">
      <FKYesNo
        id="isBusinessOwner"
        mainLanguage={germanT?.isBusinessOwner || 'Sind Sie Geschäftsinhaber?'}
        selectedLanguage={t.isBusinessOwner || 'Are you a business owner?'}
        value={businessInfo.isBusinessOwner}
        onChange={(value) => handleFieldChange('isBusinessOwner', value)}
        hasError={fieldHasError('isBusinessOwner')}
        validationError={getValidationMessage('isBusinessOwner')}
      />

      {businessInfo.isBusinessOwner && (
        <>
          <div className="grid grid-cols-2 gap-6">
            <FKSelectField
              id="businessType"
              mainLanguage={germanT?.businessType || 'Art des Geschäfts'}
              selectedLanguage={t.businessType || 'Type of Business'}
              value={businessInfo.businessType || ''}
              onChange={value => handleFieldChange('businessType', typeof value === 'object' ? value.target.value : value)}
              options={businessTypeOptions}
              mandatory={true}
              hasError={fieldHasError('businessType')}
              validationError={getValidationMessage('businessType')}
            />

            <FKInputField
              id="businessEarnings"
              type="number"
              mainLanguage={germanT?.businessEarnings || 'Geschäftliche Einnahmen'}
              selectedLanguage={t.businessEarnings || 'Business Earnings'}
              value={businessInfo.businessEarnings || ''}
              onChange={(e) => handleFieldChange('businessEarnings', e.target.value)}
              mandatory={true}
              hasError={fieldHasError('businessEarnings')}
              validationError={getValidationMessage('businessEarnings')}
            />

            <FKInputField
              id="businessExpenses"
              type="number"
              mainLanguage={germanT?.businessExpenses || 'Geschäftliche Ausgaben'}
              selectedLanguage={t.businessExpenses || 'Business Expenses'}
              value={businessInfo.businessExpenses || ''}
              onChange={(e) => handleFieldChange('businessExpenses', e.target.value)}
              mandatory={true}
              hasError={fieldHasError('businessExpenses')}
              validationError={getValidationMessage('businessExpenses')}
            />
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">
              <span className="font-bold">{germanT?.businessAddress || 'Geschäftsadresse'}</span>
              {' / '}
              <span className="text-neutral-600">{t.businessAddress || 'Business Address'}</span>
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <FKInputField
                id="businessAddress.street"
                mainLanguage={germanT?.street || 'Straße'}
                selectedLanguage={t.street || 'Street'}
                value={businessInfo.businessAddress?.street || ''}
                onChange={(e) => handleFieldChange('businessAddress.street', e.target.value)}
                mandatory={true}
                hasError={fieldHasError('businessAddress.street')}
                validationError={getValidationMessage('businessAddress.street')}
              />

              <FKInputField
                id="businessAddress.houseNumber"
                mainLanguage={germanT?.houseNumber || 'Hausnummer'}
                selectedLanguage={t.houseNumber || 'House Number'}
                value={businessInfo.businessAddress?.houseNumber || ''}
                onChange={(e) => handleFieldChange('businessAddress.houseNumber', e.target.value)}
                mandatory={true}
                hasError={fieldHasError('businessAddress.houseNumber')}
                validationError={getValidationMessage('businessAddress.houseNumber')}
              />

              <FKInputField
                id="businessAddress.postalCode"
                mainLanguage={germanT?.postalCode || 'Postleitzahl'}
                selectedLanguage={t.postalCode || 'Postal Code'}
                value={businessInfo.businessAddress?.postalCode || ''}
                onChange={(e) => handleFieldChange('businessAddress.postalCode', e.target.value)}
                mandatory={true}
                hasError={fieldHasError('businessAddress.postalCode')}
                validationError={getValidationMessage('businessAddress.postalCode')}
              />

              <FKInputField
                id="businessAddress.city"
                mainLanguage={germanT?.city || 'Stadt'}
                selectedLanguage={t.city || 'City'}
                value={businessInfo.businessAddress?.city || ''}
                onChange={(e) => handleFieldChange('businessAddress.city', e.target.value)}
                mandatory={true}
                hasError={fieldHasError('businessAddress.city')}
                validationError={getValidationMessage('businessAddress.city')}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TFBusinessExpenses; 