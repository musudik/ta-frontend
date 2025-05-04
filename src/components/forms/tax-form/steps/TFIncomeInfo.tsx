import React from 'react';
import FKInputField from '../../../ui/FKInputField';
import FKYesNo from '../../../ui/FKYesNo';
import FKSelectField from '../../../ui/FKSelectField';
import FKFileField from '../../../ui/FKFileField';
import { ValidationErrors } from '../validation';
import { LanguageCode } from '../constants';

// Define props passed from TaxFormBase
interface TFIncomeInfoProps {
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

// Helper component for currency input with Euro symbol
const CurrencyInputField: React.FC<any> = ({ id, mainLanguage, selectedLanguage, value, onChange, mandatory, hasError, validationError, ...props }) => (
  <div className="relative">
    <span className="absolute left-3 top-[62px] text-gray-500">€</span>
    <FKInputField
      id={id}
      mainLanguage={mainLanguage}
      selectedLanguage={selectedLanguage}
      value={value}
      onChange={onChange}
      mandatory={mandatory}
      hasError={hasError}
      validationError={validationError}
      className="currency-input"
      type="number"
      min={0}
      step={0.01}
      {...props}
    />
    <style>
      {`
        .currency-input input {
          padding-left: 1.75rem !important;
        }
      `}
    </style>
  </div>
);

const TFIncomeInfo: React.FC<TFIncomeInfoProps> = ({
  formData,
  handleChange,
  i18nData,
  germanI18nData,
  validationErrors,
  showValidationErrors
}) => {
  // Get translations
  const t = i18nData?.taxForm?.incomeInfo || {};
  const germanT = germanI18nData?.taxForm?.incomeInfo || t;

  // Helper to call handleChange with section prefix
  const handleFieldChange = (field: string, value: any) => {
    handleChange('incomeInfo', field, value);
  };

  // Helper to get error message key for a field
  const getErrorKey = (field: string): string | undefined => {
    if (!showValidationErrors || !validationErrors?.incomeInfo) {
      // console.log(`getErrorKey: No errors to show or no incomeInfo errors for ${field}`);
      return undefined;
    }

    try {
      if (field.includes('.')) {
        const keys = field.split('.');
        let currentErrorLevel: any = validationErrors.incomeInfo;
        for (const key of keys) {
          if (!currentErrorLevel || typeof currentErrorLevel !== 'object' || !(key in currentErrorLevel)) {
            // console.log(`getErrorKey: Path ${field} not found at key ${key}`);
            return undefined;
          }
          currentErrorLevel = currentErrorLevel[key];
        }
        const errorKey = typeof currentErrorLevel === 'string' ? currentErrorLevel : undefined;
        return errorKey;
      }

      const errorKey = validationErrors.incomeInfo[field];
      const finalKey = typeof errorKey === 'string' ? errorKey : undefined;
      return finalKey;
    } catch (e) {
      console.error("Error in getErrorKey for field:", field, e);
      return undefined;
    }
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
    } else {
      return germanMsg || selectedMsg || errorKey; // Fallback to key if message not found
    }
  };

  // Helper to check if employment fields should be validated
  const requiresEmploymentInfo = (isEmployed: boolean): boolean => {
    return isEmployed === true;
  };

  // Helper to check if investment fields should be validated
  const requiresInvestmentInfo = (hasStockIncome: boolean): boolean => {
    return hasStockIncome === true;
  };

  // Helper to get conditional validation message
  const getConditionalValidationMessage = (field: string, condition: boolean): string | undefined => {
    if (condition) {
      return getValidationMessage(field);
    }
    return undefined;
  };

  // Helper to check if field has conditional error
  const hasConditionalError = (field: string, condition: boolean): boolean => {
    if (condition) {
      return fieldHasError(field);
    }
    return false;
  };

  // Get the incomeInfo data
  const incomeInfoData = formData.incomeInfo || {};

