import React from 'react';
import FKInputField from '../../../ui/FKInputField';
import { ValidationErrors } from '../validation';
import { LanguageCode } from '../constants';

// Define props
interface TFAddressProps {
  formData: { [key: string]: any };
  handleChange: (section: string, field: string, value: any) => void;
  selectedLanguage: LanguageCode;
  i18nData: any; 
  germanI18nData: any;
  validationErrors: ValidationErrors | null;
  showValidationErrors: boolean;
}

const TFAddress: React.FC<TFAddressProps> = ({ formData, handleChange, i18nData, germanI18nData, validationErrors, showValidationErrors }) => {
  
  // Helper to call handleChange with section prefix for address fields
  const handleAddressChange = (field: string, value: any) => {
    handleChange('personalInfo', `address.${field}`, value);
  };

  // Get translations
  const t = i18nData?.taxForm?.address || {};
  const germanT = germanI18nData?.taxForm?.address || t;

  // Ensure address object exists
  const addressData = formData.personalInfo?.address || {}; 

  // Helper to get error message key for address fields
  const getErrorKey = (field: string): string | undefined => {
    if (!showValidationErrors || !validationErrors?.personalInfo?.address) {
      return undefined;
    }
    // Fix: Ensure addressErrors is an object before indexing
    const addressErrors = validationErrors.personalInfo.address;
    if (typeof addressErrors !== 'object' || addressErrors === null) {
      return undefined; 
    }

    const errorKey = addressErrors[field];
    return typeof errorKey === 'string' ? errorKey : undefined;
  };

  // Helper to check if a field has an error
  const fieldHasError = (field: string): boolean => {
    return !!getErrorKey(field);
  };

  // Helper to get bilingual validation message
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

  return (
    <div className="space-y-4">
      {/* --- Street --- */}
      <FKInputField
        id="street"
        mainLanguage={germanT.street || 'Straße (DE)'} // Correct pattern
        selectedLanguage={t.street || 'Street'} // Correct pattern
        value={addressData.street || ''}
        onChange={(e) => handleAddressChange('street', e.target.value)}
        mandatory={true}
        hasError={fieldHasError('street')}
        validationError={getValidationMessage('street')}
      />
      {/* --- House Number --- */}
      <FKInputField
        id="houseNumber"
        mainLanguage={germanT.houseNumber || 'Hausnummer (DE)'} // Correct pattern
        selectedLanguage={t.houseNumber || 'House Number'} // Correct pattern
        value={addressData.houseNumber || ''}
        onChange={(e) => handleAddressChange('houseNumber', e.target.value)}
        mandatory={true}
        hasError={fieldHasError('houseNumber')}
        validationError={getValidationMessage('houseNumber')}
      />
      {/* --- Postal Code --- */}
      <FKInputField
        id="postalCode"
        mainLanguage={germanT.postalCode || 'Postleitzahl (DE)'} // Correct pattern
        selectedLanguage={t.postalCode || 'Postal Code'} // Correct pattern
        value={addressData.postalCode || ''}
        onChange={(e) => handleAddressChange('postalCode', e.target.value)}
        mandatory={true}
        hasError={fieldHasError('postalCode')}
        validationError={getValidationMessage('postalCode')}
      />
      {/* --- City --- */}
      <FKInputField
        id="city"
        mainLanguage={germanT.city || 'Stadt (DE)'} // Correct pattern
        selectedLanguage={t.city || 'City'} // Correct pattern
        value={addressData.city || ''}
        onChange={(e) => handleAddressChange('city', e.target.value)}
        mandatory={true}
        hasError={fieldHasError('city')}
        validationError={getValidationMessage('city')}
      />
    </div>
  );
};

export default TFAddress; 