import axios from 'axios';

// Different API URLs to check
const urls = [
  'https://tax-adviser-test.replit.app/api/auth/register',
  'https://tax-adviser-test.replit.app/api/auth/signup',
  'https://tax-adviser-test.replit.app/api/users/register',
  'https://tax-adviser-test.replit.app/api/users'
];

// Test each URL
async function testUrls() {
  for (const url of urls) {
    try {
      // Just check if the endpoint exists with OPTIONS request
      const response = await axios.options(url);
      console.log(`✅ ${url} - ${response.status}`);
    } catch (error) {
      console.log(`❌ ${url} - ${error.response?.status || 'Error'}`);
    }
  }
}

testUrls(); 