  // Get business type options from i18n (from root level)
  const businessTypeOptions = Object.entries(germanI18nData?.businessType || {}).map(([key, mainLabel]) => ({
    value: key,
    mainLabel: mainLabel as string,
    selectedLabel: i18nData?.businessType?.[key] || key
  }));

  return (
    <div className="space-y-6">
      {/* Employment Section */}
      <FormSection title={<>{germanT.employment?.title || 'Income Information (DE)'} / {t.employment?.title || 'Income Information'}</>}>
        <FKYesNo
          id="employment.isEmployed"
          mainLanguage={germanT.employment?.isEmployed}
          selectedLanguage={t.employment?.isEmployed}
          value={incomeInfoData.employment?.isEmployed}
          onChange={(value) => handleFieldChange('employment.isEmployed', value)}
          mandatory={true}
          hasError={fieldHasError('employment.isEmployed')}
          validationError={getValidationMessage('employment.isEmployed')}
        />

        {incomeInfoData.employment?.isEmployed === true && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FKInputField
              id="employment.employer"
              mainLanguage={germanT.employment?.employer}
              selectedLanguage={t.employment?.employer}
              value={incomeInfoData.employment?.employer || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('employment.employer', e.target.value)}
              mandatory={true}
              hasError={hasConditionalError('employment.employer', requiresEmploymentInfo(incomeInfoData.employment?.isEmployed))}
              validationError={getConditionalValidationMessage('employment.employer', requiresEmploymentInfo(incomeInfoData.employment?.isEmployed))}
            />

            <CurrencyInputField
              id="employment.employmentIncome"
              mainLanguage={germanT.employment?.employmentIncome}
              selectedLanguage={t.employment?.employmentIncome}
              value={incomeInfoData.employment?.employmentIncome || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('employment.employmentIncome', e.target.value)}
              mandatory={true}
              hasError={fieldHasError('employment.employmentIncome')}
              validationError={getValidationMessage('employment.employmentIncome')}
            />

            <FKYesNo
              id="employment.hasTaxCertificate"
              mainLanguage={germanT.employment?.hasTaxCertificate}
              selectedLanguage={t.employment?.hasTaxCertificate}
              value={incomeInfoData.employment?.hasTaxCertificate}
              onChange={(value) => handleFieldChange('employment.hasTaxCertificate', value)}
              mandatory={true}
              hasError={fieldHasError('employment.hasTaxCertificate')}
              validationError={getValidationMessage('employment.hasTaxCertificate')}
            />

            {incomeInfoData.employment?.hasTaxCertificate === false && (
              <div></div>
            )}
            {incomeInfoData.employment?.hasTaxCertificate === true && (
              <div>
                <FKFileField
                  id="employment.taxCertificate"
                  mainLanguage={germanT.employment?.taxCertificate}
                  selectedLanguage={t.employment?.taxCertificate}
                  value={incomeInfoData.employment?.taxCertificate || null}
                  onChange={(files) => handleFieldChange('employment.taxCertificate', files)}
                  mandatory={true}
                  multiple={true}
                  accept=".pdf,.jpg,.jpeg,.png"
                  maxSize={5}
                  hasError={fieldHasError('employment.taxCertificate')}
                  validationError={getValidationMessage('employment.taxCertificate')}
                />
              </div>
            )}

            <FKYesNo
              id="employment.hasTravelSubsidy"
              mainLanguage={germanT.employment?.hasTravelSubsidy}
              selectedLanguage={t.employment?.hasTravelSubsidy}
              value={incomeInfoData.employment?.hasTravelSubsidy}
              onChange={(value) => handleFieldChange('employment.hasTravelSubsidy', value)}
              mandatory={true}
              hasError={fieldHasError('employment.hasTravelSubsidy')}
              validationError={getValidationMessage('employment.hasTravelSubsidy')}
            />

            {incomeInfoData.employment?.hasTravelSubsidy === true && (
              <FKInputField
                id="employment.travelDistance"
                type="number"
                min={0}
                mainLanguage={germanT.employment?.travelDistance}
                selectedLanguage={t.employment?.travelDistance}
                value={incomeInfoData.employment?.travelDistance || ''}
                onChange={(e) => handleFieldChange('employment.travelDistance', e.target.value)}
                mandatory={true}
                hasError={fieldHasError('employment.travelDistance')}
                validationError={getValidationMessage('employment.travelDistance')}
              />
            )}
          </div>
        )}
      </FormSection>

