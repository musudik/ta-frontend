import React, { useState, useEffect } from 'react';
// Import step components
import TFTaxYear from './steps/TFTaxYear';
import TFPersonalInfo from './steps/TFPersonalInfo';
import TFIncomeInfo from './steps/TFIncomeInfo';
import TFRentalIncome from './steps/TFRentalIncome';
import TFForeignIncome from './steps/TFForeignIncome';
// Replace TFExpenses with the new split components
import TFWorkRelatedExpenses from './steps/TFWorkRelatedExpenses';
import TFSpecialExpenses from './steps/TFSpecialExpenses';
import TFExtraordinaryBurdens from './steps/TFExtraordinaryBurdens';
import TFCraftsmenServices from './steps/TFCraftsmenServices';
import TFBusinessExpenses from './steps/TFBusinessExpenses';
import TFReview from './steps/TFReview';
import TFSignature from './steps/TFSignature';
import { validateTaxForm, ValidationErrors } from './validation'; // Import validation
import { useAuth } from '../../../hooks/useAuth'; // Import the auth hook

// Define a more specific type for form data later
interface TaxFormData {
  taxYear?: any; // Define specific structure later
  personalInfo?: any; // Define specific structure later
  incomeInfo?: any;
  // ... other sections
  [key: string]: any; // Allow other top-level keys for now
}

// Define structure for language JSON files
interface LanguageData {
  taxForm: { // Assuming top-level key matches the folder/content
    personalInfo: any; // Define specific structure later
    incomeInfo: any;
    expenses: any;
    // ... other sections
    [key: string]: any; // Allow indexing by string keys for steps
  };
}

// Extend LanguageData for the form title
interface AppLanguageData extends LanguageData {
  formTitle: string;
}

// Initial empty form data
const initialTaxFormData: TaxFormData = {
  taxYear: {}, // Initialize tax year section
  personalInfo: {}, // Initialize sections to prevent errors
  incomeInfo: {},
  expenses: {},
  // ... other sections
};

// Reusable FormTemplate component (assuming similar styling needs)
const FormTemplate = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative w-full max-w-3xl mx-auto bg-white p-4 md:p-6 rounded-lg shadow-sm border border-neutral-200">
      {children}
    </div>
  );
};

