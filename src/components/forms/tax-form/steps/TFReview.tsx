import React from 'react';
import FKInputField from '../../../ui/FKInputField';

interface TFReviewProps {
  formData: { [key: string]: any };
  germanT: any;
  selectedT: any;
}

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
const SubHeading = ({ germanText, englishText }: { germanText: string, englishText: string }) => (
  <h4 className="md:col-span-2 font-semibold text-md text-neutral-700 mt-4 pt-4 border-t">
    {germanText} / {englishText}
  </h4>
);

// Helper for displaying files/images
const FileDisplay = ({ label, value, germanLabel }: { label: string, value: string, germanLabel: string }) => (
  <div className="md:col-span-2 mb-2">
    <div className="font-bold text-sm text-neutral-800">{germanLabel}</div>
    <div className="text-sm text-neutral-600 mb-1">{label}</div>
    <div className="text-base text-neutral-900">
      {value ? (
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>File uploaded</span>
        </div>
      ) : (
        <span className="text-neutral-500">No file uploaded</span>
      )}
    </div>
  </div>
);

const TFReview: React.FC<TFReviewProps> = ({ formData, germanT, selectedT }) => {
  // Debug logging to check structure of formData
  console.log('TFReview formData:', formData);
  console.log('workRelatedExpenses data:', formData.workRelatedExpenses);
  
  // Format boolean values
  const formatBoolean = (value: boolean | undefined | null): string => {
    console.log('value', value);
    if (value === undefined || value === null) {
      // Default undefined or null values to "No" for better user experience
      const no = selectedT?.common?.no || 'No';
      const germanNo = germanT?.common?.no || 'Nein';
      return `${germanNo} / ${no}`;
    }
    
    const yes = selectedT?.common?.yes || 'Yes';
    const no = selectedT?.common?.no || 'No';
    const germanYes = germanT?.common?.yes || 'Ja';
    const germanNo = germanT?.common?.no || 'Nein';
    return value ? `${germanYes} / ${yes}` : `${germanNo} / ${no}`;
  };

  // Safe boolean checker - converts undefined/null to false 
  const safeBoolean = (value: boolean | undefined | null): boolean => {
    return value === true;
  };

  // Format currency values
  const formatCurrency = (value: number | string | undefined | null): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (numValue === undefined || numValue === null || isNaN(numValue)) return '-';
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(numValue);
  };

  // Extract data from form sections with safety checks
  const taxYear = formData.taxYear || {};
  const personalInfo = formData.personalInfo || {};
  const incomeInfo = formData.incomeInfo || {};
  const expenses = formData.expenses || {};
  
  // Support for both data structures - check if workRelatedExpenses is at the top level or under expenses
  const workRelatedExpenses = expenses.workRelatedExpenses || formData.workRelatedExpenses || {};
  console.log('Extracted workRelatedExpenses from correct path:', workRelatedExpenses);
  
  const specialExpenses = expenses.specialExpenses || {};
  const extraordinaryBurdens = expenses.extraordinaryBurdens || {};
  const craftsmenServices = expenses.craftsmenServices || {};
  const businessInfo = formData.businessInfo || {};

  return (
    <div className="space-y-6">
      {/* Tax Year Section */}
      <FormSection title={<>Steuerjahr / Tax Year</>}>
        <FKInputField
          id="review-taxYear"
          mainLanguage="Steuerjahr"
          selectedLanguage="Tax Year"
          value={taxYear.year || '-'}
          readOnly={true} 
        />
      </FormSection>

      {/* Personal Information Section */}
      <FormSection title={<>{germanT?.personalInfo?.title || 'Persönliche Informationen'} / {selectedT?.personalInfo?.title || 'Personal Information'}</>}>
        <FKInputField
          id="review-firstName"
          mainLanguage={germanT?.personalInfo?.firstName || 'Vorname'}
          selectedLanguage={selectedT?.personalInfo?.firstName || 'First Name'}
          value={personalInfo.firstName || '-'}
          readOnly={true} 
        />
        <FKInputField
          id="review-lastName"
          mainLanguage={germanT?.personalInfo?.lastName || 'Nachname'}
          selectedLanguage={selectedT?.personalInfo?.lastName || 'Last Name'}
          value={personalInfo.lastName || '-'}
          readOnly={true}
        />
        <FKInputField
          id="review-taxId"
          mainLanguage={germanT?.personalInfo?.taxId || 'Steuer-ID'}
          selectedLanguage={selectedT?.personalInfo?.taxId || 'Tax ID'}
          value={personalInfo.taxId || '-'}
          readOnly={true}
        />
        <FKInputField
          id="review-dateOfBirth"
          type="date" 
          mainLanguage={germanT?.personalInfo?.dateOfBirth || 'Geburtsdatum'}
          selectedLanguage={selectedT?.personalInfo?.dateOfBirth || 'Date of Birth'}
          value={personalInfo.dateOfBirth || '-'}
          readOnly={true}
        />
        <FKInputField
          id="review-email"
          type="email"
          mainLanguage={germanT?.personalInfo?.email || 'E-Mail'}
          selectedLanguage={selectedT?.personalInfo?.email || 'Email'}
          value={personalInfo.email || '-'}
          readOnly={true}
        />
        <FKInputField
          id="review-phone"
          type="tel"
          mainLanguage={germanT?.personalInfo?.phone || 'Telefon'}
          selectedLanguage={selectedT?.personalInfo?.phone || 'Phone'}
          value={personalInfo.phone || '-'}
          readOnly={true}
        />

        {/* Address Sub-Section */}
        <SubHeading
          germanText={germanT?.address?.title || 'Adresse'}
          englishText={selectedT?.address?.title || 'Address'}
        />
        <FKInputField
          id="review-street"
          mainLanguage={germanT?.address?.street || 'Straße'}
          selectedLanguage={selectedT?.address?.street || 'Street'}
          value={personalInfo.address?.street || '-'}
          readOnly={true}
        />
        <FKInputField
          id="review-houseNumber"
          mainLanguage={germanT?.address?.houseNumber || 'Hausnummer'}
          selectedLanguage={selectedT?.address?.houseNumber || 'House Number'}
          value={personalInfo.address?.houseNumber || '-'}
          readOnly={true}
        />
        <FKInputField
          id="review-postalCode"
          mainLanguage={germanT?.address?.postalCode || 'Postleitzahl'}
          selectedLanguage={selectedT?.address?.postalCode || 'Postal Code'}
          value={personalInfo.address?.postalCode || '-'}
          readOnly={true}
        />
        <FKInputField
          id="review-city"
          mainLanguage={germanT?.address?.city || 'Stadt'}
          selectedLanguage={selectedT?.address?.city || 'City'}
          value={personalInfo.address?.city || '-'}
          readOnly={true}
        />

        {/* Marital Status */}
        <FKInputField
          id="review-maritalStatus"
          mainLanguage={germanT?.personalInfo?.maritalStatus || 'Familienstand'}
          selectedLanguage={selectedT?.personalInfo?.maritalStatus || 'Marital Status'}
          value={personalInfo.maritalStatus || '-'}
          readOnly={true}
        />

        {/* Spouse Information Sub-Section - Conditionally render if married */}
        {safeBoolean(personalInfo.maritalStatus === 'married') && personalInfo.spouse && (
          <>
            <SubHeading
              germanText={germanT?.spouse?.title || 'Ehepartner Informationen'}
              englishText={selectedT?.spouse?.title || 'Spouse Information'}
            />
            <FKInputField
              id="review-spouse-firstName"
              mainLanguage={germanT?.spouse?.firstName || 'Vorname des Ehepartners'}
              selectedLanguage={selectedT?.spouse?.firstName || 'Spouse First Name'}
              value={personalInfo.spouse?.firstName || '-'}
              readOnly={true}
            />
            <FKInputField
              id="review-spouse-lastName"
              mainLanguage={germanT?.spouse?.lastName || 'Nachname des Ehepartners'}
              selectedLanguage={selectedT?.spouse?.lastName || 'Spouse Last Name'}
              value={personalInfo.spouse?.lastName || '-'}
              readOnly={true}
            />
            <FKInputField
              id="review-spouse-dateOfBirth"
              type="date"
              mainLanguage={germanT?.spouse?.dateOfBirth || 'Geburtsdatum des Ehepartners'}
              selectedLanguage={selectedT?.spouse?.dateOfBirth || 'Spouse Date of Birth'}
              value={personalInfo.spouse?.dateOfBirth || '-'}
              readOnly={true}
            />
            <FKInputField
              id="review-spouse-taxId"
              mainLanguage={germanT?.spouse?.taxId || 'Steuer-ID des Ehepartners'}
              selectedLanguage={selectedT?.spouse?.taxId || 'Spouse Tax ID'}
              value={personalInfo.spouse?.taxId || '-'}
              readOnly={true}
            />
            
            {/* Spouse's income information */}
            <FKInputField
              id="review-spouse-hasIncome"
              mainLanguage={germanT?.spouse?.hasIncome || 'Hat Einkommen?'}
              selectedLanguage={selectedT?.spouse?.hasIncome || 'Has Income?'}
              value={formatBoolean(personalInfo.spouse?.hasIncome)}
              readOnly={true}
            />
            
            {personalInfo.spouse?.hasIncome && (
              <>
                <FKInputField
                  id="review-spouse-incomeType"
                  mainLanguage={germanT?.spouse?.incomeType || 'Einkommensart'}
                  selectedLanguage={selectedT?.spouse?.incomeType || 'Income Type'}
                  value={personalInfo.spouse?.incomeType || '-'}
                  readOnly={true}
                />
                <FKInputField
                  id="review-spouse-jointTaxation"
                  mainLanguage={germanT?.spouse?.jointTaxation || 'Gemeinsame Veranlagung?'}
                  selectedLanguage={selectedT?.spouse?.jointTaxation || 'Joint Taxation?'}
                  value={formatBoolean(personalInfo.spouse?.jointTaxation)}
                  readOnly={true}
                />
              </>
            )}
          </>
        )}

        {/* Children Information - Conditionally render if has children */}
        {safeBoolean(personalInfo.hasChildren) && personalInfo.children && personalInfo.children.length > 0 && (
          <>
            <SubHeading
              germanText={germanT?.children?.title || 'Kinder'}
              englishText={selectedT?.children?.title || 'Children'}
            />
            
            {personalInfo.children.map((child: any, index: number) => (
              <React.Fragment key={`child-${index}`}>
                <div className="md:col-span-2 mt-2 mb-2">
                  <h5 className="font-medium text-neutral-700">
                    {germanT?.children?.child || 'Kind'} {index + 1} / {selectedT?.children?.child || 'Child'} {index + 1}
                  </h5>
                </div>
                
                <FKInputField
                  id={`review-child-${index}-firstName`}
                  mainLanguage={germanT?.children?.firstName || 'Vorname'}
                  selectedLanguage={selectedT?.children?.firstName || 'First Name'}
                  value={child.firstName || '-'}
                  readOnly={true}
                />
                <FKInputField
                  id={`review-child-${index}-lastName`}
                  mainLanguage={germanT?.children?.lastName || 'Nachname'}
                  selectedLanguage={selectedT?.children?.lastName || 'Last Name'}
                  value={child.lastName || '-'}
                  readOnly={true}
                />
                <FKInputField
                  id={`review-child-${index}-dateOfBirth`}
                  type="date"
                  mainLanguage={germanT?.children?.dateOfBirth || 'Geburtsdatum'}
                  selectedLanguage={selectedT?.children?.dateOfBirth || 'Date of Birth'}
                  value={child.dateOfBirth || '-'}
                  readOnly={true}
                />
                <FKInputField
                  id={`review-child-${index}-taxId`}
                  mainLanguage={germanT?.children?.taxId || 'Steuer-ID'}
                  selectedLanguage={selectedT?.children?.taxId || 'Tax ID'}
                  value={child.taxId || '-'}
                  readOnly={true}
                />
              </React.Fragment>
            ))}
          </>
        )}
      </FormSection>

      {/* Income Information Section */}
      <FormSection title={<>{germanT?.incomeInfo?.title || 'Einkünfte'} / {selectedT?.incomeInfo?.title || 'Income Information'}</>}>
        {/* Employment Income */}
        <SubHeading
          germanText={germanT?.incomeInfo?.employment?.title || 'Beschäftigungseinkommen'}
          englishText={selectedT?.incomeInfo?.employment?.title || 'Employment Income'}
        />
        
        <FKInputField
          id="review-employment-isEmployed"
          mainLanguage={germanT?.incomeInfo?.employment?.isEmployed || 'Beschäftigt?'}
          selectedLanguage={selectedT?.incomeInfo?.employment?.isEmployed || 'Employed?'}
          value={formatBoolean(incomeInfo.employment?.isEmployed)}
          readOnly={true}
        />
        
        {safeBoolean(incomeInfo.employment?.isEmployed) && (
          <>
            <FKInputField
              id="review-employment-employer"
              mainLanguage={germanT?.incomeInfo?.employment?.employer || 'Arbeitgeber'}
              selectedLanguage={selectedT?.incomeInfo?.employment?.employer || 'Employer'}
              value={incomeInfo.employment?.employer || '-'}
              readOnly={true}
            />
            <FKInputField
              id="review-employment-income"
              mainLanguage={germanT?.incomeInfo?.employment?.employmentIncome || 'Einkommen'}
              selectedLanguage={selectedT?.incomeInfo?.employment?.employmentIncome || 'Income'}
              value={formatCurrency(incomeInfo.employment?.employmentIncome)}
              readOnly={true}
            />
            
            {/* Tax Certificate Information */}
            <FKInputField
              id="review-employment-hasTaxCertificate"
              mainLanguage={germanT?.incomeInfo?.employment?.hasTaxCertificate || 'Steuerbescheinigung vorhanden?'}
              selectedLanguage={selectedT?.incomeInfo?.employment?.hasTaxCertificate || 'Has Tax Certificate?'}
              value={formatBoolean(incomeInfo.employment?.hasTaxCertificate)}
              readOnly={true}
            />
            
            {safeBoolean(incomeInfo.employment?.hasTaxCertificate) && (
              <FileDisplay
                germanLabel={germanT?.incomeInfo?.employment?.taxCertificateFile || 'Steuer-Bescheinigung Dokument'}
                label={selectedT?.incomeInfo?.employment?.taxCertificateFile || 'Tax Certificate Document'}
                value={incomeInfo.employment?.taxCertificate?.[0] ? 'File uploaded' : ''}
              />
            )}

            {/* Added Travel Subsidy */}
            <FKInputField
              id="review-employment-hasTravelSubsidy"
              mainLanguage={germanT?.incomeInfo?.employment?.hasTravelSubsidy || 'Fahrtkostenzuschuss?'}
              selectedLanguage={selectedT?.incomeInfo?.employment?.hasTravelSubsidy || 'Has Travel Subsidy?'}
              value={formatBoolean(incomeInfo.employment?.hasTravelSubsidy)}
              readOnly={true}
            />

            {safeBoolean(incomeInfo.employment?.hasTravelSubsidy) && (
              <FKInputField
                id="review-employment-travelDistance"
                mainLanguage={germanT?.incomeInfo?.employment?.travelDistance || 'Entfernung (km)'}
                selectedLanguage={selectedT?.incomeInfo?.employment?.travelDistance || 'Travel Distance (km)'}
                value={incomeInfo.employment?.travelDistance || '-'}
                readOnly={true}
              />
            )}
          </>
        )}

        {/* Self-Employment/Business Income */}
        <SubHeading
          germanText={germanT?.incomeInfo?.business?.title || 'Geschäftseinkommen'}
          englishText={selectedT?.incomeInfo?.business?.title || 'Business Income'}
        />
        
        <FKInputField
          id="review-business-isBusinessOwner"
          mainLanguage={germanT?.incomeInfo?.business?.isBusinessOwner || 'Selbständig?'}
          selectedLanguage={selectedT?.incomeInfo?.business?.isBusinessOwner || 'Business Owner?'}
          value={formatBoolean(incomeInfo.business?.isBusinessOwner)}
          readOnly={true}
        />
        
        {safeBoolean(incomeInfo.business?.isBusinessOwner) && (
          <>
            <FKInputField
              id="review-business-type"
              mainLanguage={germanT?.incomeInfo?.business?.businessType || 'Geschäftsart'}
              selectedLanguage={selectedT?.incomeInfo?.business?.businessType || 'Business Type'}
              value={incomeInfo.business?.businessType || '-'}
              readOnly={true}
            />
            <FKInputField
              id="review-business-earnings"
              mainLanguage={germanT?.incomeInfo?.business?.businessEarnings || 'Einnahmen'}
              selectedLanguage={selectedT?.incomeInfo?.business?.businessEarnings || 'Earnings'}
              value={formatCurrency(incomeInfo.business?.businessEarnings)}
              readOnly={true}
            />
            <FKInputField
              id="review-business-expenses"
              mainLanguage={germanT?.incomeInfo?.business?.businessExpenses || 'Ausgaben'}
              selectedLanguage={selectedT?.incomeInfo?.business?.businessExpenses || 'Expenses'}
              value={formatCurrency(incomeInfo.business?.businessExpenses)}
              readOnly={true}
            />
          </>
        )}

        {/* Investment Income */}
        <SubHeading
          germanText={germanT?.incomeInfo?.investments?.title || 'Kapitalerträge'}
          englishText={selectedT?.incomeInfo?.investments?.title || 'Investment Income'}
        />
        
        <FKInputField
          id="review-investments-hasStockIncome"
          mainLanguage={germanT?.incomeInfo?.investments?.hasStockIncome || 'Kapitalerträge?'}
          selectedLanguage={selectedT?.incomeInfo?.investments?.hasStockIncome || 'Has Investment Income?'}
          value={formatBoolean(incomeInfo.investments?.hasStockIncome)}
          readOnly={true}
        />
        
        {safeBoolean(incomeInfo.investments?.hasStockIncome) && (
          <>
            <FKInputField
              id="review-investments-dividendEarnings"
              mainLanguage={germanT?.incomeInfo?.investments?.dividendEarnings || 'Dividendenerträge'}
              selectedLanguage={selectedT?.incomeInfo?.investments?.dividendEarnings || 'Dividend Earnings'}
              value={formatCurrency(incomeInfo.investments?.dividendEarnings)}
              readOnly={true}
            />
            <FKInputField
              id="review-investments-capitalGains"
              mainLanguage={germanT?.incomeInfo?.investments?.capitalGains || 'Kursgewinne'}
              selectedLanguage={selectedT?.incomeInfo?.investments?.capitalGains || 'Capital Gains'}
              value={formatCurrency(incomeInfo.investments?.capitalGains)}
              readOnly={true}
            />
            
            {/* Stock Sales Information */}
            <FKInputField
              id="review-investments-hasStockSales"
              mainLanguage={germanT?.incomeInfo?.investments?.hasStockSales || 'Aktienverkäufe?'}
              selectedLanguage={selectedT?.incomeInfo?.investments?.hasStockSales || 'Has Stock Sales?'}
              value={formatBoolean(incomeInfo.investments?.hasStockSales)}
              readOnly={true}
            />
            
            {safeBoolean(incomeInfo.investments?.hasStockSales) && (
              <FKInputField
                id="review-investments-stockProfitLoss"
                mainLanguage={germanT?.incomeInfo?.investments?.stockProfitLoss || 'Gewinn/Verlust'}
                selectedLanguage={selectedT?.incomeInfo?.investments?.stockProfitLoss || 'Profit/Loss'}
                value={formatCurrency(incomeInfo.investments?.stockProfitLoss)}
                readOnly={true}
              />
            )}
            
            {/* Bank Certificate Information */}
            <FKInputField
              id="review-investments-hasBankCertificate"
              mainLanguage={germanT?.incomeInfo?.investments?.hasBankCertificate || 'Bankbescheinigung?'}
              selectedLanguage={selectedT?.incomeInfo?.investments?.hasBankCertificate || 'Has Bank Certificate?'}
              value={formatBoolean(incomeInfo.investments?.hasBankCertificate)}
              readOnly={true}
            />
            
            {safeBoolean(incomeInfo.investments?.hasBankCertificate) && (
              <FileDisplay
                germanLabel={germanT?.incomeInfo?.investments?.bankCertificateFile || 'Bankbescheinigung Dokument'}
                label={selectedT?.incomeInfo?.investments?.bankCertificateFile || 'Bank Certificate Document'}
                value={incomeInfo.investments?.bankCertificate?.[0] ? 'File uploaded' : ''}
              />
            )}

            {/* Foreign Stocks */}
            <FKInputField
              id="review-investments-hasForeignStocks"
              mainLanguage={germanT?.incomeInfo?.investments?.hasForeignStocks || 'Ausländische Aktien?'}
              selectedLanguage={selectedT?.incomeInfo?.investments?.hasForeignStocks || 'Has Foreign Stocks?'}
              value={formatBoolean(incomeInfo.investments?.hasForeignStocks)}
              readOnly={true}
            />
          </>
        )}

        {/* Rental Income Information - Directly in Income section */}
        <SubHeading
          germanText={germanT?.incomeInfo?.rentalIncome?.title || 'Mieteinnahmen'}
          englishText={selectedT?.incomeInfo?.rentalIncome?.title || 'Rental Income'}
        />
        
        <FKInputField
          id="review-rental-hasRentalProperty"
          mainLanguage={germanT?.incomeInfo?.hasRentalProperty || 'Mietobjekt vorhanden?'}
          selectedLanguage={selectedT?.incomeInfo?.hasRentalProperty || 'Has Rental Property?'}
          value={formatBoolean(incomeInfo.hasRentalProperty)}
          readOnly={true}
        />
        
        {safeBoolean(incomeInfo.hasRentalProperty) && (
          <>
            <FKInputField
              id="review-rental-income"
              mainLanguage={germanT?.incomeInfo?.rentalIncome || 'Mieteinnahmen'}
              selectedLanguage={selectedT?.incomeInfo?.rentalIncome || 'Rental Income'}
              value={formatCurrency(incomeInfo.rentalIncome)}
              readOnly={true}
            />
            
            <FKInputField
              id="review-rental-costs"
              mainLanguage={germanT?.incomeInfo?.rentalCosts || 'Mietkosten'}
              selectedLanguage={selectedT?.incomeInfo?.rentalCosts || 'Rental Costs'}
              value={formatCurrency(incomeInfo.rentalCosts)}
              readOnly={true}
            />
            
            <SubHeading
              germanText={germanT?.incomeInfo?.rentalPropertyAddress?.title || 'Adresse der Immobilie'}
              englishText={selectedT?.incomeInfo?.rentalPropertyAddress?.title || 'Property Address'}
            />
            
            <FKInputField
              id="review-rental-property-street"
              mainLanguage={germanT?.address?.street || 'Straße'}
              selectedLanguage={selectedT?.address?.street || 'Street'}
              value={incomeInfo.rentalPropertyAddress?.street || '-'}
              readOnly={true}
            />
            
            <FKInputField
              id="review-rental-property-houseNumber"
              mainLanguage={germanT?.address?.houseNumber || 'Hausnummer'}
              selectedLanguage={selectedT?.address?.houseNumber || 'House Number'}
              value={incomeInfo.rentalPropertyAddress?.houseNumber || '-'}
              readOnly={true}
            />
            
            <FKInputField
              id="review-rental-property-postalCode"
              mainLanguage={germanT?.address?.postalCode || 'Postleitzahl'}
              selectedLanguage={selectedT?.address?.postalCode || 'Postal Code'}
              value={incomeInfo.rentalPropertyAddress?.postalCode || '-'}
              readOnly={true}
            />
            
            <FKInputField
              id="review-rental-property-city"
              mainLanguage={germanT?.address?.city || 'Stadt'}
              selectedLanguage={selectedT?.address?.city || 'City'}
              value={incomeInfo.rentalPropertyAddress?.city || '-'}
              readOnly={true}
            />
          </>
        )}

        {/* Foreign Income */}
        <SubHeading
          germanText={germanT?.incomeInfo?.foreignIncome?.title || 'Ausländische Einkünfte'}
          englishText={selectedT?.incomeInfo?.foreignIncome?.title || 'Foreign Income'}
        />
        
        <FKInputField
          id="review-foreign-hasForeignIncome"
          mainLanguage={germanT?.incomeInfo?.hasForeignIncome || 'Ausländische Einkünfte?'}
          selectedLanguage={selectedT?.incomeInfo?.hasForeignIncome || 'Has Foreign Income?'}
          value={formatBoolean(incomeInfo.hasForeignIncome)}
          readOnly={true}
        />
        
        {safeBoolean(incomeInfo.hasForeignIncome) && (
          <>
            <FKInputField
              id="review-foreign-country"
              mainLanguage={germanT?.incomeInfo?.foreignIncomeCountry || 'Land'}
              selectedLanguage={selectedT?.incomeInfo?.foreignIncomeCountry || 'Country'}
              value={incomeInfo.foreignIncomeCountry || incomeInfo.foreignIncomeOtherCountry || '-'}
              readOnly={true}
            />
            
            <FKInputField
              id="review-foreign-incomeType"
              mainLanguage={germanT?.incomeInfo?.foreignIncomeType || 'Einkommensart'}
              selectedLanguage={selectedT?.incomeInfo?.foreignIncomeType || 'Income Type'}
              value={incomeInfo.foreignIncomeType || '-'}
              readOnly={true}
            />
            
            <FKInputField
              id="review-foreign-amount"
              mainLanguage={germanT?.incomeInfo?.foreignIncomeAmount || 'Betrag'}
              selectedLanguage={selectedT?.incomeInfo?.foreignIncomeAmount || 'Amount'}
              value={formatCurrency(incomeInfo.foreignIncomeAmount)}
              readOnly={true}
            />
            
            <FKInputField
              id="review-foreign-taxPaid"
              mainLanguage={germanT?.incomeInfo?.foreignIncomeTaxPaid || 'Gezahlte Steuern'}
              selectedLanguage={selectedT?.incomeInfo?.foreignIncomeTaxPaid || 'Tax Paid'}
              value={formatCurrency(incomeInfo.foreignIncomeTaxPaid)}
              readOnly={true}
            />
            
            {incomeInfo.foreignIncomeTaxCertificateFile && (
              <FileDisplay
                germanLabel={germanT?.incomeInfo?.foreignIncomeTaxCertificateFile || 'Steuerbescheinigung'}
                label={selectedT?.incomeInfo?.foreignIncomeTaxCertificateFile || 'Tax Certificate'}
                value={incomeInfo.foreignIncomeTaxCertificateFile[0] ? 'File uploaded' : ''}
              />
            )}
          </>
        )}
      </FormSection>

      {/* Work-Related Expenses Section */}
      <FormSection title={<>{germanT?.workRelatedExpenses?.title || 'Werbungskosten'} / {selectedT?.workRelatedExpenses?.title || 'Work-Related Expenses'}</>}>
        {/* Commuting Expenses */}
        <SubHeading
          germanText={germanT?.workRelatedExpenses?.commutation?.title || 'Fahrtkosten zur Arbeit'}
          englishText={selectedT?.workRelatedExpenses?.commutation?.title || 'Commuting Expenses'}
        />
        
        <FKInputField
          id="review-commuting-expenses-has"
          mainLanguage={germanT?.workRelatedExpenses?.commutation?.hasCommutingExpenses || 'Fahrtkosten?'}
          selectedLanguage={selectedT?.workRelatedExpenses?.commutation?.hasCommutingExpenses || 'Has Commuting Expenses?'}
          value={formatBoolean(workRelatedExpenses?.commutation?.hasCommutingExpenses)}
          readOnly={true}
        />
        
        {safeBoolean(workRelatedExpenses?.commutation?.hasCommutingExpenses) && (
          <>
            <FKInputField
              id="review-commuting-working-days"
              mainLanguage={germanT?.workRelatedExpenses?.commutation?.workingDaysCount || 'Arbeitstage pro Jahr'}
              selectedLanguage={selectedT?.workRelatedExpenses?.commutation?.workingDaysCount || 'Working Days per Year'}
              value={workRelatedExpenses?.commutation?.workingDaysCount || '-'}
              readOnly={true}
            />
            
            <SubHeading
              germanText={germanT?.workRelatedExpenses?.commutation?.route?.from?.title || 'Wohnadresse'}
              englishText={selectedT?.workRelatedExpenses?.commutation?.route?.from?.title || 'Home Address'}
            />
            
            <FKInputField
              id="review-commuting-from-street"
              mainLanguage={germanT?.address?.street || 'Straße'}
              selectedLanguage={selectedT?.address?.street || 'Street'}
              value={workRelatedExpenses?.commutation?.route?.from?.street || '-'}
              readOnly={true}
            />
            
            <FKInputField
              id="review-commuting-from-houseNumber"
              mainLanguage={germanT?.address?.houseNumber || 'Hausnummer'}
              selectedLanguage={selectedT?.address?.houseNumber || 'House Number'}
              value={workRelatedExpenses?.commutation?.route?.from?.houseNumber || '-'}
              readOnly={true}
            />
            
            <FKInputField
              id="review-commuting-from-postalCode"
              mainLanguage={germanT?.address?.postalCode || 'Postleitzahl'}
              selectedLanguage={selectedT?.address?.postalCode || 'Postal Code'}
              value={workRelatedExpenses?.commutation?.route?.from?.postalCode || '-'}
              readOnly={true}
            />
            
            <FKInputField
              id="review-commuting-from-city"
              mainLanguage={germanT?.address?.city || 'Stadt'}
              selectedLanguage={selectedT?.address?.city || 'City'}
              value={workRelatedExpenses?.commutation?.route?.from?.city || '-'}
              readOnly={true}
            />
            
            <SubHeading
              germanText={germanT?.workRelatedExpenses?.commutation?.route?.firstOfficeAddress?.title || 'Büro-Adresse'}
              englishText={selectedT?.workRelatedExpenses?.commutation?.route?.firstOfficeAddress?.title || 'Office Address'}
            />
            
            <FKInputField
              id="review-commuting-to-street"
              mainLanguage={germanT?.address?.street || 'Straße'}
              selectedLanguage={selectedT?.address?.street || 'Street'}
              value={workRelatedExpenses?.commutation?.route?.firstOfficeAddress?.street || '-'}
              readOnly={true}
            />
            
            <FKInputField
              id="review-commuting-to-houseNumber"
              mainLanguage={germanT?.address?.houseNumber || 'Hausnummer'}
              selectedLanguage={selectedT?.address?.houseNumber || 'House Number'}
              value={workRelatedExpenses?.commutation?.route?.firstOfficeAddress?.houseNumber || '-'}
              readOnly={true}
            />
            
            <FKInputField
              id="review-commuting-to-postalCode"
              mainLanguage={germanT?.address?.postalCode || 'Postleitzahl'}
              selectedLanguage={selectedT?.address?.postalCode || 'Postal Code'}
              value={workRelatedExpenses?.commutation?.route?.firstOfficeAddress?.postalCode || '-'}
              readOnly={true}
            />
            
            <FKInputField
              id="review-commuting-to-city"
              mainLanguage={germanT?.address?.city || 'Stadt'}
              selectedLanguage={selectedT?.address?.city || 'City'}
              value={workRelatedExpenses?.commutation?.route?.firstOfficeAddress?.city || '-'}
              readOnly={true}
            />
          </>
        )}
        
        {/* Business Trip Costs */}
        <SubHeading
          germanText={germanT?.workRelatedExpenses?.businessTripsCosts?.title || 'Dienstreisekosten'}
          englishText={selectedT?.workRelatedExpenses?.businessTripsCosts?.title || 'Business Trip Costs'}
        />
        
        <FKInputField
          id="review-business-trips-costs-amount"
          mainLanguage={germanT?.workRelatedExpenses?.businessTripsCosts?.amount || 'Betrag'}
          selectedLanguage={selectedT?.workRelatedExpenses?.businessTripsCosts?.amount || 'Amount'}
          value={formatCurrency(workRelatedExpenses?.businessTripsCosts?.amount)}
          readOnly={true}
        />
        
        {workRelatedExpenses?.businessTripsCosts?.proof && workRelatedExpenses?.businessTripsCosts?.proof.length > 0 && (
          <FileDisplay
            germanLabel={germanT?.workRelatedExpenses?.businessTripsCosts?.proof || 'Belege'}
            label={selectedT?.workRelatedExpenses?.businessTripsCosts?.proof || 'Proof Documents'}
            value={workRelatedExpenses?.businessTripsCosts?.proof[0] ? 'File uploaded' : ''}
          />
        )}
        
        {/* Work Equipment */}
        <SubHeading
          germanText={germanT?.workRelatedExpenses?.workEquipment?.title || 'Arbeitsmittel'}
          englishText={selectedT?.workRelatedExpenses?.workEquipment?.title || 'Work Equipment'}
        />
        
        <FKInputField
          id="review-work-equipment-has"
          mainLanguage={germanT?.workRelatedExpenses?.workEquipment?.hasWorkEquipment || 'Arbeitsmittel vorhanden?'}
          selectedLanguage={selectedT?.workRelatedExpenses?.workEquipment?.hasWorkEquipment || 'Has Work Equipment?'}
          value={formatBoolean(workRelatedExpenses?.workEquipment?.hasWorkEquipment)}
          readOnly={true}
        />
        
        {safeBoolean(workRelatedExpenses?.workEquipment?.hasWorkEquipment) && 
         workRelatedExpenses?.workEquipment?.expenses && 
         workRelatedExpenses?.workEquipment?.expenses.length > 0 && (
          <div className="col-span-2 space-y-2">
            <div className="text-sm font-medium text-neutral-800">
              {germanT?.workRelatedExpenses?.workEquipment?.expenses || 'Ausgaben für Arbeitsmittel'} / {selectedT?.workRelatedExpenses?.workEquipment?.expenses || 'Work Equipment Expenses'}
            </div>
            {workRelatedExpenses.workEquipment.expenses.map((expense: any, index: number) => (
              <div key={expense.id || index} className="flex justify-between border-b pb-2">
                <div>
                  <span className="font-medium">{expense.description}</span> - {expense.type}
                </div>
                <div className="font-medium">{formatCurrency(expense.amount)}</div>
              </div>
            ))}
          </div>
        )}
        
        {/* Home Office */}
        <SubHeading
          germanText={germanT?.workRelatedExpenses?.homeOffice?.title || 'Home-Office'}
          englishText={selectedT?.workRelatedExpenses?.homeOffice?.title || 'Home Office'}
        />
        
        <FKInputField
          id="review-home-office-has"
          mainLanguage={germanT?.workRelatedExpenses?.homeOffice?.hasHomeOffice || 'Home-Office vorhanden?'}
          selectedLanguage={selectedT?.workRelatedExpenses?.homeOffice?.hasHomeOffice || 'Has Home Office?'}
          value={formatBoolean(workRelatedExpenses?.homeOffice?.hasHomeOffice)}
          readOnly={true}
        />
        
        {safeBoolean(workRelatedExpenses?.homeOffice?.hasHomeOffice) && (
          <FKInputField
            id="review-home-office-days"
            mainLanguage={germanT?.workRelatedExpenses?.homeOffice?.workingDaysCount || 'Home-Office Tage'}
            selectedLanguage={selectedT?.workRelatedExpenses?.homeOffice?.workingDaysCount || 'Home Office Days'}
            value={workRelatedExpenses?.homeOffice?.workingDaysCount || '-'}
            readOnly={true}
          />
        )}
        
        {/* Application Costs */}
        <SubHeading
          germanText={germanT?.workRelatedExpenses?.applicationCosts?.title || 'Bewerbungskosten'}
          englishText={selectedT?.workRelatedExpenses?.applicationCosts?.title || 'Application Costs'}
        />
        
        <FKInputField
          id="review-application-online"
          mainLanguage={germanT?.workRelatedExpenses?.applicationCosts?.online || 'Online Bewerbungen'}
          selectedLanguage={selectedT?.workRelatedExpenses?.applicationCosts?.online || 'Online Applications'}
          value={workRelatedExpenses?.applicationCosts?.online || '-'}
          readOnly={true}
        />
        
        <FKInputField
          id="review-application-inPerson"
          mainLanguage={germanT?.workRelatedExpenses?.applicationCosts?.inPerson || 'Persönliche Bewerbungen'}
          selectedLanguage={selectedT?.workRelatedExpenses?.applicationCosts?.inPerson || 'In-Person Applications'}
          value={workRelatedExpenses?.applicationCosts?.inPerson || '-'}
          readOnly={true}
        />
        
        {/* Double Household Management */}
        <FKInputField
          id="review-has-double-household-mgmt"
          mainLanguage={germanT?.workRelatedExpenses?.hasDoubleHouseholdMgmt || 'Doppelte Haushaltsführung?'}
          selectedLanguage={selectedT?.workRelatedExpenses?.hasDoubleHouseholdMgmt || 'Double Household Management?'}
          value={formatBoolean(workRelatedExpenses?.hasDoubleHouseholdMgmt)}
          readOnly={true}
        />
      </FormSection>
      
      {/* Special Expenses Section */}
      <FormSection title={<>{germanT?.specialExpenses?.title || 'Sonderausgaben'} / {selectedT?.specialExpenses?.title || 'Special Expenses'}</>}>
        {/* Insurance expenses subsection */}
        <SubHeading
          germanText={germanT?.specialExpenses?.insurance?.title || 'Versicherungen'}
          englishText={selectedT?.specialExpenses?.insurance?.title || 'Insurance'}
        />
        
        <FKInputField
          id="review-insurance-has"
          mainLanguage={germanT?.specialExpenses?.insurance?.hasInsurance || 'Versicherungen vorhanden?'}
          selectedLanguage={selectedT?.specialExpenses?.insurance?.hasInsurance || 'Has Insurance?'}
          value={formatBoolean(specialExpenses?.insurance?.hasInsurance)}
          readOnly={true}
        />
        
        {safeBoolean(specialExpenses?.insurance?.hasInsurance) && 
         specialExpenses?.insurance?.expenses && 
         specialExpenses?.insurance?.expenses.length > 0 && (
          <div className="col-span-2 space-y-2">
            <div className="text-sm font-medium text-neutral-800">
              {germanT?.specialExpenses?.insurance?.expenses || 'Versicherungsausgaben'} / {selectedT?.specialExpenses?.insurance?.expenses || 'Insurance Expenses'}
            </div>
            {specialExpenses.insurance.expenses.map((expense: any, index: number) => (
              <div key={expense.id || index} className="flex justify-between border-b pb-2">
                <div>
                  <span className="font-medium">{expense.description}</span> - {expense.type}
                </div>
                <div className="font-medium">{formatCurrency(expense.amount)}</div>
              </div>
            ))}
          </div>
        )}
        
        {/* Donations subsection */}
        <SubHeading
          germanText={germanT?.specialExpenses?.donations?.title || 'Spenden'}
          englishText={selectedT?.specialExpenses?.donations?.title || 'Donations'}
        />
        
        <FKInputField
          id="review-donations-has"
          mainLanguage={germanT?.specialExpenses?.donations?.hasDonations || 'Spenden getätigt?'}
          selectedLanguage={selectedT?.specialExpenses?.donations?.hasDonations || 'Has Donations?'}
          value={formatBoolean(specialExpenses?.donations?.hasDonations)}
          readOnly={true}
        />
        
        {safeBoolean(specialExpenses?.donations?.hasDonations) && 
         specialExpenses?.donations?.expenses && 
         specialExpenses?.donations?.expenses.length > 0 && (
          <div className="col-span-2 space-y-2">
            <div className="text-sm font-medium text-neutral-800">
              {germanT?.specialExpenses?.donations?.expenses || 'Spendenausgaben'} / {selectedT?.specialExpenses?.donations?.expenses || 'Donation Expenses'}
            </div>
            {specialExpenses.donations.expenses.map((expense: any, index: number) => (
              <div key={expense.id || index} className="flex justify-between border-b pb-2">
                <div>
                  <span className="font-medium">{expense.description}</span> - {expense.type}
                </div>
                <div className="font-medium">{formatCurrency(expense.amount)}</div>
              </div>
            ))}
          </div>
        )}
        
        {/* Professional Development subsection */}
        <SubHeading
          germanText={germanT?.specialExpenses?.professionalDevelopment?.title || 'Weiterbildung'}
          englishText={selectedT?.specialExpenses?.professionalDevelopment?.title || 'Professional Development'}
        />
        
        <FKInputField
          id="review-professional-development-has"
          mainLanguage={germanT?.specialExpenses?.professionalDevelopment?.hasProfessionalDevelopment || 'Weiterbildung absolviert?'}
          selectedLanguage={selectedT?.specialExpenses?.professionalDevelopment?.hasProfessionalDevelopment || 'Has Professional Development?'}
          value={formatBoolean(specialExpenses?.professionalDevelopment?.hasProfessionalDevelopment)}
          readOnly={true}
        />
        
        {safeBoolean(specialExpenses?.professionalDevelopment?.hasProfessionalDevelopment) && 
         specialExpenses?.professionalDevelopment?.expenses && 
         specialExpenses?.professionalDevelopment?.expenses.length > 0 && (
          <div className="col-span-2 space-y-2">
            <div className="text-sm font-medium text-neutral-800">
              {germanT?.specialExpenses?.professionalDevelopment?.expenses || 'Weiterbildungsausgaben'} / {selectedT?.specialExpenses?.professionalDevelopment?.expenses || 'Professional Development Expenses'}
            </div>
            {specialExpenses.professionalDevelopment.expenses.map((expense: any, index: number) => (
              <div key={expense.id || index} className="flex justify-between border-b pb-2">
                <div>
                  <span className="font-medium">{expense.description}</span> - {expense.type}
                </div>
                <div className="font-medium">{formatCurrency(expense.amount)}</div>
              </div>
            ))}
          </div>
        )}
      </FormSection>

      {/* Extraordinary Burdens Section */}
      <FormSection title={<>{germanT?.extraordinaryBurdens?.title || 'Außergewöhnliche Belastungen'} / {selectedT?.extraordinaryBurdens?.title || 'Extraordinary Burdens'}</>}>
        {/* Medical Expenses */}
        <SubHeading
          germanText={germanT?.extraordinaryBurdens?.medicalExpenses?.title || 'Krankheitskosten'}
          englishText={selectedT?.extraordinaryBurdens?.medicalExpenses?.title || 'Medical Expenses'}
        />
        
        <FKInputField
          id="review-medical-expenses-has"
          mainLanguage={germanT?.extraordinaryBurdens?.medicalExpenses?.hasMedicalExpenses || 'Krankheitskosten vorhanden?'}
          selectedLanguage={selectedT?.extraordinaryBurdens?.medicalExpenses?.hasMedicalExpenses || 'Has Medical Expenses?'}
          value={formatBoolean(extraordinaryBurdens?.medicalExpenses?.hasMedicalExpenses)}
          readOnly={true}
        />
        
        {safeBoolean(extraordinaryBurdens?.medicalExpenses?.hasMedicalExpenses) && 
         extraordinaryBurdens?.medicalExpenses?.expenses && 
         extraordinaryBurdens?.medicalExpenses?.expenses.length > 0 && (
          <div className="col-span-2 space-y-2">
            <div className="text-sm font-medium text-neutral-800">
              {germanT?.extraordinaryBurdens?.medicalExpenses?.expenses || 'Medizinische Ausgaben'} / {selectedT?.extraordinaryBurdens?.medicalExpenses?.expenses || 'Medical Expenses'}
            </div>
            {extraordinaryBurdens.medicalExpenses.expenses.map((expense: any, index: number) => (
              <div key={expense.id || index} className="flex justify-between border-b pb-2">
                <div>
                  <span className="font-medium">{expense.description}</span> - {expense.type}
                </div>
                <div className="font-medium">{formatCurrency(expense.amount)}</div>
              </div>
            ))}
          </div>
        )}
        
        {/* Care Costs */}
        <SubHeading
          germanText={germanT?.extraordinaryBurdens?.careCosts?.title || 'Pflegekosten'}
          englishText={selectedT?.extraordinaryBurdens?.careCosts?.title || 'Care Costs'}
        />
        
        <FKInputField
          id="review-care-costs-has"
          mainLanguage={germanT?.extraordinaryBurdens?.careCosts?.hasCareCosts || 'Pflegekosten vorhanden?'}
          selectedLanguage={selectedT?.extraordinaryBurdens?.careCosts?.hasCareCosts || 'Has Care Costs?'}
          value={formatBoolean(extraordinaryBurdens?.careCosts?.hasCareCosts)}
          readOnly={true}
        />
        
        {safeBoolean(extraordinaryBurdens?.careCosts?.hasCareCosts) && 
         extraordinaryBurdens?.careCosts?.expenses && 
         extraordinaryBurdens?.careCosts?.expenses.length > 0 && (
          <div className="col-span-2 space-y-2">
            <div className="text-sm font-medium text-neutral-800">
              {germanT?.extraordinaryBurdens?.careCosts?.expenses || 'Pflegekosten'} / {selectedT?.extraordinaryBurdens?.careCosts?.expenses || 'Care Costs'}
            </div>
            {extraordinaryBurdens.careCosts.expenses.map((expense: any, index: number) => (
              <div key={expense.id || index} className="flex justify-between border-b pb-2">
                <div>
                  <span className="font-medium">{expense.description}</span> - {expense.type}
                </div>
                <div className="font-medium">{formatCurrency(expense.amount)}</div>
              </div>
            ))}
          </div>
        )}
        
        {/* Disability Expenses */}
        <SubHeading
          germanText={germanT?.extraordinaryBurdens?.disabilityExpenses?.title || 'Behinderungsbedingte Aufwendungen'}
          englishText={selectedT?.extraordinaryBurdens?.disabilityExpenses?.title || 'Disability-Related Expenses'}
        />
        
        <FKInputField
          id="review-disability-expenses-has"
          mainLanguage={germanT?.extraordinaryBurdens?.disabilityExpenses?.hasDisabilityExpenses || 'Behinderungskosten vorhanden?'}
          selectedLanguage={selectedT?.extraordinaryBurdens?.disabilityExpenses?.hasDisabilityExpenses || 'Has Disability Expenses?'}
          value={formatBoolean(extraordinaryBurdens?.disabilityExpenses?.hasDisabilityExpenses)}
          readOnly={true}
        />
        
        {safeBoolean(extraordinaryBurdens?.disabilityExpenses?.hasDisabilityExpenses) && 
         extraordinaryBurdens?.disabilityExpenses?.expenses && 
         extraordinaryBurdens?.disabilityExpenses?.expenses.length > 0 && (
          <div className="col-span-2 space-y-2">
            <div className="text-sm font-medium text-neutral-800">
              {germanT?.extraordinaryBurdens?.disabilityExpenses?.expenses || 'Behinderungsbedingte Ausgaben'} / {selectedT?.extraordinaryBurdens?.disabilityExpenses?.expenses || 'Disability-Related Expenses'}
            </div>
            {extraordinaryBurdens.disabilityExpenses.expenses.map((expense: any, index: number) => (
              <div key={expense.id || index} className="flex justify-between border-b pb-2">
                <div>
                  <span className="font-medium">{expense.description}</span> - {expense.type}
                </div>
                <div className="font-medium">{formatCurrency(expense.amount)}</div>
              </div>
            ))}
          </div>
        )}
      </FormSection>

      {/* Business Expenses Section */}
      <FormSection title={<>{germanT?.businessInfo?.title || 'Geschäftsinformationen'} / {selectedT?.businessInfo?.title || 'Business Information'}</>}>
        <FKInputField
          id="review-business-info-isBusinessOwner"
          mainLanguage={germanT?.businessInfo?.isBusinessOwner || 'Gewerbetreibender?'}
          selectedLanguage={selectedT?.businessInfo?.isBusinessOwner || 'Business Owner?'}
          value={formatBoolean(businessInfo?.isBusinessOwner)}
          readOnly={true}
        />
        
        {safeBoolean(businessInfo?.isBusinessOwner) && (
          <>
            <FKInputField
              id="review-business-info-type"
              mainLanguage={germanT?.businessInfo?.businessType || 'Geschäftsart'}
              selectedLanguage={selectedT?.businessInfo?.businessType || 'Business Type'}
              value={businessInfo?.businessType || '-'}
              readOnly={true}
            />
            
            <FKInputField
              id="review-business-info-earnings"
              mainLanguage={germanT?.businessInfo?.businessEarnings || 'Einnahmen'}
              selectedLanguage={selectedT?.businessInfo?.businessEarnings || 'Earnings'}
              value={formatCurrency(businessInfo?.businessEarnings)}
              readOnly={true}
            />
            
            <FKInputField
              id="review-business-info-expenses"
              mainLanguage={germanT?.businessInfo?.businessExpenses || 'Ausgaben'}
              selectedLanguage={selectedT?.businessInfo?.businessExpenses || 'Expenses'}
              value={formatCurrency(businessInfo?.businessExpenses)}
              readOnly={true}
            />
            
            <SubHeading
              germanText={germanT?.businessInfo?.businessAddress?.title || 'Geschäftsadresse'}
              englishText={selectedT?.businessInfo?.businessAddress?.title || 'Business Address'}
            />
            
            <FKInputField
              id="review-business-address-street"
              mainLanguage={germanT?.address?.street || 'Straße'}
              selectedLanguage={selectedT?.address?.street || 'Street'}
              value={businessInfo?.businessAddress?.street || '-'}
              readOnly={true}
            />
            
            <FKInputField
              id="review-business-address-houseNumber"
              mainLanguage={germanT?.address?.houseNumber || 'Hausnummer'}
              selectedLanguage={selectedT?.address?.houseNumber || 'House Number'}
              value={businessInfo?.businessAddress?.houseNumber || '-'}
              readOnly={true}
            />
            
            <FKInputField
              id="review-business-address-postalCode"
              mainLanguage={germanT?.address?.postalCode || 'Postleitzahl'}
              selectedLanguage={selectedT?.address?.postalCode || 'Postal Code'}
              value={businessInfo?.businessAddress?.postalCode || '-'}
              readOnly={true}
            />
            
            <FKInputField
              id="review-business-address-city"
              mainLanguage={germanT?.address?.city || 'Stadt'}
              selectedLanguage={selectedT?.address?.city || 'City'}
              value={businessInfo?.businessAddress?.city || '-'}
              readOnly={true}
            />
          </>
        )}
      </FormSection>
      
      {/* Craftsmen Services Section */}
      <FormSection title={<>{germanT?.craftsmenServices?.title || 'Handwerkerleistungen'} / {selectedT?.craftsmenServices?.title || 'Craftsmen Services'}</>}>
        <FKInputField
          id="review-has-maintenance-payments"
          mainLanguage={germanT?.craftsmenServices?.hasMaintenancePayments || 'Unterhaltszahlungen?'}
          selectedLanguage={selectedT?.craftsmenServices?.hasMaintenancePayments || 'Maintenance Payments?'}
          value={formatBoolean(craftsmenServices?.hasMaintenancePayments)}
          readOnly={true}
        />
        
        {safeBoolean(craftsmenServices?.hasMaintenancePayments) && (
          <>
            <FKInputField
              id="review-maintenance-recipient"
              mainLanguage={germanT?.craftsmenServices?.maintenanceRecipient || 'Empfänger der Unterhaltszahlungen'}
              selectedLanguage={selectedT?.craftsmenServices?.maintenanceRecipient || 'Maintenance Recipient'}
              value={craftsmenServices?.maintenanceRecipient || '-'}
              readOnly={true}
            />
            
            <FKInputField
              id="review-maintenance-amount"
              mainLanguage={germanT?.craftsmenServices?.maintenanceAmount || 'Höhe der Unterhaltszahlungen'}
              selectedLanguage={selectedT?.craftsmenServices?.maintenanceAmount || 'Maintenance Amount'}
              value={formatCurrency(craftsmenServices?.maintenanceAmount)}
              readOnly={true}
            />
            
            {craftsmenServices?.invoiceCraftsmenServices && craftsmenServices?.invoiceCraftsmenServices.length > 0 && (
              <FileDisplay
                germanLabel={germanT?.craftsmenServices?.invoiceCraftsmenServices || 'Handwerkerrechnungen'}
                label={selectedT?.craftsmenServices?.invoiceCraftsmenServices || 'Craftsmen Services Invoices'}
                value='File uploaded'
              />
            )}
          </>
        )}
      </FormSection>
    </div>
  );
};

export default TFReview; 