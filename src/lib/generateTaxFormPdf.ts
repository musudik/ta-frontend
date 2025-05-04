// Add declaration for import.meta.env
declare global {
  interface ImportMetaEnv {
    VITE_FIREBASE_STORAGE_BUCKET: string;
    VITE_FIREBASE_API_KEY: string;
    VITE_FIREBASE_AUTH_DOMAIN: string;
    VITE_FIREBASE_PROJECT_ID: string;
    VITE_FIREBASE_MESSAGING_SENDER_ID: string;
    VITE_FIREBASE_APP_ID: string;
  }
}

// Import Firebase SDK
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { jsPDF } from 'jspdf';

// Define PDF type extending from jsPDF but with explicit method definitions
type PDF = jsPDF;

// Initialize Firebase with the configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// Helper to upload files to Firebase Storage
export const uploadFilesToFirebase = async (formData: any, fullName: string): Promise<{ [key: string]: any }> => {
  // This will store the updated form data with Firebase URLs
  const updatedFormData = JSON.parse(JSON.stringify(formData)); // Deep clone
  
  try {
    // Format the date for the folder structure: YYYY-MM-DD
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    
    // Create a sanitized version of the full name for the folder name (remove special chars)
    const sanitizedName = fullName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    
    // Base path for uploads
    const basePath = `Tax-form/${dateString}/${sanitizedName}/files`;
    
    // Collect all files from the form data
    const files: Array<{ path: string, file: File, fieldPath: string }> = [];
    
    // Extract files from personalInfo section
    if (formData.personalInfo) {
      // Potentially add personal documents like ID scans, etc.
    }
    
    // Extract files from incomeInfo section
    if (formData.incomeInfo) {
      const income = formData.incomeInfo;
      
      // Tax certificate
      if (income.employment?.taxCertificate?.length > 0) {
        income.employment.taxCertificate.forEach((file: any, index: number) => {
          if (file && file.name) {
            files.push({
              path: `${basePath}/income/employment/tax-certificate-${index + 1}`,
              file,
              fieldPath: `incomeInfo.employment.taxCertificate.${index}`
            });
          }
        });
      }
      
      // Bank certificate
      if (income.investments?.bankCertificate?.length > 0) {
        income.investments.bankCertificate.forEach((file: any, index: number) => {
          if (file && file.name) {
            files.push({
              path: `${basePath}/income/investments/bank-certificate-${index + 1}`,
              file,
              fieldPath: `incomeInfo.investments.bankCertificate.${index}`
            });
          }
        });
      }
      
      // Foreign income tax certificate
      if (income.foreignIncomeTaxCertificateFile?.length > 0) {
        income.foreignIncomeTaxCertificateFile.forEach((file: any, index: number) => {
          if (file && file.name) {
            files.push({
              path: `${basePath}/income/foreign/tax-certificate-${index + 1}`,
              file,
              fieldPath: `incomeInfo.foreignIncomeTaxCertificateFile.${index}`
            });
          }
        });
      }
    }
    
    // Extract files from expenses section
    if (formData.expenses) {
      const expenses = formData.expenses;
      
      // Work-related expenses files
      const workRelatedExpenses = expenses.workRelatedExpenses || formData.workRelatedExpenses;
      if (workRelatedExpenses) {
        // Business trip proofs
        if (workRelatedExpenses.businessTripsCosts?.proof?.length > 0) {
          workRelatedExpenses.businessTripsCosts.proof.forEach((file: any, index: number) => {
            if (file && file.name) {
              const fieldPath = formData.expenses ? 
                `expenses.workRelatedExpenses.businessTripsCosts.proof.${index}` : 
                `workRelatedExpenses.businessTripsCosts.proof.${index}`;
              
              files.push({
                path: `${basePath}/expenses/work-related/business-trips-${index + 1}`,
                file,
                fieldPath
              });
            }
          });
        }
        
        // Work equipment files
        if (workRelatedExpenses.workEquipment?.expenses) {
          workRelatedExpenses.workEquipment.expenses.forEach((expense: any, expIndex: number) => {
            if (expense.file && expense.file.length > 0) {
              expense.file.forEach((file: any, fileIndex: number) => {
                if (file && file.name) {
                  const fieldPath = formData.expenses ? 
                    `expenses.workRelatedExpenses.workEquipment.expenses.${expIndex}.file.${fileIndex}` : 
                    `workRelatedExpenses.workEquipment.expenses.${expIndex}.file.${fileIndex}`;
                  
                  files.push({
                    path: `${basePath}/expenses/work-related/equipment-${expIndex + 1}-${fileIndex + 1}`,
                    file,
                    fieldPath
                  });
                }
              });
            }
          });
        }
      }
      
      // Special expenses files
      if (expenses.specialExpenses) {
        const specialExpenses = expenses.specialExpenses;
        
        // Insurance expenses
        if (specialExpenses.insurance?.expenses) {
          specialExpenses.insurance.expenses.forEach((expense: any, expIndex: number) => {
            if (expense.file && expense.file.length > 0) {
              expense.file.forEach((file: any, fileIndex: number) => {
                if (file && file.name) {
                  files.push({
                    path: `${basePath}/expenses/special/insurance-${expIndex + 1}-${fileIndex + 1}`,
                    file,
                    fieldPath: `expenses.specialExpenses.insurance.expenses.${expIndex}.file.${fileIndex}`
                  });
                }
              });
            }
          });
        }
        
        // Donation expenses
        if (specialExpenses.donations?.expenses) {
          specialExpenses.donations.expenses.forEach((expense: any, expIndex: number) => {
            if (expense.file && expense.file.length > 0) {
              expense.file.forEach((file: any, fileIndex: number) => {
                if (file && file.name) {
                  files.push({
                    path: `${basePath}/expenses/special/donations-${expIndex + 1}-${fileIndex + 1}`,
                    file,
                    fieldPath: `expenses.specialExpenses.donations.expenses.${expIndex}.file.${fileIndex}`
                  });
                }
              });
            }
          });
        }
        
        // Professional development expenses
        if (specialExpenses.professionalDevelopment?.expenses) {
          specialExpenses.professionalDevelopment.expenses.forEach((expense: any, expIndex: number) => {
            if (expense.file && expense.file.length > 0) {
              expense.file.forEach((file: any, fileIndex: number) => {
                if (file && file.name) {
                  files.push({
                    path: `${basePath}/expenses/special/professional-dev-${expIndex + 1}-${fileIndex + 1}`,
                    file,
                    fieldPath: `expenses.specialExpenses.professionalDevelopment.expenses.${expIndex}.file.${fileIndex}`
                  });
                }
              });
            }
          });
        }
      }
      
      // Extraordinary burdens files
      if (expenses.extraordinaryBurdens) {
        const extraBurdens = expenses.extraordinaryBurdens;
        
        // Medical expenses
        if (extraBurdens.medicalExpenses?.expenses) {
          extraBurdens.medicalExpenses.expenses.forEach((expense: any, expIndex: number) => {
            if (expense.file && expense.file.length > 0) {
              expense.file.forEach((file: any, fileIndex: number) => {
                if (file && file.name) {
                  files.push({
                    path: `${basePath}/expenses/extraordinary/medical-${expIndex + 1}-${fileIndex + 1}`,
                    file,
                    fieldPath: `expenses.extraordinaryBurdens.medicalExpenses.expenses.${expIndex}.file.${fileIndex}`
                  });
                }
              });
            }
          });
        }
      }
    }
    
    // Upload PDF itself
    // Note: This will be handled separately after PDF generation
    
    // Upload all collected files
    console.log(`Uploading ${files.length} files to Firebase Storage...`);
    
    // Upload files in parallel with max concurrency of 5
    const uploadBatch = async (batch: typeof files) => {
      const promises = batch.map(async ({path, file, fieldPath}) => {
        try {
          // Create a reference to the file location
          const fileRef = ref(storage, path);
          
          // Upload the file
          await uploadBytes(fileRef, file);
          console.log(`File uploaded successfully: ${path}`);
          
          try {
            // Get the download URL for future reference
            const downloadURL = await getDownloadURL(fileRef);
            console.log(`Download URL: ${downloadURL}`);
            
            // Update the form data with the download URL
            const fieldPathParts = fieldPath.split('.');
            let current = updatedFormData;
            
            // Navigate to the parent object that contains the file
            for (let i = 0; i < fieldPathParts.length - 1; i++) {
              const part = fieldPathParts[i];
              if (!(part in current)) {
                current[part] = {};
              }
              current = current[part];
            }
            
            // If the field doesn't exist or is not an object, initialize it
            const lastPart = fieldPathParts[fieldPathParts.length - 1];
            if (!current[lastPart]) {
              current[lastPart] = {};
            }
            
            // Update the file object with the URL
            current[lastPart] = { 
              ...file,  // Keep original file properties
              url: downloadURL, // Add download URL
              name: file.name
            };
            
            return { path, url: downloadURL, status: 'success', fieldPath };
          } catch (downloadError) {
            // The file was uploaded but we can't get the download URL due to permission restrictions
            console.log(`File uploaded successfully, but download URL cannot be retrieved due to permission restrictions: ${path}`);
            return { path, url: null, status: 'upload-only', fieldPath };
          }
        } catch (error) {
          console.error(`Error uploading file ${path}:`, error);
          return { path, url: null, status: 'failed', fieldPath };
        }
      });
      
      return Promise.all(promises);
    };
    
    // Process files in batches of 5
    const batchSize = 5;
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      await uploadBatch(batch);
    }
    
    console.log('All files uploaded successfully');
    return updatedFormData;
    
  } catch (error) {
    console.error('Error uploading files to Firebase:', error);
    throw new Error('Failed to upload files to Firebase Storage');
  }
};

