import React from 'react';
import FKInputField from '../../../ui/FKInputField';
import FKYesNo from '../../../ui/FKYesNo';
import FKSelectField from '../../../ui/FKSelectField';
import { ValidationErrors } from '../validation'; // Import type
import { LanguageCode } from '../constants';

// Define props passed from TaxFormBase
interface TFPersonalInfoProps {
  formData: { [key: string]: any }; // Use the actual TaxFormData type later
  handleChange: (section: string, field: string, value: any) => void; // Update signature later if needed
  selectedLanguage: LanguageCode;
  i18nData: any; // Replace with specific LanguageData type later
  germanI18nData: any; // Replace with specific LanguageData type later
  validationErrors: ValidationErrors | null; // Add prop for validation errors
  showValidationErrors: boolean; // Add prop to control error display
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

const TFPersonalInfo: React.FC<TFPersonalInfoProps> = ({ 
  formData, 
  handleChange, 
  i18nData, 
  germanI18nData, 
  validationErrors, 
  showValidationErrors }) => {
  // // Helper to get nested value safely, with type casting
  // const getValue = (path: string): any => { // Return type any for now
  //   try {
  //       return path.split('.').reduce((obj, key) => (obj && obj[key] !== undefined ? obj[key] : null), formData.personalInfo || {});
  //   } catch (error) {
  //       console.error("Error in getValue:", { path, formData });
  //       return null; // Return null on error
  //   }
  // };

  // Helper to call handleChange with section prefix
  const handleFieldChange = (field: string, value: any) => {
    handleChange('personalInfo', field, value);
  };

  // Get translations, ensuring fallback if data isn't loaded or structured correctly
  const t = i18nData?.taxForm?.personalInfo || {}; 
  const germanT = germanI18nData?.taxForm?.personalInfo || t;

  // Ensure section exists in formData
  const personalInfoData = formData.personalInfo || {};

  // --- Helper to get error message key for a field ---
  const getErrorKey = (field: string): string | undefined => {
    if (!showValidationErrors || !validationErrors?.personalInfo) {
        return undefined;
    }

    try {
      if (field.includes('.')) {
          const keys = field.split('.');
          let currentErrorLevel: any = validationErrors.personalInfo;
          for (const key of keys) {
              if (!currentErrorLevel || typeof currentErrorLevel !== 'object' || !(key in currentErrorLevel)) {
                  // console.log(`getErrorKey: Path ${field} not found at key ${key}`);
                  return undefined;
              }
              currentErrorLevel = currentErrorLevel[key];
          }
          const errorKey = typeof currentErrorLevel === 'string' ? currentErrorLevel : undefined;
          // if(field.startsWith('spouse.')) console.log(`getErrorKey (nested ${field}):`, errorKey);
          return errorKey;
      }

      const errorKey = validationErrors.personalInfo[field];
      const finalKey = typeof errorKey === 'string' ? errorKey : undefined;
      // if(field.startsWith('spouse.')) console.log(`getErrorKey (direct ${field}):`, finalKey);
      return finalKey;
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
        return germanMsg || selectedMsg || errorKey; // Fallback to key if message not found
    }
  };

  // Helper to call handleChange for children array
  const handleChildChange = (index: number, field: string, value: any) => {
    const currentChildren = personalInfoData.children || [];
    const updatedChildren = [...currentChildren];
    if (!updatedChildren[index]) {
      updatedChildren[index] = {}; // Initialize if child doesn't exist
    }
    updatedChildren[index][field] = value;
    handleFieldChange('children', updatedChildren); // Update the whole array
  };

  // Helper to add a new child
  const addChild = () => {
    const currentChildren = personalInfoData.children || [];
    const newChild = { firstName: '', lastName: '', dateOfBirth: '', taxId: '' };
    handleFieldChange('children', [...currentChildren, newChild]);
  };

  // Helper to remove a child
  const removeChild = (index: number) => {
    const currentChildren = personalInfoData.children || [];
    // Added types for filter parameters
    const updatedChildren = currentChildren.filter((_: any, i: number) => i !== index);
    handleFieldChange('children', updatedChildren);
  };

  // Define marital status options from i18n
  const maritalStatusOptions = [
    {
      value: "single",
      mainLabel: germanI18nData?.maritalStatus?.single || "Ledig",
      selectedLabel: i18nData?.maritalStatus?.single || "Single"
    },
    {
      value: "married",
      mainLabel: germanI18nData?.maritalStatus?.married || "Verheiratet",
      selectedLabel: i18nData?.maritalStatus?.married || "Married"
    },
    {
      value: "divorced",
      mainLabel: germanI18nData?.maritalStatus?.divorced || "Geschieden",
      selectedLabel: i18nData?.maritalStatus?.divorced || "Divorced"
    },
    {
      value: "widowed",
      mainLabel: germanI18nData?.maritalStatus?.widowed || "Verwitwet",
      selectedLabel: i18nData?.maritalStatus?.widowed || "Widowed"
    }
  ];

  // Define country options from i18n
  const countryOptions = Object.entries(germanI18nData?.countries || {}).map(([key, mainLabel]) => ({
    value: key,
    mainLabel: mainLabel as string,
    selectedLabel: i18nData?.countries?.[key] || key
  }));

  // Helper to check if marital status requires spouse info
  const requiresSpouseInfo = (status: string): boolean => {
    return status === 'married';
  };

  // Update spouse section validation based on marital status
  const getSpouseValidationMessage = (field: string): string | undefined => {
    if (requiresSpouseInfo(personalInfoData.maritalStatus)) {
      return getValidationMessage(field);
    }
    return undefined;
  };

  const hasSpouseError = (field: string): boolean => {
    if (requiresSpouseInfo(personalInfoData.maritalStatus)) {
      return fieldHasError(field);
    }
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Basic Information Section */}
      <FormSection title={<>{germanT.title || 'Personal Information (DE)'} / {t.title || 'Personal Information'}</>}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* --- First Name --- */}
          <FKInputField
            id="firstName"
            mainLanguage={germanT.firstName || 'First Name (DE)'}
            selectedLanguage={t.firstName || 'First Name'}
            value={personalInfoData.firstName || ''}
            onChange={(e) => handleFieldChange('firstName', e.target.value)}
            mandatory={true}
            hasError={fieldHasError('firstName')}
            validationError={getValidationMessage('firstName')}
          />
          {/* --- Last Name --- */}
          <FKInputField
            id="lastName"
            mainLanguage={germanT.lastName || 'Last Name (DE)'}
            selectedLanguage={t.lastName || 'Last Name'}
            value={personalInfoData.lastName || ''}
            onChange={(e) => handleFieldChange('lastName', e.target.value)}
            mandatory={true}
            hasError={fieldHasError('lastName')}
            validationError={getValidationMessage('lastName')}
          />
          {/* --- Tax ID --- */}
          <FKInputField
            id="taxId"
            mainLanguage={germanT.taxId || 'Tax ID (DE)'}
            selectedLanguage={t.taxId || 'Tax ID'}
            value={personalInfoData.taxId || ''}
            onChange={(e) => handleFieldChange('taxId', e.target.value)}
            mandatory={true}
            hasError={fieldHasError('taxId')}
            validationError={getValidationMessage('taxId')}
          />
          {/* --- Date of Birth --- */}
          <FKInputField
            id="dateOfBirth"
            type="date"
            mainLanguage={germanT.dateOfBirth || 'Date of Birth (DE)'}
            selectedLanguage={t.dateOfBirth || 'Date of Birth'}
            value={personalInfoData.dateOfBirth || ''}
            onChange={(e) => handleFieldChange('dateOfBirth', e.target.value)}
            mandatory={true}
            hasError={fieldHasError('dateOfBirth')}
            validationError={getValidationMessage('dateOfBirth')}
          />
          {/* --- Marital Status --- */}
          <FKSelectField
            id="maritalStatus"
            mainLanguage={germanT.maritalStatus || 'Familienstand'}
            selectedLanguage={t.maritalStatus || 'Marital Status'}
            value={personalInfoData.maritalStatus || ''}
            onChange={(e) => {
              handleFieldChange('maritalStatus', e.target.value);
              // Reset spouse data if changing to a status that doesn't require it
              if (!requiresSpouseInfo(e.target.value)) {
                handleFieldChange('hasSpouse', false);
                handleFieldChange('spouse', {});
              }
            }}
            options={maritalStatusOptions}
            mandatory={true}
            hasError={fieldHasError('maritalStatus')}
            validationError={getValidationMessage('maritalStatus')}
            placeholder={{
              mainLabel: "Bitte Familienstand auswählen",
              selectedLabel: "Please select marital status"
            }}
          />
          {/* --- Email --- */}
          <FKInputField
            id="email"
            type="email"
            mainLanguage={germanT.email || 'Email (DE)'}
            selectedLanguage={t.email || 'Email'}
            value={personalInfoData.email || ''}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            hasError={fieldHasError('email')} // Add validation if needed
            validationError={getValidationMessage('email')} // Add validation if needed
          />
          {/* --- Phone --- */}
          <FKInputField
            id="phone"
            type="tel"
            mainLanguage={germanT.phone || 'Phone (DE)'}
            selectedLanguage={t.phone || 'Phone'}
            value={personalInfoData.phone || ''}
            onChange={(e) => handleFieldChange('phone', e.target.value)}
            hasError={fieldHasError('phone')} // Add validation if needed
            validationError={getValidationMessage('phone')} // Add validation if needed
          />
        </div>
      </FormSection>

