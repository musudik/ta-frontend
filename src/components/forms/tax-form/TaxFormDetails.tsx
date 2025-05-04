import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TaxFormResponse } from '../../../types/taxForm';
import taxFormService from '../../../services/taxForm.service';
import { toast } from 'sonner';
import { generateTaxFormPdf } from '../../../lib/generateTaxFormPdf';

// Helper component for section styling
const FormSection = ({ title, children }: { title: React.ReactNode, children: React.ReactNode }) => (
  <div className="border border-gray-200 rounded-md p-4 mb-4">
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
      {children}
    </div>
  </div>
);

// Helper for Subheadings within a FormSection
const SubHeading = ({ text }: { text: string }) => (
  <h4 className="md:col-span-2 font-semibold text-md text-neutral-700 mt-4 pt-4 border-t">
    {text}
  </h4>
);

// Helper component for displaying a row of data
const DataRow = ({ label, value }: { label: string, value: React.ReactNode }) => (
  <div className="col-span-1 mb-2">
    <div className="font-bold text-sm text-neutral-800">{label}</div>
    <div className="text-base text-neutral-900">{value || '-'}</div>
  </div>
);

// Helper for displaying files/documents with download links
const FileDisplay = ({ label, value, fileType }: { label: string, value: string, fileType: string }) => {
  const downloadFile = () => {
    if (!value) return;
    
    // Extract filename from URL if available
    const filename = value.split('/').pop() || `${fileType.replace(/\s+/g, '_')}.pdf`;
    
    // Open the file in a new tab for now
    // In production, we'd implement proper download handling
    window.open(value, '_blank');
    
    toast.success(`Downloading ${filename}`);
  };
  
  return (
    <div className="md:col-span-2 mb-4 p-3 border border-gray-200 rounded-md bg-gray-50">
      <div className="font-bold text-sm text-neutral-800 mb-1">{label}</div>
      <div className="text-base text-neutral-900">
        {value ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
              </svg>
              <span className="truncate max-w-xs">{value.split('/').pop() || fileType}</span>
            </div>
            <button 
              onClick={downloadFile}
              className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 text-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
          </div>
        ) : (
          <span className="text-neutral-500">No file uploaded</span>
        )}
      </div>
    </div>
  );
};

const TaxFormDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<TaxFormResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchFormData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const data = await taxFormService.getFormById(id);
        console.log('Tax form details:', data);
        setFormData(data);
      } catch (err) {
        console.error('Error fetching tax form details:', err);
        setError('Failed to load tax form details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFormData();
  }, [id]);
  
  const handleBack = () => {
    navigate('/dashboard/client');
  };
  
  // Handle printing using the existing generateTaxFormPdf function
  const handlePrintForm = async () => {
    if (!formData) return;
    
    try {
      setIsPrinting(true);
      toast.info('Generating PDF document...');
      
      // We don't have the i18n data here, so we'll pass null
      // The generateTaxFormPdf function handles this case
      await generateTaxFormPdf(formData, null, null);
      
      toast.success('PDF generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsPrinting(false);
    }
  };
  
  // Format boolean values
  const formatBoolean = (value: boolean | undefined | null): string => {
    if (value === undefined || value === null) return 'No';
    return value ? 'Yes' : 'No';
  };

  // Format currency values
  const formatCurrency = (value: number | string | undefined | null): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (numValue === undefined || numValue === null || isNaN(numValue)) return '-';
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(numValue);
  };
  
  // Format date values
  const formatDate = (dateString: string | undefined | null): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-neutral-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg text-neutral-700">Loading tax form details...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-neutral-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Form</h2>
          <p className="text-neutral-700 mb-4">{error}</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  if (!formData) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-neutral-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <div className="text-yellow-500 text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold text-neutral-800 mb-2">Form Not Found</h2>
          <p className="text-neutral-700 mb-4">We couldn't find the tax form you're looking for.</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  // Extract data from form sections with safety checks
  const taxYear = formData.taxYear || {};
  const personalInfo = formData.personalInfo || {};
  const incomeInfo = formData.incomeInfo || {};
  const workRelatedExpenses = formData.workRelatedExpenses || {};
  const specialExpenses = formData.specialExpenses || {};
  const extraordinaryBurdens = formData.extraordinaryBurdens || {};
  const craftsmenServices = formData.craftsmenServices || {};
  const businessExpenses = formData.businessExpenses || {};
  const businessInfo = formData.businessInfo || {};
  const signature = formData.signature || {};
  const expenses = formData.expenses || {};
  
  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header with application info */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-neutral-200">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-neutral-800 mb-1">Tax Form Details</h1>
              <p className="text-neutral-600">Application ID: {formData.applicationId}</p>
            </div>
            <div className="flex flex-col items-end">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                formData.status === 'submitted' ? 'bg-green-100 text-green-800' :
                formData.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                formData.status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {formData.status?.charAt(0).toUpperCase() + formData.status?.slice(1) || 'Unknown Status'}
              </span>
              <p className="text-sm text-neutral-500 mt-1">
                Submitted: {formatDate(formData.submittedAt)}
              </p>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-md hover:bg-neutral-200 mr-2"
            >
              Back to Dashboard
            </button>
            <button 
              onClick={handlePrintForm}
              disabled={isPrinting}
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 flex items-center"
            >
              {isPrinting ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating PDF...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Form
                </>
              )}
            </button>
          </div>
        </div>
      
        {/* Form Sections */}
        <div className="space-y-6 bg-white p-6 rounded-lg shadow-md border border-neutral-200">
          {/* Tax Year Section */}
          <FormSection title="Tax Year">
            <DataRow label="Tax Year" value={taxYear.year} />
          </FormSection>

          {/* Personal Information Section */}
          <FormSection title="Personal Information">
            <DataRow label="First Name" value={personalInfo.firstName} />
            <DataRow label="Last Name" value={personalInfo.lastName} />
            <DataRow label="Tax ID" value={personalInfo.taxId} />
            <DataRow label="Date of Birth" value={formatDate(personalInfo.dateOfBirth)} />
            <DataRow label="Email" value={personalInfo.email} />
            <DataRow label="Phone" value={personalInfo.phone} />
            <DataRow label="Marital Status" value={personalInfo.maritalStatus} />
            <DataRow label="Has Foreign Residence" value={formatBoolean(personalInfo.hasForeignResidence)} />
            
            {personalInfo.hasForeignResidence && personalInfo.foreignResidence && (
              <DataRow label="Foreign Residence Country" value={personalInfo.foreignResidence.country} />
            )}

            {/* Address Sub-Section */}
            <SubHeading text="Address" />
            <DataRow label="Street" value={personalInfo.address?.street} />
            <DataRow label="House Number" value={personalInfo.address?.houseNumber} />
            <DataRow label="Postal Code" value={personalInfo.address?.postalCode} />
            <DataRow label="City" value={personalInfo.address?.city} />

            {/* Spouse Information */}
            {personalInfo.hasSpouse && personalInfo.spouse && (
              <>
                <SubHeading text="Spouse Information" />
                <DataRow label="First Name" value={personalInfo.spouse.firstName} />
                <DataRow label="Last Name" value={personalInfo.spouse.lastName} />
                <DataRow label="Date of Birth" value={formatDate(personalInfo.spouse.dateOfBirth)} />
                <DataRow label="Tax ID" value={personalInfo.spouse.taxId} />
                <DataRow label="Has Income" value={formatBoolean(personalInfo.spouse.hasIncome)} />
                <DataRow label="Income Type" value={personalInfo.spouse.incomeType} />
                <DataRow label="Joint Taxation" value={formatBoolean(personalInfo.spouse.jointTaxation)} />
              </>
            )}

            {/* Children Information */}
            {personalInfo.hasChildren && personalInfo.children && personalInfo.children.length > 0 && (
              <>
                <SubHeading text="Children Information" />
                {personalInfo.children.map((child: any, index: number) => (
                  <React.Fragment key={index}>
                    {index > 0 && <div className="md:col-span-2 my-2 border-t border-gray-100"></div>}
                    <DataRow label={`Child ${index + 1} First Name`} value={child.firstName} />
                    <DataRow label={`Child ${index + 1} Last Name`} value={child.lastName} />
                    <DataRow label={`Child ${index + 1} Date of Birth`} value={formatDate(child.dateOfBirth)} />
                    <DataRow label={`Child ${index + 1} Tax ID`} value={child.taxId} />
                  </React.Fragment>
                ))}
              </>
            )}
          </FormSection>

          {/* Income Information Section */}
          <FormSection title="Income Information">
            {/* Employment Info */}
            {incomeInfo.employment && (
              <>
                <SubHeading text="Employment Information" />
                <DataRow label="Is Employed" value={formatBoolean(incomeInfo.employment.isEmployed)} />
                {incomeInfo.employment.isEmployed && (
                  <>
                    <DataRow label="Employer" value={incomeInfo.employment.employer} />
                    <DataRow label="Employment Income" value={formatCurrency(incomeInfo.employment.employmentIncome)} />
                    <DataRow label="Has Tax Certificate" value={formatBoolean(incomeInfo.employment.hasTaxCertificate)} />
                    <DataRow label="Has Travel Subsidy" value={formatBoolean(incomeInfo.employment.hasTravelSubsidy)} />
                    <DataRow label="Travel Distance (km)" value={incomeInfo.employment.travelDistance} />
                    
                    {incomeInfo.employment.hasTaxCertificate && incomeInfo.employment.taxCertificate && incomeInfo.employment.taxCertificate.length > 0 && (
                      <FileDisplay 
                        label="Tax Certificate" 
                        value={incomeInfo.employment.taxCertificate[0]?.url || ''} 
                        fileType="Tax Certificate" 
                      />
                    )}
                  </>
                )}
              </>
            )}

            {/* Business info */}
            {incomeInfo.business && (
              <>
                <SubHeading text="Business Information" />
                <DataRow label="Is Business Owner" value={formatBoolean(incomeInfo.business.isBusinessOwner)} />
              </>
            )}

            {/* Investments info */}
            {incomeInfo.investments && (
              <>
                <SubHeading text="Investment Income" />
                <DataRow label="Has Stock Income" value={formatBoolean(incomeInfo.investments.hasStockIncome)} />
              </>
            )}

            {/* Rental Property */}
            {incomeInfo.hasRentalProperty && (
              <>
                <SubHeading text="Rental Property" />
                <DataRow label="Has Rental Property" value={formatBoolean(incomeInfo.hasRentalProperty)} />
                <DataRow label="Rental Income" value={formatCurrency(incomeInfo.rentalIncome)} />
                <DataRow label="Rental Costs" value={formatCurrency(incomeInfo.rentalCosts)} />
                
                {incomeInfo.rentalPropertyAddress && (
                  <>
                    <DataRow label="Rental Street" value={incomeInfo.rentalPropertyAddress.street} />
                    <DataRow label="Rental House Number" value={incomeInfo.rentalPropertyAddress.houseNumber} />
                    <DataRow label="Rental Postal Code" value={incomeInfo.rentalPropertyAddress.postalCode} />
                    <DataRow label="Rental City" value={incomeInfo.rentalPropertyAddress.city} />
                  </>
                )}
              </>
            )}

            {/* Foreign Income */}
            {incomeInfo.hasForeignIncome && (
              <>
                <SubHeading text="Foreign Income" />
                <DataRow label="Has Foreign Income" value={formatBoolean(incomeInfo.hasForeignIncome)} />
                <DataRow label="Foreign Country" value={incomeInfo.foreignIncomeCountry} />
                {incomeInfo.foreignIncomeOtherCountry && (
                  <DataRow label="Other Foreign Country" value={incomeInfo.foreignIncomeOtherCountry} />
                )}
                <DataRow label="Foreign Income Type" value={incomeInfo.foreignIncomeType} />
                <DataRow label="Foreign Income Amount" value={formatCurrency(incomeInfo.foreignIncomeAmount)} />
                <DataRow label="Foreign Tax Paid" value={formatCurrency(incomeInfo.foreignIncomeTaxPaid)} />
                
                {incomeInfo.foreignIncomeTaxCertificateFile && incomeInfo.foreignIncomeTaxCertificateFile.length > 0 && (
                  <FileDisplay 
                    label="Foreign Income Tax Certificate" 
                    value={incomeInfo.foreignIncomeTaxCertificateFile[0]?.url || ''} 
                    fileType="Foreign Income Tax Certificate" 
                  />
                )}
              </>
            )}
          </FormSection>

          {/* Work-Related Expenses Section */}
          {(Object.keys(workRelatedExpenses).length > 0 || (expenses && Object.keys(expenses.workRelatedExpenses || {}).length > 0)) && (
            <FormSection title="Work-Related Expenses">
              {/* Use either the top-level workRelatedExpenses or the one nested under expenses */}
              {(() => {
                const workExpenses = workRelatedExpenses || expenses.workRelatedExpenses || {};
                
                return (
                  <>
                    {/* Commutation */}
                    {workExpenses.commutation && (
                      <>
                        <SubHeading text="Commuting Expenses" />
                        <DataRow label="Has Commuting Expenses" value={formatBoolean(workExpenses.commutation.hasCommutingExpenses)} />
                        
                        {workExpenses.commutation.hasCommutingExpenses && (
                          <>
                            <DataRow label="Working Days Count" value={workExpenses.commutation.workingDaysCount} />
                            
                            {workExpenses.commutation.route && (
                              <>
                                <SubHeading text="Commuting Route" />
                                {workExpenses.commutation.route.from && (
                                  <>
                                    <DataRow label="Home Address Street" value={workExpenses.commutation.route.from.street} />
                                    <DataRow label="Home Address House Number" value={workExpenses.commutation.route.from.houseNumber} />
                                    <DataRow label="Home Address Postal Code" value={workExpenses.commutation.route.from.postalCode} />
                                    <DataRow label="Home Address City" value={workExpenses.commutation.route.from.city} />
                                  </>
                                )}
                                
                                {workExpenses.commutation.route.firstOfficeAddress && (
                                  <>
                                    <DataRow label="Office Address Street" value={workExpenses.commutation.route.firstOfficeAddress.street} />
                                    <DataRow label="Office Address House Number" value={workExpenses.commutation.route.firstOfficeAddress.houseNumber} />
                                    <DataRow label="Office Address Postal Code" value={workExpenses.commutation.route.firstOfficeAddress.postalCode} />
                                    <DataRow label="Office Address City" value={workExpenses.commutation.route.firstOfficeAddress.city} />
                                  </>
                                )}
                              </>
                            )}
                          </>
                        )}
                      </>
                    )}
                    
                    {/* Business Trips */}
                    {workExpenses.businessTripsCosts && (
                      <>
                        <SubHeading text="Business Trip Costs" />
                        <DataRow label="Amount" value={formatCurrency(workExpenses.businessTripsCosts.amount)} />
                        
                        {workExpenses.businessTripsCosts.proof && workExpenses.businessTripsCosts.proof.length > 0 && (
                          <FileDisplay 
                            label="Business Trips Proof" 
                            value={workExpenses.businessTripsCosts.proof[0]?.url || ''} 
                            fileType="Business Trips Proof" 
                          />
                        )}
                      </>
                    )}
                    
                    {/* Work Equipment */}
                    {workExpenses.workEquipment && workExpenses.workEquipment.hasWorkEquipment && (
                      <>
                        <SubHeading text="Work Equipment" />
                        <DataRow label="Has Work Equipment" value={formatBoolean(workExpenses.workEquipment.hasWorkEquipment)} />
                        
                        {workExpenses.workEquipment.expenses && workExpenses.workEquipment.expenses.length > 0 && (
                          <>
                            {workExpenses.workEquipment.expenses.map((item: any, index: number) => (
                              <React.Fragment key={item.id || index}>
                                <SubHeading text={`Equipment ${index + 1}: ${item.description || 'Work Equipment'}`} />
                                <DataRow label="Type" value={item.type} />
                                <DataRow label="Amount" value={formatCurrency(item.amount)} />
                                
                                {item.file && item.file.length > 0 && (
                                  <FileDisplay 
                                    label={`Receipt for ${item.description || 'Work Equipment'}`} 
                                    value={item.file[0]?.url || ''} 
                                    fileType={`Work Equipment ${index + 1}`} 
                                  />
                                )}
                              </React.Fragment>
                            ))}
                          </>
                        )}
                      </>
                    )}
                    
                    {/* Home Office */}
                    {workExpenses.homeOffice && (
                      <>
                        <SubHeading text="Home Office" />
                        <DataRow label="Has Home Office" value={formatBoolean(workExpenses.homeOffice.hasHomeOffice)} />
                        
                        {workExpenses.homeOffice.hasHomeOffice && (
                          <DataRow label="Working Days Count" value={workExpenses.homeOffice.workingDaysCount} />
                        )}
                      </>
                    )}
                    
                    {/* Application Costs */}
                    {workExpenses.applicationCosts && (
                      <>
                        <SubHeading text="Application Costs" />
                        <DataRow label="Online Applications" value={formatCurrency(workExpenses.applicationCosts.online)} />
                        <DataRow label="In-Person Applications" value={formatCurrency(workExpenses.applicationCosts.inPerson)} />
                      </>
                    )}
                    
                    {/* Double Household Management */}
                    <DataRow label="Has Double Household Management" value={formatBoolean(workExpenses.hasDoubleHouseholdMgmt)} />
                  </>
                );
              })()}
            </FormSection>
          )}

          {/* Special Expenses Section */}
          {(Object.keys(specialExpenses).length > 0 || (expenses && Object.keys(expenses.specialExpenses || {}).length > 0)) && (
            <FormSection title="Special Expenses">
              {(() => {
                const specExpenses = specialExpenses || expenses.specialExpenses || {};
                
                return (
                  <>
                    {/* Insurance */}
                    {specExpenses.insurance && (
                      <>
                        <SubHeading text="Insurance" />
                        <DataRow label="Has Insurance" value={formatBoolean(specExpenses.insurance.hasInsurance)} />
                        
                        {specExpenses.insurance.hasInsurance && specExpenses.insurance.expenses && specExpenses.insurance.expenses.length > 0 && (
                          <>
                            {specExpenses.insurance.expenses.map((item: any, index: number) => (
                              <React.Fragment key={item.id || index}>
                                <SubHeading text={`Insurance ${index + 1}: ${item.description || 'Insurance'}`} />
                                <DataRow label="Type" value={item.type} />
                                <DataRow label="Amount" value={formatCurrency(item.amount)} />
                                
                                {item.file && item.file.length > 0 && (
                                  <FileDisplay 
                                    label={`Receipt for ${item.description || 'Insurance'}`} 
                                    value={item.file[0]?.url || ''} 
                                    fileType={`Insurance ${index + 1}`} 
                                  />
                                )}
                              </React.Fragment>
                            ))}
                          </>
                        )}
                      </>
                    )}
                    
                    {/* Donations */}
                    {specExpenses.donations && (
                      <>
                        <SubHeading text="Donations" />
                        <DataRow label="Has Donations" value={formatBoolean(specExpenses.donations.hasDonations)} />
                      </>
                    )}
                    
                    {/* Professional Development */}
                    {specExpenses.professionalDevelopment && (
                      <>
                        <SubHeading text="Professional Development" />
                        <DataRow label="Has Professional Development" value={formatBoolean(specExpenses.professionalDevelopment.hasProfessionalDevelopment)} />
                      </>
                    )}
                  </>
                );
              })()}
            </FormSection>
          )}

          {/* Extraordinary Burdens Section */}
          {(Object.keys(extraordinaryBurdens).length > 0 || (expenses && Object.keys(expenses.extraordinaryBurdens || {}).length > 0)) && (
            <FormSection title="Extraordinary Burdens">
              {(() => {
                const extraBurdens = extraordinaryBurdens || expenses.extraordinaryBurdens || {};
                
                return (
                  <>
                    {/* Medical Expenses */}
                    {extraBurdens.medicalExpenses && (
                      <>
                        <SubHeading text="Medical Expenses" />
                        <DataRow label="Has Medical Expenses" value={formatBoolean(extraBurdens.medicalExpenses.hasMedicalExpenses)} />
                        
                        {extraBurdens.medicalExpenses.hasMedicalExpenses && extraBurdens.medicalExpenses.expenses && extraBurdens.medicalExpenses.expenses.length > 0 && (
                          <>
                            {extraBurdens.medicalExpenses.expenses.map((item: any, index: number) => (
                              <React.Fragment key={item.id || index}>
                                <SubHeading text={`Medical Expense ${index + 1}: ${item.description || 'Medical Expense'}`} />
                                <DataRow label="Type" value={item.type} />
                                <DataRow label="Amount" value={formatCurrency(item.amount)} />
                                
                                {item.file && item.file.length > 0 && (
                                  <FileDisplay 
                                    label={`Receipt for ${item.description || 'Medical Expense'}`} 
                                    value={item.file[0]?.url || ''} 
                                    fileType={`Medical Expense ${index + 1}`} 
                                  />
                                )}
                              </React.Fragment>
                            ))}
                          </>
                        )}
                      </>
                    )}
                    
                    {/* Care Costs */}
                    {extraBurdens.careCosts && (
                      <>
                        <SubHeading text="Care Costs" />
                        <DataRow label="Has Care Costs" value={formatBoolean(extraBurdens.careCosts.hasCareCosts)} />
                      </>
                    )}
                    
                    {/* Disability Expenses */}
                    {extraBurdens.disabilityExpenses && (
                      <>
                        <SubHeading text="Disability Expenses" />
                        <DataRow label="Has Disability Expenses" value={formatBoolean(extraBurdens.disabilityExpenses.hasDisabilityExpenses)} />
                      </>
                    )}
                  </>
                );
              })()}
            </FormSection>
          )}

          {/* Craftsmen Services Section */}
          {(Object.keys(craftsmenServices).length > 0 || (expenses && Object.keys(expenses.craftsmenServices || {}).length > 0)) && (
            <FormSection title="Craftsmen Services">
              {(() => {
                const craftServices = craftsmenServices || expenses.craftsmenServices || {};
                
                return (
                  <DataRow label="Has Maintenance Payments" value={formatBoolean(craftServices.hasMaintenancePayments)} />
                );
              })()}
            </FormSection>
          )}

          {/* Business Expenses Section */}
          {(Object.keys(businessExpenses).length > 0 || businessInfo.isBusinessOwner) && (
            <FormSection title="Business Information">
              <DataRow label="Is Business Owner" value={formatBoolean(businessInfo.isBusinessOwner)} />
            </FormSection>
          )}

          {/* Signature Section */}
          <FormSection title="Signature">
            <DataRow label="Full Name" value={signature.fullName} />
            <DataRow label="Place" value={signature.place} />
            <DataRow label="Date" value={formatDate(signature.date)} />
            <DataRow label="Confirmed Signature" value={formatBoolean(signature.confirmSignature)} />
            
            {signature.signature && (
              <div className="md:col-span-2 mb-2">
                <div className="font-bold text-sm text-neutral-800 mb-1">Digital Signature</div>
                <div className="border border-gray-200 p-2 rounded-md bg-white">
                  <img 
                    src={signature.signature} 
                    alt="Digital Signature" 
                    className="max-h-24 max-w-full object-contain"
                  />
                </div>
              </div>
            )}
          </FormSection>
        </div>
      </div>
    </div>
  );
};

export default TaxFormDetails; 