// Upload the generated PDF to Firebase Storage
const uploadPdfToFirebase = async (pdfBlob: Blob, fullName: string): Promise<string | null> => {
  try {
    // Format the date for the folder structure: YYYY-MM-DD
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    
    // Create a sanitized version of the full name for the folder name
    const sanitizedName = fullName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    
    // Path for the PDF
    const pdfPath = `Tax-form/${dateString}/${sanitizedName}/tax-form-summary.pdf`;
    
    // Create a reference to the PDF location
    const pdfRef = ref(storage, pdfPath);
    
    // Upload the PDF
    await uploadBytes(pdfRef, pdfBlob);
    console.log(`PDF uploaded successfully: ${pdfPath}`);
    
    try {
      // Get the download URL
      const downloadURL = await getDownloadURL(pdfRef);
      console.log(`PDF Download URL: ${downloadURL}`);
      return downloadURL;
    } catch (downloadError) {
      console.log(`PDF uploaded successfully, but download URL cannot be retrieved due to permission restrictions: ${pdfPath}`);
      return null;
    }
  } catch (error) {
    console.error('Error uploading PDF to Firebase:', error);
    throw new Error('Failed to upload PDF to Firebase Storage');
  }
};

// Helper to format boolean values for PDF
// const formatBooleanPdf = (value: boolean | undefined | null, germanT: any, selectedT: any): string => {
//   if (value === undefined || value === null) return '-';
//   const yes = selectedT?.common?.yes || 'Yes';
//   const no = selectedT?.common?.no || 'No';
//   const germanYes = germanT?.common?.yes || 'Ja';
//   const germanNo = germanT?.common?.no || 'Nein';
//   return value ? `${germanYes} / ${yes}` : `${germanNo} / ${no}`;
// };

