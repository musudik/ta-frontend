import React from 'react';
import FKSelectField from '../../../ui/FKSelectField';

// Define the component props
interface TFTaxYearProps {
  formData: any;
  handleChange: (section: string, field: string, value: any) => void;
  validationErrors: any;
  showValidationErrors: boolean;
  i18nData: any;
  germanI18nData: any;
  germanT: any;
  selectedT: any;
}

const TFTaxYear: React.FC<TFTaxYearProps> = ({
  formData,
  handleChange,
  validationErrors,
  showValidationErrors,
  germanT,
  selectedT,
}) => {
  // Generate options for the last 5 years starting from last year
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = currentYear - 1 - i;
    return { 
      value: year.toString(), 
      label: year.toString(),
      mainLabel: year.toString(),
      selectedLabel: year.toString()
    };
  });

  // Handler for the select field
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleChange('taxYear', 'year', e.target.value);
  };

  const hasError = showValidationErrors && !!validationErrors?.taxYear?.year;
  const errorMessage = hasError ? validationErrors.taxYear.year : '';
  
  // Create placeholder for the dropdown
  const placeholder = {
    mainLabel: germanT?.placeholder || 'Jahr auswählen',
    selectedLabel: selectedT?.placeholder || 'Select Year'
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">
        {germanT?.title || 'Steuerjahr'} / {selectedT?.title || 'Tax Year'}
      </h3>
      <p className="text-sm text-neutral-600 mb-6">
        {germanT?.description || 'Bitte wählen Sie das Jahr aus, für das Sie die Steuererklärung einreichen möchten.'} / {selectedT?.description || 'Please select the year for which you are filing this tax return.'}
      </p>

      <div className="mb-8">
        <FKSelectField
          id="taxYear"
          value={formData.taxYear?.year || ''}
          onChange={handleYearChange}
          options={yearOptions}
          mainLanguage={germanT?.yearLabel || 'Steuerjahr'}
          selectedLanguage={selectedT?.yearLabel || 'Tax Year'}
          hasError={hasError}
          validationError={errorMessage}
          mandatory={true}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};

export default TFTaxYear; 