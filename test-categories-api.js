// Simple script to test the categories API endpoint
const fetch = require('node-fetch');

async function testCategoriesAPI() {
  console.log('🔍 Testing categories API endpoint...');
  
  try {
    // Step 1: Get authentication token
    console.log('📝 Getting authentication token...');
    const authResponse = await fetch('http://localhost:3000/api/better-auth/sign-in', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin1234'
      })
    });
    
    if (!authResponse.ok) {
      throw new Error(`Authentication failed: ${authResponse.status} ${await authResponse.text()}`);
    }
    
    const authData = await authResponse.json();
    const token = authData.token;
    
    if (!token) {
      throw new Error('No token found in authentication response');
    }
    
    console.log('✅ Authentication successful, got token');
    
    // Step 2: Test GET /api/admin/categories
    console.log('📝 Testing GET /api/admin/categories...');
    const categoriesResponse = await fetch('http://localhost:3000/api/admin/categories', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const categoriesData = await categoriesResponse.json();
    
    if (categoriesResponse.ok) {
      console.log('✅ Categories API endpoint is working!');
      console.log(`📋 Found ${categoriesData.length} categories:`);
      categoriesData.forEach(category => {
        console.log(`   - ${category.name} (${category._count.resources} resources)`);
      });
      return true;
    } else {
      console.error('❌ Categories API endpoint failed:');
      console.error(`   Status: ${categoriesResponse.status}`);
      console.error(`   Response:`, categoriesData);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:');
    console.error(error);
    return false;
  }
}

testCategoriesAPI()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
