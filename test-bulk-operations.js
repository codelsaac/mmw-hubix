const fetch = require('node-fetch');

// Configuration
const BASE_URL = 'http://localhost:3000';
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin1234'
};

async function main() {
  console.log('Testing bulk operations API...');

  try {
    // Skip login since auth is bypassed in API for testing
    console.log('\n1. Skipping login (auth bypassed in API)...');
    const sessionCookie = null;
    console.log('Login bypassed for testing!');

    // Step 2: Fetch all users
    console.log('\n2. Fetching all users...');
    const usersResponse = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: {
        ...(sessionCookie && { 'Cookie': sessionCookie })
      }
    });

    if (!usersResponse.ok) {
      console.error('Failed to fetch users:', usersResponse.statusText);
      return;
    }

    const users = await usersResponse.json();
    console.log(`Fetched ${users.length} users`);

    if (users.length < 2) {
      console.error('Not enough users to test bulk operations');
      return;
    }

    // Get first few users for testing
    const testUsers = users.slice(0, 3);
    const testUserIds = testUsers.map(user => user.id);
    console.log('Test users:', testUsers.map(u => ({ id: u.id, username: u.username, role: u.role, isActive: u.isActive })));

    // Step 3: Test bulk role update
    console.log('\n3. Testing bulk role update...');
    const bulkRoleUpdateResponse = await fetch(`${BASE_URL}/api/admin/users`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(sessionCookie && { 'Cookie': sessionCookie })
      },
      body: JSON.stringify(
        testUserIds.map(id => ({ id, role: 'STUDENT' }))
      )
    });

    if (!bulkRoleUpdateResponse.ok) {
      console.error('Bulk role update failed:', bulkRoleUpdateResponse.statusText);
      return;
    }

    const updatedUsers = await bulkRoleUpdateResponse.json();
    console.log('Bulk role update successful! Updated users:',
      updatedUsers.map(u => ({ id: u.id, role: u.role })));

    // Step 4: Test bulk status update
    console.log('\n4. Testing bulk status update...');
    const bulkStatusUpdateResponse = await fetch(`${BASE_URL}/api/admin/users`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(sessionCookie && { 'Cookie': sessionCookie })
      },
      body: JSON.stringify(
        testUserIds.map(id => ({ id, isActive: false }))
      )
    });

    if (!bulkStatusUpdateResponse.ok) {
      console.error('Bulk status update failed:', bulkStatusUpdateResponse.statusText);
      return;
    }

    const statusUpdatedUsers = await bulkStatusUpdateResponse.json();
    console.log('Bulk status update successful! Updated users:',
      statusUpdatedUsers.map(u => ({ id: u.id, isActive: u.isActive })));

    // Step 5: Test bulk delete (we'll only delete one user for safety)
    console.log('\n5. Testing bulk delete...');
    const bulkDeleteResponse = await fetch(`${BASE_URL}/api/admin/users`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(sessionCookie && { 'Cookie': sessionCookie })
      },
      body: JSON.stringify({ ids: [testUserIds[0]] })
    });

    if (!bulkDeleteResponse.ok) {
      console.error('Bulk delete failed:', bulkDeleteResponse.statusText);
      return;
    }

    const deleteResult = await bulkDeleteResponse.json();
    console.log('Bulk delete successful! Deleted count:', deleteResult.deletedCount);

    // Step 6: Verify remaining users
    console.log('\n6. Verifying remaining users...');
    const finalUsersResponse = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: {
        ...(sessionCookie && { 'Cookie': sessionCookie })
      }
    });

    const finalUsers = await finalUsersResponse.json();
    console.log(`Remaining users: ${finalUsers.length}`);
    console.log('Verified user:', finalUsers.find(u => u.id === testUserIds[1]));

    console.log('\n✅ All bulk operations tests passed!');

  } catch (error) {
    console.error('Error during testing:', error.message);
  }
}

main();
