const axios = require('axios');

async function testLogin() {
  try {
    const response = await axios.post('http://localhost:3000/api/better-auth/sign-in/username', {
      username: 'helper',
      password: 'helper123'
    }, {
      withCredentials: true
    });
    
    console.log('Login API test result: SUCCESS');
    console.log('Status:', response.status);
    console.log('User:', response.data.user);
    console.log('Cookies:', response.headers['set-cookie']);
    
    return { success: true, response };
  } catch (error) {
    console.log('Login API test result: FAILURE');
    console.log('Status:', error.response?.status);
    console.log('Error message:', error.response?.data?.error?.message || error.message);
    console.log('Error details:', error.response?.data);
    
    return { success: false, error: error.response || error };
  }
}

testLogin();
