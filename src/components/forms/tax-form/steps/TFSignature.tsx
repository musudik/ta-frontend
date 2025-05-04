import React from 'react';
import { ValidationErrors } from '../validation';
import { SignaturePad } from '../signature-pad';
import FKInputField from '../../../ui/FKInputField';
import { LanguageCode } from '../constants'; // Assuming constants file exists

interface TFSignatureProps {
  formData: { [key: string]: any };
  handleChange: (section: string, field: string, value: any) => void;
  selectedLanguage: LanguageCode; // Use specific type
  i18nData: any; // Use specific type later
  germanI18nData: any; // Use specific type later
  validationErrors: ValidationErrors | null;
  showValidationErrors: boolean;
}

// Helper component for section styling
const FormSection = ({ title, children }: { title: React.ReactNode, children: React.ReactNode }) => (
  <div className="border border-gray-200 rounded-md p-4 mb-4">
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const TFSignature: React.FC<TFSignatureProps> = ({
  formData,
  handleChange,
  i18nData,
  germanI18nData,
  validationErrors,
  showValidationErrors
}) => {
  const handleFieldChange = (field: string, value: any) => {
    handleChange('signature', field, value);
  };

  // Get translations
  const t = i18nData?.taxForm || {}; // Top level for different sections
  const germanT = germanI18nData?.taxForm || {}; 
  
  // Add safe access to signature and terms objects
  const germanSignature = germanT?.signature || {};
  const tSignature = t?.signature || {};

  const signatureData = formData.signature || {};

  const getErrorKey = (field: string): string | undefined => {
    if (!showValidationErrors || !validationErrors?.signature) {
      return undefined;
    }
    const signatureErrors = validationErrors.signature;
    if (typeof signatureErrors !== 'object' || signatureErrors === null) return undefined;
    const errorKey = signatureErrors[field];
    return typeof errorKey === 'string' ? errorKey : undefined;
  };

  const fieldHasError = (field: string): boolean => {
    return !!getErrorKey(field);
  };

  const getValidationMessage = (field: string): string | undefined => {
    const errorKey = getErrorKey(field);
    if (!errorKey) return undefined;

    // Validation messages might be top-level
    const germanMsg = germanI18nData?.validation?.[errorKey]; 
    const selectedMsg = i18nData?.validation?.[errorKey];

    if (germanMsg && selectedMsg && germanMsg !== selectedMsg) {
      return `${germanMsg} / ${selectedMsg}`;
    }
    return germanMsg || selectedMsg || errorKey;
  };

  return (
    <div className="space-y-6">
      {/* Declaration Section */}
      <FormSection title={<>{germanSignature.title || 'Erklärung (DE)'} / {tSignature.title || 'Declaration'}</>}>
        <div className="space-y-4 border rounded-md p-4 bg-neutral-50">
          {/* German Declaration Text */}
          <h3 className="font-medium text-neutral-900 mb-4">{germanSignature.title || 'Erklärung'}</h3>
          <div className="space-y-3">
            <p className="text-sm text-neutral-700">
              {germanSignature?.consent1 || 'Ich versichere, dass ich die Angaben... (DE)'}
            </p>
            <p className="text-sm text-neutral-700">
               {germanSignature?.consent2 || 'Ich stimme zu, dass meine Daten... (DE)'}
            </p>
          </div>

          {/* Selected Language Declaration Text */}
          <h3 className="font-medium text-neutral-900 mb-4 mt-6">{tSignature.title || 'Declaration'}</h3>
          <div className="space-y-3 text-sm text-neutral-700">
            <p>
              {tSignature?.consent1 || 'I declare that the information provided... '}
            </p>
            <p>
               {tSignature?.consent2 || 'I consent to my data being processed...'}
            </p>
          </div>
        </div>
      </FormSection>

      {/* Place and Date Section */}
      <FormSection title={<>{germanSignature.placeDate || 'Ort und Datum (DE)'} / {tSignature.placeDate || 'Place and Date'}</>}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FKInputField
            id="place"
            mainLanguage={germanSignature.place || 'Ort (DE)'} // Correct pattern
            selectedLanguage={tSignature.place || 'Place'} // Correct pattern
            value={signatureData.place || ''}
            onChange={(e) => handleFieldChange('place', e.target.value)}
            mandatory={true}
            hasError={fieldHasError('place')}
            validationError={getValidationMessage('place')}
          />
          <FKInputField
            id="date"
            type="date"
            mainLanguage={germanSignature.date || 'Datum (DE)'} // Correct pattern
            selectedLanguage={tSignature.date || 'Date'} // Correct pattern
            value={signatureData.date || ''}
            onChange={(e) => handleFieldChange('date', e.target.value)}
            mandatory={true}
            hasError={fieldHasError('date')}
            validationError={getValidationMessage('date')}
          />
        </div>
      </FormSection>
      
      {/* Full Name Field - Added this section */}
      <FormSection title={<>{germanSignature.fullNameTitle || 'Vollständiger Name (DE)'} / {tSignature.fullNameTitle || 'Full Name'}</>}>
        <FKInputField
          id="fullName"
          mainLanguage={germanSignature.fullName || 'Vollständiger Name (DE)'}
          selectedLanguage={tSignature.fullName || 'Full Name'}
          value={signatureData.fullName || ''}
          onChange={(e) => handleFieldChange('fullName', e.target.value)}
          mandatory={true}
          hasError={fieldHasError('fullName')}
          validationError={getValidationMessage('fullName')}
        />
      </FormSection>

      {/* Signature Section */}
      <FormSection title={<>{germanSignature.title || 'Unterschrift (DE)'} / {tSignature.title || 'Signature'}</>}>
        <div className="space-y-4">
           {/* Label for Signature Pad */} 
           <div className="mb-1">
             <label className="block font-medium text-sm text-neutral-900">
               {germanSignature.signature || 'Digitale Unterschrift (DE)'}
             </label>
             <label className="block text-neutral-500 text-sm">
                {tSignature.signature || 'Digital Signature'}
             </label>
          </div>
          <SignaturePad
            onSave={(signatureDataUrl) => {
              handleFieldChange('signature', signatureDataUrl);
              // Auto-confirm signature when saved
              handleFieldChange('confirmSignature', true);
            }}
            initialValue={signatureData.signature || ''}
          />
          {fieldHasError('signature') && (
            <p className="text-red-500 text-sm">
              {getValidationMessage('signature')}
            </p>
          )}
          
          {/* Hidden field for confirmSignature - this avoids validation errors */}
          <input 
            type="hidden" 
            id="confirmSignature" 
            value={signatureData.confirmSignature ? "true" : ""} 
            onChange={() => {}}
          />
          {fieldHasError('confirmSignature') && (
            <p className="text-red-500 text-sm">
              {getValidationMessage('confirmSignature')}
            </p>
          )}
          
          {/* Confirmation message when signature is saved */}
          {signatureData.signature && (
            <div className="p-3 bg-green-50 text-green-700 rounded-md border border-green-200 text-sm">
              {tSignature.signatureConfirmed || 'Your signature has been saved. By providing your signature, you consent to the terms and conditions.'}
            </div>
          )}
        </div>
      </FormSection>
    </div>
  );
};

export default TFSignature; 