// // Helper to format currency values for PDF
// const formatCurrencyPdf = (value: number | string | undefined | null): string => {
//   const numValue = typeof value === 'string' ? parseFloat(value) : value;
//   if (numValue === undefined || numValue === null || isNaN(numValue)) return '-';
//   if (numValue === 0) return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(0);
//   return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(numValue);
// };

// Helper to draw a field block (3 lines: DE label, Sel label, Value) vertically
// Returns the total height used by the block.
// const addField = (doc: PDF, baseXPos: number, yPos: number, indent: number, germanLabel: string, selectedLabel: string, value: string, columnWidth: number): number => {
//   const finalXPos = baseXPos + indent;
//   const actualWidth = columnWidth - indent;
//   const labelLineHeight = 5; // Line height for labels
//   const valueLineHeight = 6; // Line height for value
//   let currentY = yPos;

//   // German Label (Bold)
//   doc.setFontSize(10);
//   doc.setFont('helvetica', 'bold');
//   const splitGermanLabel = doc.splitTextToSize(germanLabel || 'Label (DE)', actualWidth);
//   doc.text(splitGermanLabel, finalXPos, currentY);
//   currentY += splitGermanLabel.length * labelLineHeight;

//   // Selected Language Label (Smaller, lighter)
//   doc.setFont('helvetica', 'normal');
//   doc.setFontSize(9);
//   doc.setTextColor(100);
//   const splitSelectedLabel = doc.splitTextToSize(selectedLabel || 'Label', actualWidth);
//   doc.text(splitSelectedLabel, finalXPos, currentY);
//   currentY += splitSelectedLabel.length * labelLineHeight;
//   doc.setTextColor(0); // Reset color

