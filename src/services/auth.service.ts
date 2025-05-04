import axios from 'axios';
import { LoginCredentials, RegisterData, AuthResponse, User, UserRole } from '../types/auth';

const API_URL = import.meta.env.VITE_API_URL || 'https://tax-adviser-test.replit.app/api';

// Function to decode JWT token
const decodeToken = (token: string): Partial<User> => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  const payload = JSON.parse(jsonPayload);
  
  return {
    id: payload.sub,
    email: payload.email,
  };
};

// Function to fetch user details
const fetchUserDetails = async (token: string): Promise<User> => {
  try {
    const response = await axios.get(`${API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user details:', error);
    // If we can't fetch user details, return a basic user object with the role from the token
    const partialUser = decodeToken(token);
    return {
      id: partialUser.id!,
      email: partialUser.email!,
      firstName: '',
      lastName: '',
      role: UserRole.CLIENT, // Default role
      isEmailVerified: false,
      isMfaEnabled: false,
    };
  }
};

const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    const { access_token } = response.data;
    
    if (access_token) {
      localStorage.setItem('token', access_token);
      // Decode the token to get initial user info
      //const partialUser = decodeToken(access_token);
      // Fetch complete user details including role
      const user = await fetchUserDetails(access_token);
      return { access_token, user };
    }
    
    throw new Error('No access token received');
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, data);
      const { access_token } = response.data;
      
      if (access_token) {
        localStorage.setItem('token', access_token);
        // Decode the token to get initial user info
        //const partialUser = decodeToken(access_token);
        // Fetch complete user details including role
        const user = await fetchUserDetails(access_token);
        return { access_token, user };
      }
      
      throw new Error('No access token received');
    } catch (error: any) {
      // Log full error details for debugging
      console.error('Registration error details:', error);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      
      // Extract specific error message from response if available
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        
        // Check for various forms of unique constraint error messages
        if (errorData.message) {
          const errorMsg = errorData.message;
          console.log('Backend error message:', errorMsg);
          
          // Look for the specific constraint error
          if (errorMsg.includes('duplicate key value violates unique constraint "UQ_97672ac88f789774dd47f7c8be3"')) {
            return Promise.reject(new Error('This email address is already in use. Please try another email address.'));
          }
          
          // General duplicate key detection
          if (errorMsg.includes('duplicate key') || errorMsg.includes('unique constraint')) {
            if (errorMsg.toLowerCase().includes('email')) {
              return Promise.reject(new Error('This email address is already in use. Please try another email address.'));
            }
            
            // Generic unique constraint error
            return Promise.reject(new Error('A user with these details already exists. Please try with different information.'));
          }
          
          // Pass through other error messages from backend
          return Promise.reject(new Error(errorMsg));
        }
      }
      
      // If specific handling fails, check for status code
      if (error.response?.status === 500) {
        return Promise.reject(new Error('Server error during registration. The email may already be in use.'));
      }
      
      // If all else fails, throw generic error
      return Promise.reject(new Error('Registration failed. Please try again later.'));
    }
  },

  logout(): void {
    localStorage.removeItem('token');
  },

  getCurrentUser(): string | null {
    return localStorage.getItem('token');
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  async googleLogin(): Promise<void> {
    window.location.href = `${API_URL}/auth/google`;
  },

  async microsoftLogin(): Promise<void> {
    window.location.href = `${API_URL}/auth/microsoft`;
  },

  async enableMfa(token: string, secret: string): Promise<{ success: boolean }> {
    const response = await axios.post(
      `${API_URL}/auth/mfa/enable`,
      { secret },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  async verifyMfa(token: string, mfaToken: string): Promise<{ success: boolean }> {
    const response = await axios.post(
      `${API_URL}/auth/mfa/verify`,
      { token: mfaToken },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },
};

export default authService; 