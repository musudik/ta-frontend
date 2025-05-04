import React from 'react';
import FKInputField from '../../../ui/FKInputField';
import FKYesNo from '../../../ui/FKYesNo';
import FKFileField from '../../../ui/FKFileField';
import FKExpenseArray from '../../../ui/FKExpenseArray';
import { ValidationErrors } from '../validation';
import { LanguageCode } from '../constants';

interface TFWorkRelatedExpensesProps {
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

// Helper component for address fields
const AddressFields = ({ 
  prefix,
  data,
  handleFieldChange,
  t,
  germanT,
  fieldHasError,
  getValidationMessage
}: { 
  prefix: string;
  data: any;
  handleFieldChange: (field: string, value: any) => void;
  t: any;
  germanT: any;
  fieldHasError: (field: string) => boolean;
  getValidationMessage: (field: string) => string | undefined;
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <FKInputField
      id={`${prefix}.street`}
      mainLanguage={germanT?.street || 'Street (DE)'}
      selectedLanguage={t?.street || 'Street'}
      value={data?.street || ''}
      onChange={(e) => handleFieldChange(`${prefix}.street`, e.target.value)}
      mandatory={true}
      hasError={fieldHasError(`${prefix}.street`)}
      validationError={getValidationMessage(`${prefix}.street`)}
    />
    <FKInputField
      id={`${prefix}.houseNumber`}
      mainLanguage={germanT?.houseNumber || 'House Number (DE)'}
      selectedLanguage={t?.houseNumber || 'House Number'}
      value={data?.houseNumber || ''}
      onChange={(e) => handleFieldChange(`${prefix}.houseNumber`, e.target.value)}
      mandatory={true}
      hasError={fieldHasError(`${prefix}.houseNumber`)}
      validationError={getValidationMessage(`${prefix}.houseNumber`)}
    />
    <FKInputField
      id={`${prefix}.postalCode`}
      mainLanguage={germanT?.postalCode || 'Postal Code (DE)'}
      selectedLanguage={t?.postalCode || 'Postal Code'}
      value={data?.postalCode || ''}
      onChange={(e) => handleFieldChange(`${prefix}.postalCode`, e.target.value)}
      mandatory={true}
      hasError={fieldHasError(`${prefix}.postalCode`)}
      validationError={getValidationMessage(`${prefix}.postalCode`)}
    />
    <FKInputField
      id={`${prefix}.city`}
      mainLanguage={germanT?.city || 'City (DE)'}
      selectedLanguage={t?.city || 'City'}
      value={data?.city || ''}
      onChange={(e) => handleFieldChange(`${prefix}.city`, e.target.value)}
      mandatory={true}
      hasError={fieldHasError(`${prefix}.city`)}
      validationError={getValidationMessage(`${prefix}.city`)}
    />
  </div>
);

const TFWorkRelatedExpenses: React.FC<TFWorkRelatedExpensesProps> = ({
  formData,
  handleChange,
  i18nData,
  germanI18nData,
  validationErrors,
  showValidationErrors
}) => {
  
  // Helper to call handleChange with section prefix
  const handleFieldChange = (field: string, value: any) => {
    console.log(`TFWorkRelatedExpenses - Updating field: ${field} with value:`, value);
    
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
  const t = i18nData?.taxForm?.expenses?.workRelatedExpenses || {};
  const germanT = germanI18nData?.taxForm?.expenses?.workRelatedExpenses || {};

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
      {/* Work-Related Expenses Section */}
      <FormSection title={<>{germanT?.title} / {t.title}</>}>
        {/* Commuting Expenses */}
        <div className="border border-gray-100 rounded p-4 space-y-4">
          <h4 className="font-medium text-sm">{germanT?.commutation?.title} / {t.commutation?.title}</h4>
          
          <FKYesNo
            id="workRelatedExpenses.commutation.hasCommutingExpenses"
            mainLanguage={germanT?.commutation?.hasCommutingExpenses}
            selectedLanguage={t.commutation?.hasCommutingExpenses}
            value={expensesData.workRelatedExpenses?.commutation?.hasCommutingExpenses}
            onChange={(value) => handleFieldChange('workRelatedExpenses.commutation.hasCommutingExpenses', value)}
            mandatory={true}
            hasError={fieldHasError('workRelatedExpenses.commutation.hasCommutingExpenses')}
            validationError={getValidationMessage('workRelatedExpenses.commutation.hasCommutingExpenses')}
          />

          {expensesData.workRelatedExpenses?.commutation?.hasCommutingExpenses === true && (
            <div className="space-y-4">
              <FKInputField
                id="workRelatedExpenses.commutation.workingDaysCount"
                type="number"
                mainLanguage={germanT?.commutation?.workingDaysCount || 'Number of working days (230 Max) (DE)'}
                selectedLanguage={t.commutation?.workingDaysCount || 'Number of working days (230 Max)'}
                value={expensesData.workRelatedExpenses?.commutation?.workingDaysCount || ''}
                onChange={(e) => handleFieldChange('workRelatedExpenses.commutation.workingDaysCount', e.target.value)}
                mandatory={true}
                hasError={fieldHasError('workRelatedExpenses.commutation.workingDaysCount')}
                validationError={getValidationMessage('workRelatedExpenses.commutation.workingDaysCount')}
                min={0}
              />

              <div className="space-y-4">
                <h5 className="font-medium text-sm">From Address</h5>
                <AddressFields
                  prefix="workRelatedExpenses.commutation.route.from"
                  data={expensesData.workRelatedExpenses?.commutation?.route?.from}
                  handleFieldChange={handleFieldChange}
                  t={t.commutation?.route?.from}
                  germanT={germanT?.commutation?.route?.from}
                  fieldHasError={fieldHasError}
                  getValidationMessage={getValidationMessage}
                />
              </div>

              <div className="space-y-4">
                <h5 className="font-medium text-sm">First Office Address</h5>
                <AddressFields
                  prefix="workRelatedExpenses.commutation.route.firstOfficeAddress"
                  data={expensesData.workRelatedExpenses?.commutation?.route?.firstOfficeAddress}
                  handleFieldChange={handleFieldChange}
                  t={t.commutation?.route?.firstOfficeAddress}
                  germanT={germanT?.commutation?.route?.firstOfficeAddress}
                  fieldHasError={fieldHasError}
                  getValidationMessage={getValidationMessage}
                />
              </div>
            </div>
          )}
        </div>

        {/* Business Trips and Training Costs */}
        <div className="border border-gray-100 rounded p-4 space-y-4">
          <h4 className="font-medium text-sm">{germanT?.businessTripsCosts?.title} / {t.businessTripsCosts?.title}</h4>
          
          <FKInputField
            id="workRelatedExpenses.businessTripsCosts.amount"
            type="number"
            mainLanguage={germanT?.businessTripsCosts?.amount || 'Amount (DE)'}
            selectedLanguage={t.businessTripsCosts?.amount || 'Amount'}
            value={expensesData.workRelatedExpenses?.businessTripsCosts?.amount || ''}
            onChange={(e) => handleFieldChange('workRelatedExpenses.businessTripsCosts.amount', e.target.value)}
            mandatory={false}
            hasError={fieldHasError('workRelatedExpenses.businessTripsCosts.amount')}
            validationError={getValidationMessage('workRelatedExpenses.businessTripsCosts.amount')}
            min={0}
          />

          {Number(expensesData.workRelatedExpenses?.businessTripsCosts?.amount) > 0 && (
            <FKFileField
              id="workRelatedExpenses.businessTripsCosts.proof"
              mainLanguage={germanT?.businessTripsCosts?.proof || 'Upload Proof (DE)'}
              selectedLanguage={t.businessTripsCosts?.proof || 'Upload Proof'}
              value={expensesData.workRelatedExpenses?.businessTripsCosts?.proof || null}
              onChange={(files) => handleFieldChange('workRelatedExpenses.businessTripsCosts.proof', files)}
              multiple={true}
              accept=".pdf,.jpg,.jpeg,.png"
              maxSize={5}
              hasError={fieldHasError('workRelatedExpenses.businessTripsCosts.proof')}
              validationError={getValidationMessage('workRelatedExpenses.businessTripsCosts.proof')}
            />
          )}
        </div>

        {/* Work Equipment */}
        <div className="border border-gray-100 rounded p-4 space-y-4">
          <h4 className="font-medium text-sm">{germanT?.workEquipment?.title} / {t.workEquipment?.title}</h4>
          
          <FKYesNo
            id="workRelatedExpenses.workEquipment.hasWorkEquipment"
            mainLanguage={germanT?.workEquipment?.hasWorkEquipment || 'Do you have work equipment expenses? (DE)'}
            selectedLanguage={t.workEquipment?.hasWorkEquipment || 'Do you have work equipment expenses?'}
            value={expensesData.workRelatedExpenses?.workEquipment?.hasWorkEquipment}
            onChange={(value) => handleFieldChange('workRelatedExpenses.workEquipment.hasWorkEquipment', value)}
            mandatory={true}
            hasError={fieldHasError('workRelatedExpenses.workEquipment.hasWorkEquipment')}
            validationError={getValidationMessage('workRelatedExpenses.workEquipment.hasWorkEquipment')}
          />

          {expensesData.workRelatedExpenses?.workEquipment?.hasWorkEquipment === true && (
            <FKExpenseArray
              label={`${germanT?.workEquipment?.expenses} / ${t.workEquipment?.expenses}`}
              expenseTypes={t.workEquipment?.expensesTypes || germanT?.workEquipment?.expensesTypes}
              onChange={(expenses) => handleExpenseArrayChange('workRelatedExpenses.workEquipment.expenses', expenses)}
              value={expensesData.workRelatedExpenses?.workEquipment?.expenses || []}
              withFile={true}
              germanT={germanI18nData}
              t={i18nData}
            />
          )}
        </div>

        {/* Home Office */}
        <div className="border border-gray-100 rounded p-4 space-y-4">
          <h4 className="font-medium text-sm">{germanT?.homeOffice?.title} / {t.homeOffice?.title || 'Home Office Allowance'}</h4>
          
          <FKYesNo
            id="workRelatedExpenses.homeOffice.hasHomeOffice"
            mainLanguage={germanT?.homeOffice?.hasHomeOffice || 'Do you have a home office? (DE)'}
            selectedLanguage={t.homeOffice?.hasHomeOffice || 'Do you have a home office?'}
            value={expensesData.workRelatedExpenses?.homeOffice?.hasHomeOffice}
            onChange={(value) => handleFieldChange('workRelatedExpenses.homeOffice.hasHomeOffice', value)}
            mandatory={true}
            hasError={fieldHasError('workRelatedExpenses.homeOffice.hasHomeOffice')}
            validationError={getValidationMessage('workRelatedExpenses.homeOffice.hasHomeOffice')}
          />

          {expensesData.workRelatedExpenses?.homeOffice?.hasHomeOffice === true && (
            <FKInputField
              id="workRelatedExpenses.homeOffice.workingDaysCount"
              type="number"
              mainLanguage={germanT?.homeOffice?.workingDaysCount || 'Number of home office days (230 Max) (DE)'}
              selectedLanguage={t.homeOffice?.workingDaysCount || 'Number of home office days (230 Max)'}
              value={expensesData.workRelatedExpenses?.homeOffice?.workingDaysCount || ''}
              onChange={(e) => handleFieldChange('workRelatedExpenses.homeOffice.workingDaysCount', e.target.value)}
              mandatory={true}
              hasError={fieldHasError('workRelatedExpenses.homeOffice.workingDaysCount')}
              validationError={getValidationMessage('workRelatedExpenses.homeOffice.workingDaysCount')}
              min={0}
            />
          )}
        </div>

        {/* Job Application Costs */}
        <div className="border border-gray-100 rounded p-4 space-y-4">
          <h4 className="font-medium text-sm">{germanT?.applicationCosts?.title} / {t.applicationCosts?.title}</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FKInputField
              id="workRelatedExpenses.applicationCosts.online"
              type="number"
              mainLanguage={germanT?.applicationCosts?.online || 'Number of Online Applications (DE)'}
              selectedLanguage={t.applicationCosts?.online || 'Number of Online Applications'}
              value={expensesData.workRelatedExpenses?.applicationCosts?.online || ''}
              onChange={(e) => handleFieldChange('workRelatedExpenses.applicationCosts.online', e.target.value)}
              hasError={fieldHasError('workRelatedExpenses.applicationCosts.online')}
              validationError={getValidationMessage('workRelatedExpenses.applicationCosts.online')}
              min={0}
            />

            <FKInputField
              id="workRelatedExpenses.applicationCosts.inPerson"
              type="number"
              mainLanguage={germanT?.applicationCosts?.inPerson || 'Number of In-Person Applications (DE)'}
              selectedLanguage={t.applicationCosts?.inPerson || 'Number of In-Person Applications'}
              value={expensesData.workRelatedExpenses?.applicationCosts?.inPerson || ''}
              onChange={(e) => handleFieldChange('workRelatedExpenses.applicationCosts.inPerson', e.target.value)}
              hasError={fieldHasError('workRelatedExpenses.applicationCosts.inPerson')}
              validationError={getValidationMessage('workRelatedExpenses.applicationCosts.inPerson')}
              min={0}
            />
          </div>
        </div>

        {/* Double Household Management */}
        <div className="border border-gray-100 rounded p-4 space-y-4">
          <h4 className="font-medium text-sm">{germanT?.doubleHouseholdMgmt?.title} / {t.doubleHouseholdMgmt?.title}</h4>
          
          <FKYesNo
            id="workRelatedExpenses.hasDoubleHouseholdMgmt"
            mainLanguage={germanT?.hasDoubleHouseholdMgmt || 'Did you have double household management? (DE)'}
            selectedLanguage={t.hasDoubleHouseholdMgmt || 'Did you have double household management?'}
            value={expensesData.workRelatedExpenses?.hasDoubleHouseholdMgmt}
            onChange={(value) => handleFieldChange('workRelatedExpenses.hasDoubleHouseholdMgmt', value)}
            mandatory={true}
            hasError={fieldHasError('workRelatedExpenses.hasDoubleHouseholdMgmt')}
            validationError={getValidationMessage('workRelatedExpenses.hasDoubleHouseholdMgmt')}
          />
        </div>
      </FormSection>
    </div>
  );
};

export default TFWorkRelatedExpenses; 