//   // Value (Normal)
//   doc.setFontSize(10);
//   doc.setFont('helvetica', 'normal');
//   const splitValue = doc.splitTextToSize(value || '-', actualWidth);
//   doc.text(splitValue, finalXPos, currentY);
//   currentY += splitValue.length * valueLineHeight;
  
//   // Add a little padding below the value
//   currentY += 3; // Increased padding slightly

//   // Return the total height consumed by this block
//   return currentY - yPos;
// };

// Helper to add a section title - Resets columns
// const addSectionTitle = (doc: PDF, yPositions: { col1: number, col2: number }, columnState: { nextCol: number }, pageHeight: number, bottomMargin: number, germanTitle: string, selectedTitle: string, forceNewPage: boolean = true) => {
//   const lineHeight = 10;
//   const titleY = Math.max(yPositions.col1, yPositions.col2) + lineHeight; // Position below the highest column content + spacing

//   // Always start a new page for section titles if forceNewPage is true
//   if (forceNewPage || titleY + lineHeight > pageHeight - bottomMargin) {
//     doc.addPage();
//     yPositions.col1 = 20;
//     yPositions.col2 = 20;
    
//     // Add page number at the bottom of each new page
//     addPageNumber(doc);
//   } else {
//     yPositions.col1 = titleY; // Align both columns before drawing title
//     yPositions.col2 = titleY;
//   }

//   // Draw title on two lines with different colors
//   doc.setFontSize(14);
//   doc.setFont('helvetica', 'bold');
//   doc.setTextColor(0, 0, 0); // Main language in black
//   doc.text(germanTitle, 20, yPositions.col1);
  
//   // Selected language in lighter gray below
//   doc.setFontSize(12);
//   doc.setTextColor(120, 120, 120); // Lighter gray color
//   doc.text(selectedTitle, 20, yPositions.col1 + 8);
//   doc.setTextColor(0); // Reset to black
  
//   const newY = yPositions.col1 + lineHeight + (lineHeight); // Position for next content with additional space
//   yPositions.col1 = newY;
//   yPositions.col2 = newY;
//   columnState.nextCol = 1; // Reset to start in column 1 after a title
// };

// // Helper to add a sub-section title - Resets columns and applies indent for drawing
// const addSubHeading = (doc: PDF, yPositions: { col1: number, col2: number }, columnState: { nextCol: number }, pageHeight: number, bottomMargin: number, indent: number, germanTitle: string, selectedTitle: string) => {
//   const lineHeight = 8;
//   const titleY = Math.max(yPositions.col1, yPositions.col2) + lineHeight / 2; // Position below the highest column content + spacing

//   if (titleY + lineHeight > pageHeight - bottomMargin) {
//     doc.addPage();
//     yPositions.col1 = 20;
//     yPositions.col2 = 20;
    
//     // Add page number at the bottom of each new page
//     addPageNumber(doc);
//   } else {
//       yPositions.col1 = titleY; // Align both columns
//       yPositions.col2 = titleY;
//   }

//   // Draw sub-heading on two lines with different colors
//   doc.setFontSize(12);
//   doc.setFont('helvetica', 'bold');
//   doc.setTextColor(80, 80, 80); // Darker gray for main language
//   doc.text(germanTitle, 20 + indent, yPositions.col1);
  
//   // Selected language in lighter gray below
//   doc.setFontSize(10);
//   doc.setTextColor(140, 140, 140); // Lighter gray
//   doc.text(selectedTitle, 20 + indent, yPositions.col1 + 6);
//   doc.setTextColor(0); // Reset to black
  
//   const newY = yPositions.col1 + lineHeight + (lineHeight);
//   yPositions.col1 = newY;
//   yPositions.col2 = newY;
//   columnState.nextCol = 1; // Reset to start in column 1
// };

// Helper to add page number
const addPageNumber = (doc: PDF) => {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100); // Gray color for page numbers
  doc.text(`${doc.getNumberOfPages()}`, pageWidth/2, pageHeight - 10, { align: 'center' });
  doc.setTextColor(0); // Reset to black
};