      {/* Address Section */}
      <FormSection title={<>{germanT.address?.title || 'Address (DE)'} / {t.address?.title || 'Address'}</>}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* --- Street --- */}
          <FKInputField
            id="address.street"
            mainLanguage={germanT.address?.street || 'Street (DE)'}
            selectedLanguage={t.address?.street || 'Street'}
            value={personalInfoData.address?.street || ''}
            onChange={(e) => handleFieldChange('address.street', e.target.value)}
            mandatory={true}
            hasError={fieldHasError('address.street')}
            validationError={getValidationMessage('address.street')}
          />
          {/* --- House Number --- */}
          <FKInputField
            id="address.houseNumber"
            mainLanguage={germanT.address?.houseNumber || 'House Number (DE)'}
            selectedLanguage={t.address?.houseNumber || 'House Number'}
            value={personalInfoData.address?.houseNumber || ''}
            onChange={(e) => handleFieldChange('address.houseNumber', e.target.value)}
            mandatory={true}
            hasError={fieldHasError('address.houseNumber')}
            validationError={getValidationMessage('address.houseNumber')}
          />
          {/* --- Postal Code --- */}
          <FKInputField
            id="address.postalCode"
            mainLanguage={germanT.address?.postalCode || 'Postal Code (DE)'}
            selectedLanguage={t.address?.postalCode || 'Postal Code'}
            value={personalInfoData.address?.postalCode || ''}
            onChange={(e) => handleFieldChange('address.postalCode', e.target.value)}
            mandatory={true}
            hasError={fieldHasError('address.postalCode')}
            validationError={getValidationMessage('address.postalCode')}
          />
          {/* --- City --- */}
          <FKInputField
            id="address.city"
            mainLanguage={germanT.address?.city || 'City (DE)'}
            selectedLanguage={t.address?.city || 'City'}
            value={personalInfoData.address?.city || ''}
            onChange={(e) => handleFieldChange('address.city', e.target.value)}
            mandatory={true}
            hasError={fieldHasError('address.city')}
            validationError={getValidationMessage('address.city')}
          />
        </div>
      </FormSection>

      {/* Foreign Residence Section */}
      <FormSection title={<>{germanT.foreignResidence?.title || 'Foreign Residence (DE)'} / {t.foreignResidence?.title || 'Foreign Residence'}</>}>
        <FKYesNo
          id="hasForeignResidence"
          mainLanguage={germanT.foreignResidence?.hasResidence || 'Do you have residence abroad? (DE)'}
          selectedLanguage={t.foreignResidence?.hasResidence || 'Do you have residence abroad?'}
          value={personalInfoData.hasForeignResidence}
          onChange={(value) => handleFieldChange('hasForeignResidence', value)}
          mandatory={true}
          hasError={fieldHasError('hasForeignResidence')}
          validationError={getValidationMessage('hasForeignResidence')}
        />
        {personalInfoData.hasForeignResidence === true && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* --- Country --- */}
            <FKSelectField
              id="foreignResidence.country"
              mainLanguage={germanT.foreignResidence?.country}
              selectedLanguage={t.foreignResidence?.country}
              value={personalInfoData.foreignResidence?.country || ''}
              onChange={(e) => handleFieldChange('foreignResidence.country', e.target.value)}
              options={countryOptions}
              mandatory={true}
              hasError={fieldHasError('foreignResidence.country')}
              validationError={getValidationMessage('foreignResidence.country')}
              placeholder={{
                mainLabel: "Bitte Land auswählen",
                selectedLabel: "Please select country"
              }}
            />
            {/* --- Other Country (Conditional) --- */}
            {personalInfoData.foreignResidence?.country === 'other' && (
              <FKInputField
                id="foreignResidence.otherCountry"
                mainLanguage={germanT.foreignResidence?.otherCountry || 'Other Country (DE)'}
                selectedLanguage={t.foreignResidence?.otherCountry || 'Other Country'}
                value={personalInfoData.foreignResidence?.otherCountry || ''}
                onChange={(e) => handleFieldChange('foreignResidence.otherCountry', e.target.value)}
                mandatory={true} // Conditionally mandatory
                hasError={fieldHasError('foreignResidence.otherCountry')}
                validationError={getValidationMessage('foreignResidence.otherCountry')}
              />
            )}
          </div>
        )}
      </FormSection>

      {/* Spouse Section */}
      
        {requiresSpouseInfo(personalInfoData.maritalStatus) && (
          <FormSection title={<>{germanT.spouse?.title || 'Spouse Info (DE)'} / {t.spouse?.title || 'Spouse Info'}</>}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* --- Spouse First Name --- */}
            <FKInputField
              id="spouse.firstName"
              mainLanguage={germanT.spouse?.firstName || 'Spouse First Name (DE)'}
              selectedLanguage={t.spouse?.firstName || 'Spouse First Name'}
              value={personalInfoData.spouse?.firstName || ''}
              onChange={(e) => handleFieldChange('spouse.firstName', e.target.value)}
              mandatory={true}
              hasError={hasSpouseError('spouse.firstName')}
              validationError={getSpouseValidationMessage('spouse.firstName')}
            />
            {/* --- Spouse Last Name --- */}
            <FKInputField
              id="spouse.lastName"
              mainLanguage={germanT.spouse?.lastName || 'Spouse Last Name (DE)'}
              selectedLanguage={t.spouse?.lastName || 'Spouse Last Name'}
              value={personalInfoData.spouse?.lastName || ''}
              onChange={(e) => handleFieldChange('spouse.lastName', e.target.value)}
              mandatory={true}
              hasError={hasSpouseError('spouse.lastName')}
              validationError={getSpouseValidationMessage('spouse.lastName')}
            />
            {/* --- Spouse DoB --- */}
            <FKInputField
              id="spouse.dateOfBirth"
              type="date"
              mainLanguage={germanT.spouse?.dateOfBirth || 'Spouse DoB (DE)'}
              selectedLanguage={t.spouse?.dateOfBirth || 'Spouse DoB'}
              value={personalInfoData.spouse?.dateOfBirth || ''}
              onChange={(e) => handleFieldChange('spouse.dateOfBirth', e.target.value)}
              mandatory={true}
              hasError={hasSpouseError('spouse.dateOfBirth')}
              validationError={getSpouseValidationMessage('spouse.dateOfBirth')}
            />
            {/* --- Spouse Tax ID --- */}
            <FKInputField
              id="spouse.taxId"
              mainLanguage={germanT.spouse?.taxId || 'Spouse Tax ID (DE)'}
              selectedLanguage={t.spouse?.taxId || 'Spouse Tax ID'}
              value={personalInfoData.spouse?.taxId || ''}
              onChange={(e) => handleFieldChange('spouse.taxId', e.target.value)}
              mandatory={true}
              hasError={hasSpouseError('spouse.taxId')}
              validationError={getSpouseValidationMessage('spouse.taxId')}
            />
            {/* --- Spouse Has Income --- */}
            <div className="md:col-span-2">
              <FKYesNo
                id="spouse.hasIncome"
                mainLanguage={germanT.spouse?.hasIncome || 'Spouse Has Income? (DE)'}
                selectedLanguage={t.spouse?.hasIncome || 'Spouse Has Income?'}
                value={personalInfoData.spouse?.hasIncome}
                onChange={(value) => handleFieldChange('spouse.hasIncome', value)}
                mandatory={true}
                hasError={hasSpouseError('spouse.hasIncome')}
                validationError={getSpouseValidationMessage('spouse.hasIncome')}
              />
            </div>
            {/* --- Spouse Income Type & Joint Taxation (Conditional) --- */}
            {personalInfoData.spouse?.hasIncome === true && (
              <>
                <FKSelectField
                  id="spouse.incomeType"
                  mainLanguage={germanT.spouse?.incomeType || 'Income Type (DE)'}
                  selectedLanguage={t.spouse?.incomeType || 'Income Type'}
                  value={personalInfoData.spouse?.incomeType || ''}
                  onChange={(e) => handleFieldChange('spouse.incomeType', e.target.value)}
                  options={[
                    {
                      value: "employment",
                      mainLabel: "Angestellt",
                      selectedLabel: "Employment"
                    },
                    {
                      value: "self_employed",
                      mainLabel: "Selbstständig",
                      selectedLabel: "Self-employed"
                    },
                    {
                      value: "pension",
                      mainLabel: "Rente",
                      selectedLabel: "Pension"
                    }
                  ]}
                  mandatory={true}
                  hasError={hasSpouseError('spouse.incomeType')}
                  validationError={getSpouseValidationMessage('spouse.incomeType')}
                  placeholder={{
                    mainLabel: "Bitte auswählen",
                    selectedLabel: "Please select"
                  }}
                />
                <FKYesNo
                  id="spouse.jointTaxation"
                  mainLanguage={germanT.spouse?.jointTaxation || 'Joint Taxation? (DE)'}
                  selectedLanguage={t.spouse?.jointTaxation || 'Joint Taxation?'}
                  value={personalInfoData.spouse?.jointTaxation}
                  onChange={(value) => handleFieldChange('spouse.jointTaxation', value)}
                  mandatory={true}
                  hasError={hasSpouseError('spouse.jointTaxation')}
                  validationError={getSpouseValidationMessage('spouse.jointTaxation')}
                />
              </>
            )}
          </div>
          </FormSection>
        )}

      {/* Children Section */}
      <FormSection title={<>{germanT.children?.title || 'Children (DE)'} / {t.children?.title || 'Children'}</>}>
        <FKYesNo
          id="hasChildren"
          mainLanguage={germanT.children?.hasChildren || 'Have Children? (DE)'}
          selectedLanguage={t.children?.hasChildren || 'Have Children?'}
          value={personalInfoData.hasChildren}
          onChange={(value) => handleFieldChange('hasChildren', value)}
          mandatory={true}
          hasError={fieldHasError('hasChildren')}
          validationError={getValidationMessage('hasChildren')}
        />
         {personalInfoData.hasChildren === true && (
          <div className="mt-4 space-y-4">
            {/* Show general children error if no children added */}
            {fieldHasError('children') && (
              <div className="text-red-500 text-sm">
                {getValidationMessage('children')}
              </div>
            )}
            {(personalInfoData.children || []).map((child: any, index: number) => (
              <div key={index} className="border border-gray-200 rounded p-3 relative space-y-3">
                <h4 className="text-sm font-medium text-neutral-700">
                  {germanT.children?.child} {index + 1} / {t.children?.child} {index + 1}
                </h4>
                 {/* Remove Button - Absolute Positioned */}
                 <button 
                    type="button"
                    onClick={() => removeChild(index)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 text-xs"
                    aria-label={`Remove Child ${index + 1}`}
                >
                    {germanT.children?.remove || 'Entfernen'} / {t.children?.remove || 'Remove'}
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FKInputField
                    id={`children.${index}.firstName`}
                    mainLanguage={germanT.children?.firstName || 'Vorname des Kindes2'}
                    selectedLanguage={t.children?.firstName || 'Child First Name2'}
                    value={child.firstName || ''}
                    onChange={(e) => handleChildChange(index, 'firstName', e.target.value)}
                    mandatory={true}
                    hasError={fieldHasError(`children.${index}.firstName`)}
                    validationError={getValidationMessage(`children.${index}.firstName`)}
                  />
                  <FKInputField
                    id={`children.${index}.lastName`}
                    mainLanguage={germanI18nData?.taxForm?.personalInfo?.children?.lastName || 'Nachname des Kindes'}
                    selectedLanguage={i18nData?.taxForm?.personalInfo?.children?.lastName || 'Child Last Name'}
                    value={child.lastName || ''}
                    onChange={(e) => handleChildChange(index, 'lastName', e.target.value)}
                    mandatory={true}
                    hasError={fieldHasError(`children.${index}.lastName`)}
                    validationError={getValidationMessage(`children.${index}.lastName`)}
                  />
                  <FKInputField
                    id={`children.${index}.dateOfBirth`}
                    type="date"
                    mainLanguage={germanI18nData?.taxForm?.personalInfo?.children?.dateOfBirth || 'Geburtsdatum des Kindes'}
                    selectedLanguage={i18nData?.taxForm?.personalInfo?.children?.dateOfBirth || 'Child Date of Birth'}
                    value={child.dateOfBirth || ''}
                    onChange={(e) => handleChildChange(index, 'dateOfBirth', e.target.value)}
                    mandatory={true}
                    hasError={fieldHasError(`children.${index}.dateOfBirth`)}
                    validationError={getValidationMessage(`children.${index}.dateOfBirth`)}
                  />
                  <FKInputField
                    id={`children.${index}.taxId`}
                    mainLanguage={germanI18nData?.taxForm?.personalInfo?.children?.taxId || 'Steuer-ID des Kindes'}
                    selectedLanguage={i18nData?.taxForm?.personalInfo?.children?.taxId || 'Child Tax ID'}
                    value={child.taxId || ''}
                    onChange={(e) => handleChildChange(index, 'taxId', e.target.value)}
                    mandatory={true}
                    hasError={fieldHasError(`children.${index}.taxId`)}
                    validationError={getValidationMessage(`children.${index}.taxId`)}
                  />
                </div>
              </div>
            ))}
            {/* Add Child Button */}
            <button
              type="button"
              onClick={addChild}
              className="mt-2 px-3 py-1.5 text-sm border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition-colors"
            >
              {germanI18nData?.taxForm?.personalInfo?.children?.add || 'Kind hinzufügen'} / {i18nData?.taxForm?.personalInfo?.children?.add || 'Add Child'}
            </button>
          </div>
        )}
      </FormSection>

    </div>
  );
};

export default TFPersonalInfo; 