      {/* Business Section */}
      <FormSection title={<>{germanT.business?.title || 'Self-Employment Income (DE)'} / {t.business?.title || 'Self-Employment Income'}</>}>
        <FKYesNo
          id="business.isBusinessOwner"
          mainLanguage={germanT.business?.isBusinessOwner}
          selectedLanguage={t.business?.isBusinessOwner}
          value={incomeInfoData.business?.isBusinessOwner}
          onChange={(value) => handleFieldChange('business.isBusinessOwner', value)}
          mandatory={true}
          hasError={fieldHasError('business.isBusinessOwner')}
          validationError={getValidationMessage('business.isBusinessOwner')}
        />
        

        {incomeInfoData.business?.isBusinessOwner === true && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FKSelectField
              id="business.businessType"
              mainLanguage={germanT.business?.businessType}
              selectedLanguage={t.business?.businessType}
              value={incomeInfoData.business?.businessType || ''}
              onChange={(e) => handleFieldChange('business.businessType', e.target.value)}
              options={businessTypeOptions}
              mandatory={true}
              hasError={fieldHasError('business.businessType')}
              validationError={getValidationMessage('business.businessType')}
              placeholder={{
                mainLabel: "Bitte Geschäftsart auswählen",
                selectedLabel: "Please select business type"
              }}
            />

            <div></div>

            <CurrencyInputField
              id="business.businessEarnings"
              mainLanguage={germanT.business?.businessEarnings}
              selectedLanguage={t.business?.businessEarnings}
              value={incomeInfoData.business?.businessEarnings || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('business.businessEarnings', e.target.value)}
              mandatory={true}
              hasError={fieldHasError('business.businessEarnings')}
              validationError={getValidationMessage('business.businessEarnings')}
            />

            <CurrencyInputField
              id="business.businessExpenses"
              mainLanguage={germanT.business?.businessExpenses}
              selectedLanguage={t.business?.businessExpenses}
              value={incomeInfoData.business?.businessExpenses || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('business.businessExpenses', e.target.value)}
              mandatory={true}
              hasError={fieldHasError('business.businessExpenses')}
              validationError={getValidationMessage('business.businessExpenses')}
            />
          </div>
        )}
      </FormSection>

      {/* Investments Section */}
      <FormSection title={<>{germanT.investments?.title || 'Investment Income (DE)'} / {t.investments?.title || 'Investment Income'}</>}>
        <FKYesNo
          id="investments.hasStockIncome"
          mainLanguage={germanT.investments?.hasStockIncome}
          selectedLanguage={t.investments?.hasStockIncome}
          value={incomeInfoData.investments?.hasStockIncome}
          onChange={(value) => handleFieldChange('investments.hasStockIncome', value)}
          mandatory={true}
          hasError={fieldHasError('investments.hasStockIncome')}
          validationError={getValidationMessage('investments.hasStockIncome')}
        />

        {incomeInfoData.investments?.hasStockIncome === true && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CurrencyInputField
              id="investments.dividendEarnings"
              mainLanguage={germanT.investments?.dividendEarnings}
              selectedLanguage={t.investments?.dividendEarnings}
              value={incomeInfoData.investments?.dividendEarnings || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('investments.dividendEarnings', e.target.value)}
              mandatory={true}
              hasError={hasConditionalError('investments.dividendEarnings', requiresInvestmentInfo(incomeInfoData.investments?.hasStockIncome))}
              validationError={getConditionalValidationMessage('investments.dividendEarnings', requiresInvestmentInfo(incomeInfoData.investments?.hasStockIncome))}
            />
            <CurrencyInputField
              id="investments.capitalGains"
              mainLanguage={germanT.investments?.capitalGains}
              selectedLanguage={t.investments?.capitalGains}
              value={incomeInfoData.investments?.capitalGains || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('investments.capitalGains', e.target.value)}
              mandatory={true}
              hasError={fieldHasError('investments.capitalGains')}
              validationError={getValidationMessage('investments.capitalGains')}
            />
            <FKYesNo
              id="investments.hasStockSales"
              mainLanguage={germanT.investments?.hasStockSales}
              selectedLanguage={t.investments?.hasStockSales}
              value={incomeInfoData.investments?.hasStockSales}
              onChange={(value) => handleFieldChange('investments.hasStockSales', value)}
              mandatory={true}
              hasError={fieldHasError('investments.hasStockSales')}
              validationError={getValidationMessage('investments.hasStockSales')}
            />

            {incomeInfoData.investments?.hasStockSales === false && (
              <div></div>
            )}
            {incomeInfoData.investments?.hasStockSales === true && (
              <CurrencyInputField
                id="investments.stockProfitLoss"
                mainLanguage={germanT.investments?.stockProfitLoss}
                selectedLanguage={t.investments?.stockProfitLoss}
                value={incomeInfoData.investments?.stockProfitLoss || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('investments.stockProfitLoss', e.target.value)}
                mandatory={true}
                hasError={fieldHasError('investments.stockProfitLoss')}
                validationError={getValidationMessage('investments.stockProfitLoss')}
              />
            )}

            <FKYesNo
              id="investments.hasBankCertificate"
              mainLanguage={germanT.investments?.hasBankCertificate}
              selectedLanguage={t.investments?.hasBankCertificate}
              value={incomeInfoData.investments?.hasBankCertificate}
              onChange={(value) => handleFieldChange('investments.hasBankCertificate', value)}
              mandatory={true}
              hasError={fieldHasError('investments.hasBankCertificate')}
              validationError={getValidationMessage('investments.hasBankCertificate')}
            />

            {incomeInfoData.investments?.hasBankCertificate === false && (
              <div></div>
            )}
            {incomeInfoData.investments?.hasBankCertificate === true && (
              <div>
                <FKFileField
                  id="investments.bankCertificate"
                  mainLanguage={germanT.investments?.bankCertificate || "Bank Certificate"}
                  selectedLanguage={t.investments?.bankCertificate || "Bank Certificate"}
                  value={incomeInfoData.investments?.bankCertificate || null}
                  onChange={(files) => handleFieldChange('investments.bankCertificate', files)}
                  mandatory={true}
                  multiple={false}
                  accept=".pdf,.jpg,.jpeg,.png"
                  maxSize={5}
                  hasError={fieldHasError('investments.bankCertificate')}
                  validationError={getValidationMessage('investments.bankCertificate')}
                />
              </div>
            )}
            <FKYesNo
              id="investments.hasForeignStocks"
              mainLanguage={germanT.investments?.hasForeignStocks}
              selectedLanguage={t.investments?.hasForeignStocks}
              value={incomeInfoData.investments?.hasForeignStocks}
              onChange={(value) => handleFieldChange('investments.hasForeignStocks', value)}
              mandatory={true}
              hasError={fieldHasError('investments.hasForeignStocks')}
              validationError={getValidationMessage('investments.hasForeignStocks')}
            />

            {incomeInfoData.investments?.hasForeignStocks === true && (
              <CurrencyInputField
                id="investments.foreignTaxPaid"
                mainLanguage={germanT.investments?.foreignTaxPaid}
                selectedLanguage={t.investments?.foreignTaxPaid}
                value={incomeInfoData.investments?.foreignTaxPaid || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('investments.foreignTaxPaid', e.target.value)}
                mandatory={true}
                hasError={fieldHasError('investments.foreignTaxPaid')}
                validationError={getValidationMessage('investments.foreignTaxPaid')}
              />
            )}
          </div>
        )}
      </FormSection>
    </div>
  );
};

export default TFIncomeInfo; 