// Function to generate a PDF summary of the tax form submission
export const generateTaxFormPdf = async (formData: any, germanI18nData: any, i18nData: any): Promise<string | null> => {
  try {
    const doc = new jsPDF();
    //const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20; // Left and right margins
    //const bottomMargin = 20; // Bottom margin
    
    // Column settings
    //const columnWidth = (pageWidth - 2 * margin) / 2; // Two equal columns
    //const xPositions = [margin, margin + columnWidth]; // X-positions for columns 1 and 2
    let yPositions = { col1: margin, col2: margin }; // Current Y-positions for each column
    //const columnState = { nextCol: 1 }; // Keep track of which column to use next
    
    // Set up custom page numbering
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    addPageNumber(doc);
    
    // Helper function to draw a field in the next available column
    // const drawFieldInNextColumn = (germanLabel: string, selectedLabel: string, value: string) => {
    //   // Determine which column to use
    //   const colIndex = columnState.nextCol;
    //   const xPos = xPositions[colIndex - 1]; // Adjust for 0-based indexing
    //   const yPos = yPositions[`col${colIndex}`];
      
    //   // Calculate needed height for this field
    //   // Get the height used by drawing the field
    //   const heightUsed = addField(doc, xPos, yPos, 0, germanLabel, selectedLabel, value, columnWidth);
      
    //   // Update the y-position for this column
    //   yPositions[`col${colIndex}`] = yPos + heightUsed;
      
    //   // Check if bottom of page reached
    //   if (yPositions[`col${colIndex}`] + 50 > pageHeight - bottomMargin) { // 50 is a buffer height
    //     doc.addPage();
    //     yPositions = { col1: margin, col2: margin }; // Reset Y-positions on new page
    //     addPageNumber(doc);
    //     columnState.nextCol = 1; // Reset to column 1 on new page
    //   } else {
    //     // Toggle to the other column for next field
    //     columnState.nextCol = colIndex === 1 ? 2 : 1;
    //   }
    // };
    
    // Get the full name for the PDF title and upload path
    const firstName = formData.personalInfo?.firstName || '';
    const lastName = formData.personalInfo?.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim() || 'Anonymous';
    
    // Helper to get translations
    // const getTranslation = (section: string, key: string, defaultValue: string): { german: string, selected: string } => {
    //   const germanValue = germanI18nData?.taxForm?.[section]?.[key] || defaultValue;
    //   const selectedValue = i18nData?.taxForm?.[section]?.[key] || defaultValue;
    //   return { german: germanValue, selected: selectedValue };
    // };
    
    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    const title = {
      german: germanI18nData?.formTitle || 'Deutsche Steuererklärung',
      selected: i18nData?.formTitle || 'German Tax Return'
    };
    doc.text(title.german, pageWidth / 2, margin, { align: 'center' });
    
    doc.setFontSize(16);
    doc.text(title.selected, pageWidth / 2, margin + 10, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text(`${fullName} - ${formData.applicationId || ''}`, pageWidth / 2, margin + 20, { align: 'center' });
    
    doc.setFontSize(12);
    const submissionDate = new Date().toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    doc.text(`Datum / Date: ${submissionDate}`, pageWidth / 2, margin + 30, { align: 'center' });
    
    yPositions.col1 = margin + 40; // Set starting Y position after the title
    yPositions.col2 = margin + 40;
    
    // All sections below - continue with existing code
    // Personal Information Section
    // ...
    
    // Upload files to Firebase and get the PDF URL
    try {
      // Upload all attachments from the form
      //const updatedFormData = await uploadFilesToFirebase(formData, fullName);
      
      // Get the PDF as a blob and upload it too
      const pdfBlob = doc.output('blob');
      
      // Upload the PDF to Firebase and get the download URL
      const pdfUrl = await uploadPdfToFirebase(pdfBlob, fullName);
      
      // Automatically download the PDF to the user's device if needed
      // Comment out if not required
      doc.save('tax-return-summary.pdf');
      
      // Return the PDF URL
      return pdfUrl;
      
    } catch (error) {
      console.error('Error uploading files to Firebase:', error);
      
      // Just save the PDF locally without uploading if there's an error
      doc.save('tax-return-summary.pdf');
      
      return null;
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}; 