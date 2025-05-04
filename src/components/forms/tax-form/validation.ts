// Define the structure for validation errors
export interface ValidationErrors {
  [section: string]: {
    [field: string]: string | { [key: string]: string };
  };
}

// --- Validation Helper Functions ---
const isEmpty = (value: any): boolean => {
  return value === null || value === undefined || String(value).trim() === '';
};

const isValidDate = (value: string): boolean => {
  if (!value) return false;
  const date = new Date(value);
  return date instanceof Date && !isNaN(date.getTime());
};

const isValidEmail = (value: string): boolean => {
  if (!value) return true; // Email is optional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

const isValidPhone = (value: string): boolean => {
  if (!value) return true; // Phone is optional
  const phoneRegex = /^\+?[\d\s-]{8,}$/;
  return phoneRegex.test(value);
};

const isValidTaxId = (value: string): boolean => {
  if (!value) return false;
  // Implement specific tax ID validation logic here
  // For now, just check if it's not empty and has at least 8 characters
  return value.length >= 8;
};

const isValidPostalCode = (value: string): boolean => {
  if (!value) return false;
  // German postal code format: 5 digits
  const postalCodeRegex = /^\d{5}$/;
  return postalCodeRegex.test(value);
};

// Add helper functions for expenses validation
const isValidWorkingDays = (value: number): boolean => {
  return !isNaN(value) && value >= 0 && value <= 230;
};

const isValidAmount = (value: number): boolean => {
  return !isNaN(value) && value >= 0;
};

const isValidAddress = (address: any): boolean => {
  return !isEmpty(address?.street) &&
         !isEmpty(address?.houseNumber) &&
         isValidPostalCode(address?.postalCode) &&
         !isEmpty(address?.city);
};

// --- Main Validation Function ---
export const validateTaxForm = (
  formData: any,
  step: number,
  i18n: any
): ValidationErrors => {
  const errors: ValidationErrors = {};
  const validationMessages = i18n?.validation || {};
  let section: string;

  const setError = (section: string, field: string, messageKey: string) => {
    if (!errors[section]) {
      errors[section] = {};
    }
    if (field.includes('.')) {
      const keys = field.split('.');
      let current = errors[section] as any;
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!current[key]) {
          current[key] = {};
        }
        current = current[key];
      }
      current[keys[keys.length - 1]] = messageKey;
    } else {
      errors[section][field] = messageKey;
    }
  };

  switch (step) {
    case 0: // Tax Year Step
      const ty = formData.taxYear || {};
      section = 'taxYear';

      // Check if tax year is selected
      if (isEmpty(ty.year)) {
        setError(section, 'year', validationMessages?.taxYear?.required || 'Tax year is required');
      }
      break;

    case 1: // Personal Info Step
      const pi = formData.personalInfo || {};
      section = 'personalInfo';

      // Basic Information
      if (isEmpty(pi.firstName)) setError(section, 'firstName', 'required');
      if (isEmpty(pi.lastName)) setError(section, 'lastName', 'required');
      if (!isValidTaxId(pi.taxId)) setError(section, 'taxId', 'invalidTaxId');
      if (!isValidDate(pi.dateOfBirth)) setError(section, 'dateOfBirth', 'invalidDate');
      if (isEmpty(pi.maritalStatus)) setError(section, 'maritalStatus', 'selectionRequired');
      
      // Optional fields with format validation
      if (pi.email && !isValidEmail(pi.email)) setError(section, 'email', 'invalidEmail');
      if (pi.phone && !isValidPhone(pi.phone)) setError(section, 'phone', 'invalidPhone');

      // Address (all fields mandatory)
      if (isEmpty(pi.address?.street)) setError(section, 'address.street', 'required');
      if (isEmpty(pi.address?.houseNumber)) setError(section, 'address.houseNumber', 'required');
      if (!isValidPostalCode(pi.address?.postalCode)) setError(section, 'address.postalCode', 'invalidPostalCode');
      if (isEmpty(pi.address?.city)) setError(section, 'address.city', 'required');

      // Foreign Residence (conditional validation)
      if (pi.hasForeignResidence === undefined) {
        setError(section, 'hasForeignResidence', 'selectionRequired');
      } else if (pi.hasForeignResidence === true) {
        if (isEmpty(pi.foreignResidence?.country)) {
          setError(section, 'foreignResidence.country', 'selectionRequired');
        }
        if (pi.foreignResidence?.country === 'other' && isEmpty(pi.foreignResidence?.otherCountry)) {
          setError(section, 'foreignResidence.otherCountry', 'required');
        }
      }

      // Spouse Information (conditional based on marital status)
      const requiresSpouseInfo = pi.maritalStatus === 'married' || pi.maritalStatus === 'registered_partnership';
      if (requiresSpouseInfo) {
        if (isEmpty(pi.spouse?.firstName)) setError(section, 'spouse.firstName', 'required');
        if (isEmpty(pi.spouse?.lastName)) setError(section, 'spouse.lastName', 'required');
        if (!isValidDate(pi.spouse?.dateOfBirth)) setError(section, 'spouse.dateOfBirth', 'invalidDate');
        if (!isValidTaxId(pi.spouse?.taxId)) setError(section, 'spouse.taxId', 'invalidTaxId');
        
        if (pi.spouse?.hasIncome === undefined) {
          setError(section, 'spouse.hasIncome', 'selectionRequired');
        } else if (pi.spouse?.hasIncome === true) {
          if (isEmpty(pi.spouse?.incomeType)) {
            setError(section, 'spouse.incomeType', 'selectionRequired');
          }
          if (pi.spouse?.jointTaxation === undefined) {
            setError(section, 'spouse.jointTaxation', 'selectionRequired');
          }
        }
      }

      // Children Information (conditional validation)
      if (pi.hasChildren === undefined) {
        setError(section, 'hasChildren', 'selectionRequired');
      } else if (pi.hasChildren === true) {
        // Validate that there is at least one child if hasChildren is true
        if (!Array.isArray(pi.children) || pi.children.length === 0) {
          setError(section, 'children', 'childRequired');
        } else {
          // Validate each child's information
          pi.children.forEach((child: any, index: number) => {
            // First Name validation
            if (isEmpty(child.firstName)) {
              setError(section, `children.${index}.firstName`, 'required');
            }
            
            // Last Name validation
            if (isEmpty(child.lastName)) {
              setError(section, `children.${index}.lastName`, 'required');
            }
            
            // Date of Birth validation
            if (!isValidDate(child.dateOfBirth)) {
              setError(section, `children.${index}.dateOfBirth`, 'invalidDate');
            } else {
              // Additional validation to ensure child's date of birth is not in the future
              const childDob = new Date(child.dateOfBirth);
              const today = new Date();
              if (childDob > today) {
                setError(section, `children.${index}.dateOfBirth`, 'invalidDate');
              }
            }
            
            // Tax ID validation
            if (!isValidTaxId(child.taxId)) {
              setError(section, `children.${index}.taxId`, 'invalidTaxId');
            }
          });
        }
      }

      break;

    case 2: // Income Info Step
      const ii = formData.incomeInfo || {};
      section = 'incomeInfo';

      // Employment Section
      if (ii.employment?.isEmployed === undefined) {
        setError(section, 'employment.isEmployed', 'selectionRequired');
      } else if (ii.employment?.isEmployed === true) {
        // Employer validation
        if (isEmpty(ii.employment?.employer)) {
          setError(section, 'employment.employer', 'required');
        }

        // Employment Income validation
        if (isEmpty(ii.employment?.employmentIncome)) {
          setError(section, 'employment.employmentIncome', 'required');
        } else if (Number(ii.employment?.employmentIncome) < 0) {
          setError(section, 'employment.employmentIncome', 'invalidAmount');
        }

        // Tax Certificate validation
        if (ii.employment?.hasTaxCertificate === undefined) {
          setError(section, 'employment.hasTaxCertificate', 'selectionRequired');
        } else if (ii.employment?.hasTaxCertificate === true) {
          if (!ii.employment?.taxCertificate || !Array.isArray(ii.employment?.taxCertificate) || ii.employment?.taxCertificate.length === 0) {
            setError(section, 'employment.taxCertificate', 'fileRequired');
          }
        }

        // Travel Subsidy validation
        if (ii.employment?.hasTravelSubsidy === undefined) {
          setError(section, 'employment.hasTravelSubsidy', 'selectionRequired');
        } else if (ii.employment?.hasTravelSubsidy === true) {
          if (isEmpty(ii.employment?.travelDistance)) {
            setError(section, 'employment.travelDistance', 'required');
          } else if (Number(ii.employment?.travelDistance) <= 0) {
            setError(section, 'employment.travelDistance', 'invalidDistance');
          }
        }
      }

      // Business Expenses Section
      if (ii.business?.isBusinessOwner === undefined) {
        setError(section, 'business.isBusinessOwner', 'selectionRequired');
      } else if (ii.business?.isBusinessOwner === true) {
        // Business Type validation
        if (isEmpty(ii.business?.businessType)) {
          setError(section, 'business.businessType', 'required');
        }

        // Business Earnings validation
        if (isEmpty(ii.business?.businessEarnings)) {
          setError(section, 'business.businessEarnings', 'required');
        } else if (Number(ii.business?.businessEarnings) < 0) {
          setError(section, 'business.businessEarnings', 'invalidAmount');
        }

        // Business Expenses validation
        if (isEmpty(ii.business?.businessExpenses)) {
          setError(section, 'business.businessExpenses', 'required');
        } else if (Number(ii.business?.businessExpenses) < 0) {
          setError(section, 'business.businessExpenses', 'invalidAmount');
        }
      }
      break;

    case 3: // Rental Income Step
      const ri = formData.incomeInfo || {};
      section = 'incomeInfo';

      // Rental Income Section
      if (ri.hasRentalProperty === undefined) {
        setError(section, 'hasRentalProperty', 'selectionRequired');
      } else if (ri.hasRentalProperty === true) {
        // Rental Income validation
        if (isEmpty(ri.rentalIncome)) {
          setError(section, 'rentalIncome', 'required');
        } else if (!isValidAmount(Number(ri.rentalIncome))) {
          setError(section, 'rentalIncome', 'invalidAmount');
        }

        // Rental Costs validation
        if (isEmpty(ri.rentalCosts)) {
          setError(section, 'rentalCosts', 'required');
        } else if (!isValidAmount(Number(ri.rentalCosts))) {
          setError(section, 'rentalCosts', 'invalidAmount');
        }

        // Rental Property Address validation
        const address = ri.rentalPropertyAddress || {};
        if (isEmpty(address.street)) {
          setError(section, 'rentalPropertyAddress.street', 'required');
        }
        if (isEmpty(address.houseNumber)) {
          setError(section, 'rentalPropertyAddress.houseNumber', 'required');
        }
        if (!isValidPostalCode(address.postalCode)) {
          setError(section, 'rentalPropertyAddress.postalCode', 'invalidPostalCode');
        }
        if (isEmpty(address.city)) {
          setError(section, 'rentalPropertyAddress.city', 'required');
        }
      }
      break;

    case 4: // Foreign Income Step
      const fi = formData.incomeInfo || {};
      section = 'incomeInfo';

      // Foreign Income Section
      if (fi.hasForeignIncome === undefined) {
        setError(section, 'hasForeignIncome', 'selectionRequired');
      } else if (fi.hasForeignIncome === true) {
        // Country validation
        if (isEmpty(fi.foreignIncomeCountry)) {
          setError(section, 'foreignIncomeCountry', 'required');
        }

        // Income Type validation
        if (isEmpty(fi.foreignIncomeType)) {
          setError(section, 'foreignIncomeType', 'required');
        }

        // Foreign Income Amount validation
        if (isEmpty(fi.foreignIncomeAmount)) {
          setError(section, 'foreignIncomeAmount', 'required');
        } else if (!isValidAmount(Number(fi.foreignIncomeAmount))) {
          setError(section, 'foreignIncomeAmount', 'invalidAmount');
        }

        // Foreign Tax Paid validation
        if (isEmpty(fi.foreignIncomeTaxPaid)) {
          setError(section, 'foreignIncomeTaxPaid', 'required');
        } else if (!isValidAmount(Number(fi.foreignIncomeTaxPaid))) {
          setError(section, 'foreignIncomeTaxPaid', 'invalidAmount');
        }

        // Tax Certificate validation
        if (!fi.foreignIncomeTaxCertificateFile || 
            (Array.isArray(fi.foreignIncomeTaxCertificateFile) && fi.foreignIncomeTaxCertificateFile.length === 0)) {
          setError(section, 'foreignIncomeTaxCertificateFile', 'fileRequired');
        }
      }
      break;

    case 5: // Work-Related Expenses Step
      const wrExpenses = formData.expenses || {};
      section = 'expenses';

      // Commuting Expenses validation
      if (wrExpenses.workRelatedExpenses?.commutation?.hasCommutingExpenses === undefined) {
        setError(section, 'workRelatedExpenses.commutation.hasCommutingExpenses', 'selectionRequired');
      } else if (wrExpenses.workRelatedExpenses?.commutation?.hasCommutingExpenses === true) {
        // Working days count validation
        if (isEmpty(wrExpenses.workRelatedExpenses?.commutation?.workingDaysCount)) {
          setError(section, 'workRelatedExpenses.commutation.workingDaysCount', 'required');
        } else if (!isValidWorkingDays(Number(wrExpenses.workRelatedExpenses?.commutation?.workingDaysCount))) {
          setError(section, 'workRelatedExpenses.commutation.workingDaysCount', 'invalidWorkingDays');
        }

        // From Address validation
        if (!isValidAddress(wrExpenses.workRelatedExpenses?.commutation?.route?.from)) {
          setError(section, 'workRelatedExpenses.commutation.route.from', 'invalidAddress');
        }

        // Office Address validation
        if (!isValidAddress(wrExpenses.workRelatedExpenses?.commutation?.route?.firstOfficeAddress)) {
          setError(section, 'workRelatedExpenses.commutation.route.firstOfficeAddress', 'invalidAddress');
        }
      }

      // Business Trips and Training Costs validation
      if (Number(wrExpenses.workRelatedExpenses?.businessTripsCosts?.amount) > 0) {
        if (!wrExpenses.workRelatedExpenses?.businessTripsCosts?.proof ||
            !Array.isArray(wrExpenses.workRelatedExpenses?.businessTripsCosts?.proof) ||
            wrExpenses.workRelatedExpenses?.businessTripsCosts?.proof.length === 0) {
          setError(section, 'workRelatedExpenses.businessTripsCosts.proof', 'fileRequired');
        }
      }

      // Work Equipment validation
      if (wrExpenses.workRelatedExpenses?.workEquipment?.hasWorkEquipment === undefined) {
        setError(section, 'workRelatedExpenses.workEquipment.hasWorkEquipment', 'selectionRequired');
      }

      // Home Office validation
      if (wrExpenses.workRelatedExpenses?.homeOffice?.hasHomeOffice === undefined) {
        setError(section, 'workRelatedExpenses.homeOffice.hasHomeOffice', 'selectionRequired');
      } else if (wrExpenses.workRelatedExpenses?.homeOffice?.hasHomeOffice === true) {
        if (isEmpty(wrExpenses.workRelatedExpenses?.homeOffice?.workingDaysCount)) {
          setError(section, 'workRelatedExpenses.homeOffice.workingDaysCount', 'required');
        } else if (!isValidWorkingDays(Number(wrExpenses.workRelatedExpenses?.homeOffice?.workingDaysCount))) {
          setError(section, 'workRelatedExpenses.homeOffice.workingDaysCount', 'invalidWorkingDays');
        }
      }

      // Job Application Costs validation - no mandatory fields

      // Double Household Management validation
      if (wrExpenses.workRelatedExpenses?.hasDoubleHouseholdMgmt === undefined) {
        setError(section, 'workRelatedExpenses.hasDoubleHouseholdMgmt', 'selectionRequired');
      }
      break;

    case 6: // Special Expenses Step
      const specialExpenses = formData.expenses || {};
      section = 'expenses';

      // Insurance Expenses validation
      if (specialExpenses.specialExpenses?.insurance?.hasInsurance === undefined) {
        setError(section, 'specialExpenses.insurance.hasInsurance', 'selectionRequired');
      }

      // Donations validation
      if (specialExpenses.specialExpenses?.donations?.hasDonations === undefined) {
        setError(section, 'specialExpenses.donations.hasDonations', 'selectionRequired');
      }

      // Professional Development validation
      if (specialExpenses.specialExpenses?.professionalDevelopment?.hasProfessionalDevelopment === undefined) {
        setError(section, 'specialExpenses.professionalDevelopment.hasProfessionalDevelopment', 'selectionRequired');
      }
      break;

    case 7: // Extraordinary Burdens Step
      const extraBurdens = formData.expenses || {};
      section = 'expenses';

      // Medical Expenses validation
      if (extraBurdens.extraordinaryBurdens?.medicalExpenses?.hasMedicalExpenses === undefined) {
        setError(section, 'extraordinaryBurdens.medicalExpenses.hasMedicalExpenses', 'selectionRequired');
      }

      // Care Expenses validation
      if (extraBurdens.extraordinaryBurdens?.careCosts?.hasCareCosts === undefined) {
        setError(section, 'extraordinaryBurdens.careCosts.hasCareCosts', 'selectionRequired');
      }

      // Disability Expenses validation
      if (extraBurdens.extraordinaryBurdens?.disabilityExpenses?.hasDisabilityExpenses === undefined) {
        setError(section, 'extraordinaryBurdens.disabilityExpenses.hasDisabilityExpenses', 'selectionRequired');
      }
      break;

    case 8: // Craftsmen Services Step
      const craftsmenServices = formData.expenses || {};
      section = 'expenses';

      // Craftsmen Services validation
      if (craftsmenServices.craftsmenServices?.hasMaintenancePayments === undefined) {
        setError(section, 'craftsmenServices.hasMaintenancePayments', 'selectionRequired');
      } else if (craftsmenServices.craftsmenServices?.hasMaintenancePayments === true) {
        // Maintenance Recipient validation
        if (isEmpty(craftsmenServices.craftsmenServices?.maintenanceRecipient)) {
          setError(section, 'craftsmenServices.maintenanceRecipient', 'required');
        }

        // Maintenance Amount validation
        if (isEmpty(craftsmenServices.craftsmenServices?.maintenanceAmount)) {
          setError(section, 'craftsmenServices.maintenanceAmount', 'required');
        } else if (!isValidAmount(Number(craftsmenServices.craftsmenServices?.maintenanceAmount))) {
          setError(section, 'craftsmenServices.maintenanceAmount', 'invalidAmount');
        }

        // Invoice validation
        if (!craftsmenServices.craftsmenServices?.invoiceCraftsmenServices || 
            !Array.isArray(craftsmenServices.craftsmenServices?.invoiceCraftsmenServices) || 
            craftsmenServices.craftsmenServices?.invoiceCraftsmenServices.length === 0) {
          setError(section, 'craftsmenServices.invoiceCraftsmenServices', 'fileRequired');
        }
      }
      break;

    case 9: // Business Expenses Step
      const be = formData.businessInfo || {};
      section = 'businessInfo';

      // Business Owner Question
      if (be.isBusinessOwner === undefined) {
        setError(section, 'isBusinessOwner', 'selectionRequired');
      } else if (be.isBusinessOwner === true) {
        // Business Type validation
        if (isEmpty(be.businessType)) {
          setError(section, 'businessType', 'selectionRequired');
        }

        // Business Earnings validation
        if (isEmpty(be.businessEarnings)) {
          setError(section, 'businessEarnings', 'required');
        } else if (!isValidAmount(Number(be.businessEarnings))) {
          setError(section, 'businessEarnings', 'invalidAmount');
        }

        // Business Expenses validation
        if (isEmpty(be.businessExpenses)) {
          setError(section, 'businessExpenses', 'required');
        } else if (!isValidAmount(Number(be.businessExpenses))) {
          setError(section, 'businessExpenses', 'invalidAmount');
        }

        // Business Address validation
        const address = be.businessAddress || {};
        if (isEmpty(address.street)) {
          setError(section, 'businessAddress.street', 'required');
        }
        if (isEmpty(address.houseNumber)) {
          setError(section, 'businessAddress.houseNumber', 'required');
        }
        if (!isValidPostalCode(address.postalCode)) {
          setError(section, 'businessAddress.postalCode', 'invalidPostalCode');
        }
        if (isEmpty(address.city)) {
          setError(section, 'businessAddress.city', 'required');
        }
      }
      break;

    case 10: // Review Step
      // No validation needed for review step
      break;

    case 11: // Signature Step
      const sig = formData.signature || {};
      section = 'signature';

      // Consent validation - removing this requirement
      // if (sig.acceptTerms !== true) {
      //   setError(section, 'acceptTerms', 'required');
      // }

      // Digital Signature validation
      if (isEmpty(sig.fullName)) {
        setError(section, 'fullName', 'required');
      }
      if (isEmpty(sig.date)) {
        setError(section, 'date', 'required');
      } else if (!isValidDate(sig.date)) {
        setError(section, 'date', 'invalidDate');
      }
      if (sig.confirmSignature !== true) {
        setError(section, 'confirmSignature', 'required');
      }

      // Data Protection validation - removing this requirement
      // if (sig.acceptDataProtection !== true) {
      //   setError(section, 'acceptDataProtection', 'required');
      // }
      break;

    default:
      // No validation for unknown step
      break;
  }

  console.log('Validation Errors:', errors);
  return errors;
}; 