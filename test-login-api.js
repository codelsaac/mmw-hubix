const axios = require('axios');

async function testLogin() {
  try {
    const response = await axios.post('http://localhost:3000/api/better-auth/sign-in/username', {
      username: 'helper',
      password: 'helper123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Login successful!');
    console.log('Response:', response.data);
  } catch (error) {
    console.log('Login failed!');
    console.log('Status:', error.response?.status);
    console.log('Data:', error.response?.data);
    console.log('Error:', error.message);
  }
}

testLogin();