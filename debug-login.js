const axios = require('axios');
const { createAuthClient } = require('better-auth/react');
const { usernameClient } = require('better-auth/client/plugins');

// Create a simple HTTP client to test the login API
async function testDirectApiLogin() {
  console.log('=== Testing Direct API Login ===');
  try {
    const response = await axios.post('http://localhost:3000/api/better-auth/sign-in/username', {
      username: 'helper',
      password: 'helper123'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      withCredentials: true
    });
    
    console.log('✓ Direct API Login Success');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    console.log('Cookies:', response.headers['set-cookie'] || []);
    return true;
  } catch (error) {
    console.log('✗ Direct API Login Failed');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data || error.message);
    return false;
  }
}

// Test with Better Auth client library
async function testBetterAuthClientLogin() {
  console.log('\n=== Testing Better Auth Client Login ===');
  
  try {
    const authClient = createAuthClient({
      baseURL: 'http://localhost:3000/api/better-auth',
      plugins: [usernameClient()]
    });
    
    const result = await authClient.signIn.username({
      username: 'helper',
      password: 'helper123'
    });
    
    console.log('✓ Better Auth Client Login Success');
    console.log('Result:', JSON.stringify(result, null, 2));
    return true;
  } catch (error) {
    console.log('✗ Better Auth Client Login Failed');
    console.log('Error:', error.response?.data || error.message);
    return false;
  }
}

// Run both tests
async function runTests() {
  console.log('Starting login tests...\n');
  
  const directApiSuccess = await testDirectApiLogin();
  const clientLoginSuccess = await testBetterAuthClientLogin();
  
  console.log('\n=== Test Summary ===');
  console.log('Direct API Login:', directApiSuccess ? '✓ PASS' : '✗ FAIL');
  console.log('Better Auth Client Login:', clientLoginSuccess ? '✓ PASS' : '✗ FAIL');
}

runTests();
