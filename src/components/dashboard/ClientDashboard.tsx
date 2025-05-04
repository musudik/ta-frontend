import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import taxFormService from '../../services/taxForm.service';
import { TaxForm } from '../../types/taxForm';
import TALogo from '../../assets/TA.png';

// Define a type for the API response
interface ApiResponse {
  [key: string]: any;
}

const ClientDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [taxForms, setTaxForms] = useState<TaxForm[]>([]);
  const [showSubmittedForms, setShowSubmittedForms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [debugData, setDebugData] = useState<any>(null);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  //const navigate = useNavigate();

  useEffect(() => {
    // Add entrance animation after component mounts
    setIsPageLoaded(true);
    
    // Fetch forms whenever the user ID is available
    if (user?.id) {
      fetchTaxForms();
    }
  }, [user?.id]);

  const fetchTaxForms = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching tax forms for user ID:', user.id);
      const response = await taxFormService.getFormsByUserId(user.id);
      console.log('API Response:', JSON.stringify(response, null, 2));
      
      // Set debug data for troubleshooting
      setDebugData(response);
      
      let formsArray: TaxForm[] = [];
      
      // Handle various response formats
      if (Array.isArray(response)) {
        console.log('Response is an array');
        formsArray = response;
      } else if (response && typeof response === 'object') {
        console.log('Response is an object with structure:', Object.keys(response));
        // Try to extract forms from various possible response structures
        if (Array.isArray((response as ApiResponse).forms)) {
          formsArray = (response as ApiResponse).forms;
          console.log('Found forms array in response.forms');
        } else if (Array.isArray((response as ApiResponse).data)) {
          formsArray = (response as ApiResponse).data;
          console.log('Found forms array in response.data');
        } else if (Array.isArray((response as ApiResponse).taxForms)) {
          formsArray = (response as ApiResponse).taxForms;
          console.log('Found forms array in response.taxForms');
        }
      }
      
      // No filtering - show all forms
      console.log('Forms array:', formsArray);
      
      setTaxForms(formsArray);
      
      // Set error if no forms found
      if (formsArray.length === 0) {
        console.log('No forms found in response');
      }
    } catch (err) {
      console.error('Error fetching tax forms:', err);
      setError('Failed to load your applications. Please try again later.');
      setTaxForms([]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSubmittedForms = () => {
    setShowSubmittedForms(prev => !prev);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const reloadForms = () => {
    fetchTaxForms();
  };

  const toggleDebug = () => {
    setShowDebug(prev => !prev);
  };

  // Card component for better reusability
  const Card = ({ title, content, buttonText, buttonAction, linkTo, icon, variant = "default" }: { 
    title: string, 
    content: string, 
    buttonText?: string, 
    buttonAction?: () => void, 
    linkTo?: string,
    icon?: React.ReactNode,
    variant?: "default" | "primary" | "success" | "warning" | "info"
  }) => {
    const navigate = useNavigate();
    
    // Define color schemes based on variant
    const variantClasses = {
      default: "bg-gradient-to-br from-white to-gray-50 border-gray-200",
      primary: "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200",
      success: "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200",
      warning: "bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200",
      info: "bg-gradient-to-br from-cyan-50 to-sky-50 border-cyan-200"
    };
    
    // Function to handle card click
    const handleCardClick = () => {
      if (linkTo) {
        console.log('Navigating to:', linkTo);
        navigate(linkTo);
      }
    };
    
    // Define styles for card based on whether it's a link
    const cardStyles = `
      card rounded-xl border ${variantClasses[variant]} p-6 
      shadow-sm hover:shadow-lg transition-all duration-300 
      transform hover:-translate-y-1 relative overflow-hidden 
      ${linkTo ? 'cursor-pointer hover:border-indigo-300 hover:bg-gradient-to-br hover:from-indigo-50/50 hover:to-indigo-100/50' : ''}
    `;
    
    return (
      <div 
        className={cardStyles}
        onClick={linkTo ? handleCardClick : undefined}
        role={linkTo ? "button" : undefined}
        tabIndex={linkTo ? 0 : undefined}
        data-is-link={linkTo ? "true" : "false"}
        onKeyDown={linkTo ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick();
          }
        } : undefined}
        aria-label={linkTo ? `${title} - ${buttonText}` : undefined}
      >
        {/* Background subtle pattern - diagonal lines */}
        <div className="absolute inset-0 opacity-5 bg-pattern-diagonal"></div>
        
        <div className="flex items-start gap-4">
          {icon && (
            <div className="shrink-0 mt-1">
              {icon}
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-neutral-800 mb-3">{title}</h2>
            <p className="text-neutral-600 mb-5">{content}</p>
            
            {/* Only show button for non-link cards */}
            {buttonText && buttonAction && !linkTo && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  buttonAction();
                }}
                className="mt-2 inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors 
                bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 shadow-sm hover:shadow"
              >
                {buttonText}
                <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
            
            {/* Action indicator for link cards */}
            {buttonText && linkTo && (
              <div className="mt-2 inline-flex items-center text-sm font-medium text-indigo-600">
                {buttonText}
                <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const statusClasses = {
      submitted: "bg-green-100 text-green-800 border-green-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
      processing: "bg-blue-100 text-blue-800 border-blue-200",
      default: "bg-gray-100 text-gray-800 border-gray-200"
    };
    
    const statusClass = statusClasses[status.toLowerCase() as keyof typeof statusClasses] || statusClasses.default;
    
    return (
      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${statusClass} transition-all duration-300`}>
        {status === 'submitted' ? 'Submitted' :
         status === 'pending' ? 'Pending' :
         status === 'rejected' ? 'Rejected' :
         status === 'processing' ? 'Processing' :
         status}
      </span>
    );
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 transition-opacity duration-500 ease-in-out ${isPageLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Enhanced header with gradient and subtle animation */}
      <header className="border-b border-[#ddd6fe] bg-white shadow-md relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 opacity-60"></div>
        <div className="container mx-auto px-6 py-5 flex justify-between items-center relative z-10">
          <div className="flex items-center">
            <img src={TALogo} alt="Tax Adviser Logo" className="w-10 h-10 mr-3 rounded-lg shadow-md" />
            <h1 className="text-2xl font-bold text-neutral-800 tracking-tight">Client Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:block bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-100">
              <span className="text-sm text-neutral-600">
                Welcome, <span className="font-semibold text-indigo-700">{user?.firstName} {user?.lastName}</span>
              </span>
            </div>
            <button
              onClick={logout}
              className="flex items-center px-4 py-2 text-sm font-medium rounded-md border border-red-200 bg-white text-red-600 hover:bg-red-50 transition-colors shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        {/* Dashboard overview */}
        <div className="mb-8 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          <h2 className="text-2xl font-bold text-neutral-800 mb-2">Dashboard Overview</h2>
          <p className="text-neutral-600">Manage your tax submissions and track their status.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Tax Return Status Card */}
          <div className="animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <Card 
              title="Tax Return Status" 
              content="Submit a new tax return or review your existing ones."
              buttonText="Submit Tax Return"
              linkTo="/tax-form"
              icon={
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              }
              variant="primary"
            />
          </div>

          {/* Submitted Applications Card */}
          <div className="animate-fade-in-up" style={{animationDelay: '0.3s'}}>
            <Card 
              title="Your Applications" 
              content={taxForms.length > 0 
                ? `You have ${taxForms.length} tax application(s).` 
                : 'No tax applications found.'}
              buttonText={showSubmittedForms ? 'Hide Applications' : 'View Applications'}
              buttonAction={toggleSubmittedForms}
              icon={
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              }
              variant="success"
            />
          </div>

          {/* Resources Card */}
          <div className="animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            <Card 
              title="Tax Resources" 
              content="Find helpful resources and guides for your tax filing process."
              buttonText="View Resources"
              linkTo="/tax-form"
              icon={
                <div className="p-2 bg-amber-100 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              }
              variant="warning"
            />
          </div>
        </div>

        {/* Submitted Applications List with animations */}
        { (
          <div className="mt-10 animate-fade-in-up" style={{animationDelay: '0.5s'}}>
            <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-neutral-800">Your Tax Applications</h2>
                  <button 
                    onClick={reloadForms}
                    className="px-4 py-2 bg-white text-indigo-600 rounded-md hover:bg-indigo-50 text-sm font-medium flex items-center shadow-sm border border-indigo-100 transition-all duration-300"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {isLoading && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 relative">
                      <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-100 rounded-full animate-ping opacity-75"></div>
                      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
                    </div>
                    <p className="mt-4 text-lg text-gray-600 font-medium">Loading your applications...</p>
                    <p className="text-sm text-gray-500">This may take a moment</p>
                  </div>
                )}
                
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mb-6 animate-pulse">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error Loading Data</h3>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                        <button 
                          onClick={reloadForms} 
                          className="mt-2 text-sm text-red-800 font-medium hover:text-red-900 flex items-center"
                        >
                          Try again
                          <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {!isLoading && !error && taxForms.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="bg-gray-100 rounded-full p-6 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
                    <p className="text-gray-600 mb-6 max-w-md">You haven't created any tax applications yet. Start by creating your first tax form.</p>
                    <Link 
                      to="/tax-form"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Create Tax Form
                      <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 -mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </Link>
                  </div>
                )}
                
                {!isLoading && !error && taxForms.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Application ID
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tax Year
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Submitted Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {taxForms.map((form, index) => (
                          <tr 
                            key={form.id} 
                            className="hover:bg-gray-50 transition-colors duration-150 ease-in-out animate-fade-in"
                            style={{animationDelay: `${0.1 * (index + 1)}s`}}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{form.applicationId}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">{form.submissionYear || form.taxYear?.year || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <StatusBadge status={form.status} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">{formatDate(form.submittedAt || '')}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Link 
                                to={`/tax-form/view/${form.id}`} 
                                className="text-indigo-600 hover:text-indigo-900 font-medium flex items-center group"
                              >
                                View Details
                                <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-150" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
            
            {/* Debug Panel (only in development) */}
            <div className="mt-8 pt-4 border-t border-gray-200">
              <button 
                onClick={toggleDebug} 
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-2 rounded flex items-center space-x-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{showDebug ? 'Hide Debug Info' : 'Show Debug Info'}</span>
              </button>
              
              {showDebug && (
                <div className="mt-2 animate-fade-in">
                  <h4 className="text-sm font-bold mb-1">API Response Debug Info:</h4>
                  <div className="bg-gray-100 p-3 rounded-md overflow-auto max-h-64 text-xs">
                    <pre>{debugData ? JSON.stringify(debugData, null, 2) : 'No data'}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ClientDashboard; 