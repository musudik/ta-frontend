import React from 'react';
import FKInputField from '../../../ui/FKInputField';
import FKYesNo from '../../../ui/FKYesNo';
import { Button } from '../../../ui/button';
import { ValidationErrors } from '../validation';
import { LanguageCode } from '../constants';
import { Trash2 } from 'lucide-react';

interface TFChildrenProps {
  formData: { [key: string]: any };
  handleChange: (section: string, field: string, value: any) => void;
  selectedLanguage: LanguageCode;
  i18nData: any;
  germanI18nData: any;
  validationErrors: ValidationErrors | null;
  showValidationErrors: boolean;
}

const TFChildren: React.FC<TFChildrenProps> = ({ formData, handleChange, i18nData, germanI18nData, validationErrors, showValidationErrors }) => {

  const handleFieldChange = (field: string, value: any) => {
    handleChange('personalInfo', field, value);
  };

  const t = i18nData?.taxForm?.children || {};
  const germanT = germanI18nData?.taxForm?.children || t;

  const personalInfoData = formData.personalInfo || {};
  const childrenData = personalInfoData.children || [];

  // --- Error Handling Helpers for Children --- 
  const getChildErrorKey = (index: number, field: string): string | undefined => {
    if (
      !showValidationErrors || 
      !validationErrors?.personalInfo?.children || 
      !Array.isArray(validationErrors.personalInfo.children) || 
      !validationErrors.personalInfo.children[index]
    ) {
      return undefined;
    }
    const childErrors = validationErrors.personalInfo.children[index];
    if (typeof childErrors !== 'object' || childErrors === null) return undefined;
    const errorKey = childErrors[field];
    return typeof errorKey === 'string' ? errorKey : undefined;
  };

  const childFieldHasError = (index: number, field: string): boolean => {
    return !!getChildErrorKey(index, field);
  };

  const getChildValidationMessage = (index: number, field: string): string | undefined => {
    const errorKey = getChildErrorKey(index, field);
    if (!errorKey) return undefined;

    const germanMsg = germanI18nData?.validation?.[errorKey];
    const selectedMsg = i18nData?.validation?.[errorKey];

    if (germanMsg && selectedMsg && germanMsg !== selectedMsg) {
      return `${germanMsg} / ${selectedMsg}`;
    }
    return germanMsg || selectedMsg || errorKey;
  };
  // --- End Error Handling Helpers --- 

  const handleChildChange = (index: number, field: string, value: any) => {
    const updatedChildren = [...childrenData];
    if (!updatedChildren[index]) {
      updatedChildren[index] = {}; 
    }
    updatedChildren[index][field] = value;
    handleFieldChange('children', updatedChildren);
  };

  const addChild = () => {
    const newChild = { firstName: '', lastName: '', dateOfBirth: '', taxId: '' };
    handleFieldChange('children', [...childrenData, newChild]);
  };

  const removeChild = (index: number) => {
    const updatedChildren = childrenData.filter((_: any, i: number) => i !== index);
    handleFieldChange('children', updatedChildren);
  };

  return (
    <div className="space-y-4">
      <FKYesNo
        id="hasChildren"
        mainLanguage={germanT.hasChildren || 'Haben Sie Kinder? (DE)'} // Correct pattern
        selectedLanguage={t.hasChildren || 'Do you have children?'} // Correct pattern
        value={personalInfoData.hasChildren}
        onChange={(value) => {
          handleFieldChange('hasChildren', value);
          // Reset children array if answer is no
          if (!value) {
            handleFieldChange('children', []);
          }
        }}
        mandatory={true}
        // Optional: Add validation for the yes/no question itself if needed
        // hasError={fieldHasError('hasChildren')}
        // validationError={getValidationMessage('hasChildren')}
      />

      {personalInfoData.hasChildren && (
        <div className="space-y-4 pt-4 border-t border-gray-200 mt-4">
          {childrenData.map((child: any, index: number) => (
            <div key={index} className="border rounded-md p-4 space-y-3 relative">
              <h4 className="font-semibold text-neutral-700 mb-2">
                 {germanT.child || 'Kind'} {index + 1} / {t.child || 'Child'} {index + 1}
              </h4>
              
              {/* Remove Button */} 
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                onClick={() => removeChild(index)}
                aria-label={`Remove Child ${index + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FKInputField
                  id={`children.${index}.firstName`}
                  mainLanguage={germanT.firstName || 'Vorname (DE)'} // Correct pattern
                  selectedLanguage={t.firstName || 'First Name'} // Correct pattern
                  value={child.firstName || ''}
                  onChange={(e) => handleChildChange(index, 'firstName', e.target.value)}
                  mandatory={true}
                  hasError={childFieldHasError(index, 'firstName')}
                  validationError={getChildValidationMessage(index, 'firstName')}
                />
                <FKInputField
                  id={`children.${index}.lastName`}
                  mainLanguage={germanT.lastName || 'Nachname (DE)'} // Correct pattern
                  selectedLanguage={t.lastName || 'Last Name'} // Correct pattern
                  value={child.lastName || ''}
                  onChange={(e) => handleChildChange(index, 'lastName', e.target.value)}
                  mandatory={true}
                  hasError={childFieldHasError(index, 'lastName')}
                  validationError={getChildValidationMessage(index, 'lastName')}
                />
                <FKInputField
                  id={`children.${index}.dateOfBirth`}
                  type="date"
                  mainLanguage={germanT.dateOfBirth || 'Geburtsdatum (DE)'} // Correct pattern
                  selectedLanguage={t.dateOfBirth || 'Date of Birth'} // Correct pattern
                  value={child.dateOfBirth || ''}
                  onChange={(e) => handleChildChange(index, 'dateOfBirth', e.target.value)}
                  mandatory={true}
                  hasError={childFieldHasError(index, 'dateOfBirth')}
                  validationError={getChildValidationMessage(index, 'dateOfBirth')}
                />
                <FKInputField
                  id={`children.${index}.taxId`}
                  mainLanguage={germanT.taxId || 'Steuer-ID (DE)'} // Correct pattern
                  selectedLanguage={t.taxId || 'Tax ID'} // Correct pattern
                  value={child.taxId || ''}
                  onChange={(e) => handleChildChange(index, 'taxId', e.target.value)}
                  // Tax ID might not always be mandatory for a child
                  mandatory={false} 
                  hasError={childFieldHasError(index, 'taxId')}
                  validationError={getChildValidationMessage(index, 'taxId')}
                />
              </div>
            </div>
          ))}

          <Button onClick={addChild} variant="outline">
             {germanT.addChild || 'Kind hinzufügen'} / {t.addChild || 'Add Child'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default TFChildren; 