// Reusable Button component (assuming similar styling needs)
const Button = ({
  children,
  onClick,
  type = "button",
  className = "",
  disabled = false
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-md transition-colors ${className}`}
    >
      {children}
    </button>
  );
};

const TaxFormBase: React.FC = () => {
  const [formData, setFormData] = useState<TaxFormData>(initialTaxFormData);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'es' | 'fr' | 'it'>('en');
  const [i18nData, setI18nData] = useState<AppLanguageData | null>(null);
  const [germanI18nData, setGermanI18nData] = useState<AppLanguageData | null>(null);
  const [loadingLang, setLoadingLang] = useState(true);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors | null>(null);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const { user } = useAuth(); // Extract user from auth store

  // Define steps with actual components - update with the new split steps
  const steps = [
    { name: 'Tax Year', component: TFTaxYear, key: 'taxYear' },
    { name: 'Personal Info', component: TFPersonalInfo, key: 'personalInfo' },
    { name: 'Income Info', component: TFIncomeInfo, key: 'incomeInfo' },
    { name: 'Rental Income', component: TFRentalIncome, key: 'rentalIncome' },
    { name: 'Foreign Income', component: TFForeignIncome, key: 'foreignIncome' },
    { name: 'Work-Related Expenses', component: TFWorkRelatedExpenses, key: 'workRelatedExpenses' },
    { name: 'Special Expenses', component: TFSpecialExpenses, key: 'specialExpenses' },
    { name: 'Extraordinary Burdens', component: TFExtraordinaryBurdens, key: 'extraordinaryBurdens' },
    { name: 'Craftsmen Services', component: TFCraftsmenServices, key: 'craftsmenServices' },
    { name: 'Business Expenses', component: TFBusinessExpenses, key: 'businessExpenses' },
    { name: 'Review', component: TFReview, key: 'review' },
    { name: 'Signature', component: TFSignature, key: 'signature' }
  ];

  // Effect to load language files dynamically
  useEffect(() => {
    const loadLanguage = async () => {
      setLoadingLang(true);
      try {
        // Use the i18n helper instead of dynamic imports
        const { getTranslation } = await import('./i18n');
        setI18nData(getTranslation(selectedLanguage));

        // Always load German for the main labels
        if (!germanI18nData) {
          setGermanI18nData(getTranslation('de'));
        }
      } catch (error) {
        console.error(`Failed to load language file: ${selectedLanguage}`, error);
        // Fallback or default language loading logic if needed
        if (!i18nData) { // Load English as fallback if primary fails
            try {
                const { getTranslation } = await import('./i18n');
                setI18nData(getTranslation('en'));
            } catch (fallbackError) {
                 console.error('Failed to load fallback language file: en', fallbackError);
            }
        }
      } finally {
        setLoadingLang(false);
      }
    };

    loadLanguage();
  }, [selectedLanguage, germanI18nData]); // Rerun when language changes or German data isn't loaded

  // Updated handleChange to handle nested fields
  const handleChange = (section: keyof TaxFormData, field: string, value: any) => {
    console.log('handleChange:', { section, field, value }); // Debug log
    setFormData(prevData => {
      // Create a new object without using JSON.stringify
      const newData = { ...prevData };
      
      // Ensure the section exists
      if (!newData[section]) {
        newData[section] = {};
      }

      // Handle nested fields (e.g., address.street)
      if (field.includes('.')) {
        const keys = field.split('.');
        let currentLevel = { ...newData[section] };
        const sectionCopy = currentLevel;

        for (let i = 0; i < keys.length - 1; i++) {
          const key = keys[i];
          if (!currentLevel[key]) {
            currentLevel[key] = {};
          }
          currentLevel[key] = { ...currentLevel[key] };
          currentLevel = currentLevel[key];
        }
        currentLevel[keys[keys.length - 1]] = value;
        newData[section] = sectionCopy;
      } else {
        // Handle direct fields within the section
        newData[section] = {
          ...newData[section],
          [field]: value
        };
      }

      console.log('New formData:', newData); // Debug log
      return newData;
    });
  };

  // Handle next button click - with validation
  const handleNext = () => {
    if (!i18nData) return; // Don't validate if translations aren't loaded

    // Validate current step
    const errors = validateTaxForm(formData, currentStep, i18nData);
    setValidationErrors(errors);
    setShowValidationErrors(true); // Always show errors when Next is clicked

    // Check if there are any errors for the current step
    const hasErrors = Object.keys(errors).length > 0;
    console.log('Step Validation:', { currentStep, hasErrors, errors });

    if (!hasErrors) {
      // Move to next step only if no errors
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
        setShowValidationErrors(false); // Hide errors for the new step
        setValidationErrors(null);
      }
    } else {
      // Optionally, scroll to the first error or provide other feedback
      console.log("Validation failed, staying on step", currentStep);
    }
  };

  // Handle previous button click
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setShowValidationErrors(false); // Reset validation display
      setValidationErrors(null);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    console.log('Attempting form submission...', formData);
    
    // Re-validate the entire form or at least the signature step before final submission
    const errors = validateTaxForm(formData, currentStep, i18nData);
    setValidationErrors(errors);
    setShowValidationErrors(true);

    const hasErrors = Object.keys(errors).length > 0;
    console.log('Final Validation:', { hasErrors, errors });

    if (hasErrors) {
      console.log("Submission prevented due to validation errors.");
      // Maybe show a general error message to the user
      return; // Stop submission if errors exist
    }

    try {
      // Prepare the data to match the CreateTaxFormDto structure
      const applicationId = formData.personalInfo?.applicationId || `TAX-${Date.now()}`;
      
      // Build signature with placeAndDate if both exist
      let signature = formData.signature || {};
      if (formData.placeAndDate) {
        signature = {
          ...signature,
          placeAndDate: formData.placeAndDate
        };
      }
      
      // Create expenses object to match the backend structure
      const expenses = {
        workRelatedExpenses: formData.workRelatedExpenses || formData.expenses?.workRelatedExpenses || {},
        specialExpenses: formData.specialExpenses || formData.expenses?.specialExpenses || {},
        extraordinaryBurdens: formData.extraordinaryBurdens || formData.expenses?.extraordinaryBurdens || {},
        craftsmenServices: formData.craftsmenServices || formData.expenses?.craftsmenServices || {}
      };

      // Upload files to Firebase and update URLs - show loading state
      console.log("Uploading files to Firebase...");
      alert('Please wait while we process your files...');
      
      // Extract user's full name for file organization
      const fullName = `${formData.personalInfo?.firstName || 'User'} ${formData.personalInfo?.lastName || ''}`;

      try {
        // Upload all files to Firebase
        // Use dynamic import to avoid circular dependencies
        const { uploadFilesToFirebase, generateTaxFormPdf } = await import('../../../lib/generateTaxFormPdf');
        
        // Create deep copy of the formData for processing
        const formDataWithExpenses = {
          ...formData,
          expenses: expenses
        };
        
        // Upload files and get updated form data with Firebase URLs
        const updatedFormData = await uploadFilesToFirebase(formDataWithExpenses, fullName);
        console.log("Files uploaded and URLs updated:", updatedFormData);
        
        // Generate the PDF
        console.log("Generating PDF...");
        const pdfUrl = await generateTaxFormPdf(updatedFormData, germanI18nData, i18nData);
        console.log("PDF generated and uploaded:", pdfUrl);
        
        // Prepare the final data for submission to backend
        const submissionData = {
          applicationId,
          userId: user?.id,
          taxYear: updatedFormData.taxYear || {},
          personalInfo: updatedFormData.personalInfo || {},
          incomeInfo: updatedFormData.incomeInfo || {},
          rentalIncome: updatedFormData.rentalIncome || {},
          foreignIncome: updatedFormData.foreignIncome || {},
          expenses: updatedFormData.expenses || {},
          workRelatedExpenses: updatedFormData.workRelatedExpenses || updatedFormData.expenses?.workRelatedExpenses || {},
          specialExpenses: updatedFormData.specialExpenses || updatedFormData.expenses?.specialExpenses || {},
          extraordinaryBurdens: updatedFormData.extraordinaryBurdens || updatedFormData.expenses?.extraordinaryBurdens || {},
          craftsmenServices: updatedFormData.craftsmenServices || updatedFormData.expenses?.craftsmenServices || {},
          businessExpenses: updatedFormData.businessExpenses || {},
          businessInfo: updatedFormData.businessInfo || {},
          signature: signature,
          language: selectedLanguage,
          pdfSummaryUrl: pdfUrl
        };
        
        console.log('Submitting data to backend with file URLs:', submissionData);
        
        const apiUrl = import.meta.env.VITE_API_URL || 'https://tax-adviser-test.replit.app/api';
        const response = await fetch(`${apiUrl}/tax-forms`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submissionData),
        });
        
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('Submission successful:', result);
        alert('Tax form submitted successfully!');
        
      } catch (error) {
        console.error("Error processing files or generating PDF:", error);
        alert('There was an issue processing your files. Please try again or contact support.');
      }
      
    } catch (submissionError) {
      console.error("Error submitting to backend:", submissionError);
      alert('Failed to submit tax form. Please try again or contact support.');
    }
  };

  // Handle language change
  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLanguage(event.target.value as 'en' | 'es' | 'fr' | 'it');
  };

  // Render current step
  const renderStep = () => {
    if (loadingLang || !i18nData || !germanI18nData) {
      return <div>Loading language...</div>; // Loading indicator
    }

    const StepComponent = steps[currentStep].component;
    const stepKey = steps[currentStep].key; // Get the key for translations

    // Extract specific translations for the current step
    // Use optional chaining and provide empty objects as fallbacks
    const germanT_form = germanI18nData?.taxForm?.[stepKey] || {};
    const t = i18nData?.taxForm?.[stepKey] || {};

    return (
      <StepComponent
        formData={formData}
        handleChange={handleChange}
        selectedLanguage={selectedLanguage}
        // Pass the full objects for potential top-level access if needed (e.g., in Review)
        i18nData={i18nData}
        germanI18nData={germanI18nData}
        // Pass the specific step translations with the expected prop names
        germanT={germanT_form} // Prop name expected by step components
        selectedT={t}         // Prop name expected by step components
        validationErrors={validationErrors} // Pass errors
        showValidationErrors={showValidationErrors} // Pass flag
      />
    );
  };

  // Updated language options with flags
  const languageOptions = [
    { value: 'en', label: '🇬🇧 English' },
    { value: 'es', label: '🇪🇸 Español' },
    { value: 'fr', label: '🇫🇷 Français' },
    { value: 'it', label: '🇮🇹 Italiano' },
  ];

  return (
    <div className="min-h-screen bg-neutral-100 py-8 px-4">
      {/* Main Form Title */}
      <h1 className="text-2xl md:text-3xl font-bold text-center text-neutral-800 mb-2">
        {/* Display German first, then selected language */}
        {germanI18nData?.formTitle || 'Deutsche Steuererklärung'}
      </h1>
      <h2 className="text-md md:text-lg text-center text-neutral-600 mb-8">
        {i18nData?.formTitle || 'German Tax Return'}
      </h2>

      <FormTemplate>
        {/* Language Selector - Positioned Top Right */}
        {/* Using absolute positioning relative to FormTemplate */}
        {/* FormTemplate needs `relative` class if not already present */}
        <div className="absolute top-4 right-4 md:top-6 md:right-6 z-10"> {/* Added z-index */}
          <select
            value={selectedLanguage}
            onChange={handleLanguageChange}
            className="px-3 py-1.5 border rounded-md bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm"
            aria-label="Select Language"
          >
            {languageOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label} {/* Emojis included here */}
              </option>
            ))}
          </select>
        </div>

        {/* Progress Bar - Added pt-12 to account for absolute positioned dropdown */}
        <div className="mb-6 pt-12 md:pt-8">
          <div className="flex justify-between w-full mb-2">
            <span className="text-sm font-medium text-neutral-700">
              Step {currentStep + 1} of {steps.length} - {steps[currentStep].name}
            </span>
            <span className="text-sm text-neutral-500">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Render Current Step */}
        <div className="min-h-[300px]">
          {renderStep()}
        </div>

        {/* Navigation Buttons - Added responsive classes */}
        <div className="flex flex-col-reverse md:flex-row justify-between items-center mt-6 w-full space-y-4 md:space-y-0">
          {/* Back Button container */}
          <div className={`w-full md:w-auto ${currentStep === 0 ? 'invisible' : ''}`}>
            {currentStep > 0 && (
              <Button
                onClick={handlePrevious}
                className="auth-btn-secondary w-full md:w-auto"
                type="button"
              >
                Back
              </Button>
            )}
          </div>

          {/* Next/Submit Button container */}
          <div className="w-full md:w-auto">
            {currentStep === steps.length - 1 ? (
              <Button
                onClick={handleSubmit}
                className="auth-btn w-full md:w-auto"
                type="submit"
              >
                Submit
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="auth-btn w-full md:w-auto"
                type="button"
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </FormTemplate>
    </div>
  );
};

export default TaxFormBase; 