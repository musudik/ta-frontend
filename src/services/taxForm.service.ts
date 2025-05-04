import axios from 'axios';
import { TaxForm, TaxFormResponse } from '../types/taxForm';

const API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/tax-forms` 
  : '/api/tax-forms';

// Helper to get the auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

const taxFormService = {
  // Get all tax forms by user ID
  async getFormsByUserId(userId: string): Promise<TaxForm[]> {
    try {
      // Get the auth token
      const token = getAuthToken();
      
      if (!token) {
        console.error('No auth token available');
        throw new Error('Authentication required');
      }
      
      const response = await axios.get(`${API_URL}/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Raw API response:', response);
      console.log('Response data type:', typeof response.data);
      console.log('Response data:', JSON.stringify(response.data, null, 2));
      
      if (response.data && Array.isArray(response.data)) {
        console.log('Found array directly in response.data');
        return response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        console.log('Found array in response.data.data');
        return response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        // If it's a different structure, try to extract forms
        console.warn('Unexpected response structure:', response.data);
        
        // Try different possible locations of the forms array
        if (Array.isArray(response.data.forms)) {
          console.log('Found forms in response.data.forms');
          return response.data.forms;
        } else if (Array.isArray(response.data.taxForms)) {
          console.log('Found forms in response.data.taxForms');
          return response.data.taxForms;
        }
        
        // If no known property contains the forms, try to find any array
        for (const key in response.data) {
          if (Array.isArray(response.data[key])) {
            console.log(`Found array in response.data.${key}`);
            return response.data[key];
          }
        }
      }
      
      console.warn('No forms array found in the response');
      return [];
    } catch (error) {
      console.error('Error fetching tax forms:', error);
      throw error;
    }
  },

  // Get a specific tax form by application ID
  async getFormByApplicationId(applicationId: string): Promise<TaxFormResponse> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await axios.get(`${API_URL}/application/${applicationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching tax form details:', error);
      throw error;
    }
  },

  // Get a specific tax form by ID
  async getFormById(id: string): Promise<TaxFormResponse> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await axios.get(`${API_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching tax form details:', error);
      throw error;
    }
  }
};

export default taxFormService; 