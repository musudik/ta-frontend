import React from 'react';
import FKInputField from '../../../ui/FKInputField';
import FKYesNo from '../../../ui/FKYesNo';
import FKSelectField from '../../../ui/FKSelectField';
import { ValidationErrors } from '../validation';
import { LanguageCode } from '../constants';

interface TFSpouseProps {
  formData: { [key: string]: any };
  handleChange: (section: string, field: string, value: any) => void;
  selectedLanguage: LanguageCode;
  i18nData: any;
  germanI18nData: any;
  validationErrors: ValidationErrors | null;
  showValidationErrors: boolean;
}

const TFSpouse: React.FC<TFSpouseProps> = ({ formData, handleChange, i18nData, germanI18nData, validationErrors, showValidationErrors }) => {

  // Spouse info is nested under personalInfo
  const handleSpouseChange = (field: string, value: any) => {
    handleChange('personalInfo', `spouse.${field}`, value);
  };

  const t = i18nData?.taxForm?.spouse || {};
  const germanT = germanI18nData?.taxForm?.spouse || t;

  const spouseData = formData.personalInfo?.spouse || {};
  const isMarried = formData.personalInfo?.maritalStatus === 'married';

  const getErrorKey = (field: string): string | undefined => {
    if (!showValidationErrors || !validationErrors?.personalInfo?.spouse || !isMarried) {
      return undefined;
    }
    const spouseErrors = validationErrors.personalInfo.spouse;
    if (typeof spouseErrors !== 'object' || spouseErrors === null) return undefined;
    const errorKey = spouseErrors[field];
    return typeof errorKey === 'string' ? errorKey : undefined;
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

  // Only render if marital status is married
  if (!isMarried) {
    return (
      <div className="text-center text-gray-500 p-4 border rounded-md">
        {germanT.notApplicable || 'Nicht anwendbar für Ihren Familienstand.'} / {t.notApplicable || 'Not applicable for your marital status.'}
      </div>
    );
  }

  const incomeTypeOptions = [
    { value: 'employment', mainLabel: germanT.incomeTypes?.employment || 'Anstellung', selectedLabel: t.incomeTypes?.employment || 'Employment' },
    { value: 'selfEmployment', mainLabel: germanT.incomeTypes?.selfEmployment || 'Selbständig', selectedLabel: t.incomeTypes?.selfEmployment || 'Self-Employment' },
    { value: 'pension', mainLabel: germanT.incomeTypes?.pension || 'Rente', selectedLabel: t.incomeTypes?.pension || 'Pension' },
    { value: 'other', mainLabel: germanT.incomeTypes?.other || 'Andere', selectedLabel: t.incomeTypes?.other || 'Other' }
  ];

  return (
    <div className="space-y-4">
      {/* --- Spouse First Name --- */}
      <FKInputField
        id="spouse.firstName"
        mainLanguage={germanT.firstName || 'Vorname des Ehepartners (DE)'}
        selectedLanguage={t.firstName || 'Spouse First Name'}
        value={spouseData.firstName || ''}
        onChange={(e) => handleSpouseChange('firstName', e.target.value)}
        mandatory={true}
        hasError={fieldHasError('firstName')}
        validationError={getValidationMessage('firstName')}
      />
      {/* --- Spouse Last Name --- */}
      <FKInputField
        id="spouse.lastName"
        mainLanguage={germanT.lastName || 'Nachname des Ehepartners (DE)'}
        selectedLanguage={t.lastName || 'Spouse Last Name'}
        value={spouseData.lastName || ''}
        onChange={(e) => handleSpouseChange('lastName', e.target.value)}
        mandatory={true}
        hasError={fieldHasError('lastName')}
        validationError={getValidationMessage('lastName')}
      />
      {/* --- Spouse Date of Birth --- */}
      <FKInputField
        id="spouse.dateOfBirth"
        type="date"
        mainLanguage={germanT.dateOfBirth || 'Geburtsdatum des Ehepartners (DE)'}
        selectedLanguage={t.dateOfBirth || 'Spouse Date of Birth'}
        value={spouseData.dateOfBirth || ''}
        onChange={(e) => handleSpouseChange('dateOfBirth', e.target.value)}
        mandatory={true}
        hasError={fieldHasError('dateOfBirth')}
        validationError={getValidationMessage('dateOfBirth')}
      />
      {/* --- Spouse Tax ID --- */}
      <FKInputField
        id="spouse.taxId"
        mainLanguage={germanT.taxId || 'Steuer-ID des Ehepartners (DE)'}
        selectedLanguage={t.taxId || 'Spouse Tax ID'}
        value={spouseData.taxId || ''}
        onChange={(e) => handleSpouseChange('taxId', e.target.value)}
        mandatory={spouseData.jointTaxation}
        hasError={fieldHasError('taxId')}
        validationError={getValidationMessage('taxId')}
      />
      {/* --- Spouse Has Income --- */}
      <FKYesNo
        id="spouse.hasIncome"
        mainLanguage={germanT.hasIncome || 'Hat der Ehepartner Einkommen? (DE)'}
        selectedLanguage={t.hasIncome || 'Does the spouse have income?'}
        value={spouseData.hasIncome}
        onChange={(value) => {
          handleSpouseChange('hasIncome', value);
          if (!value) {
            handleSpouseChange('incomeType', '');
            handleSpouseChange('jointTaxation', false);
          }
        }}
        mandatory={true}
        hasError={fieldHasError('hasIncome')}
        validationError={getValidationMessage('hasIncome')}
      />
      
      {spouseData.hasIncome && (
        <div className="space-y-4 pt-4 border-t border-gray-200 mt-4">
          {/* --- Spouse Income Type --- */}
          <FKSelectField
            id="spouse.incomeType"
            mainLanguage={germanT.incomeType || 'Art des Einkommens (DE)'}
            selectedLanguage={t.incomeType || 'Type of Income'}
            value={spouseData.incomeType || ''}
            onChange={(e) => handleSpouseChange('incomeType', e.target.value)}
            options={incomeTypeOptions}
            mandatory={true}
            hasError={fieldHasError('incomeType')}
            validationError={getValidationMessage('incomeType')}
            placeholder={{ mainLabel: "Einkommensart auswählen", selectedLabel: "Select Income Type" }}
          />
          {/* --- Joint Taxation --- */}
          <FKYesNo
            id="spouse.jointTaxation"
            mainLanguage={germanT.jointTaxation || 'Gemeinsame steuerliche Veranlagung? (DE)'}
            selectedLanguage={t.jointTaxation || 'File taxes jointly?'}
            value={spouseData.jointTaxation}
            onChange={(value) => handleSpouseChange('jointTaxation', value)}
            mandatory={true}
            hasError={fieldHasError('jointTaxation')}
            validationError={getValidationMessage('jointTaxation')}
          />
        </div>
      )}
    </div>
  );
};

export default TFSpouse; 