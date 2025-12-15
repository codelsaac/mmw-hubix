import { auth } from './lib/better-auth';
import { hashPassword } from 'better-auth/crypto';

// Debug the Better Auth configuration
console.log('Better Auth Configuration:');
console.log('- Base Path:', auth.config.basePath);
console.log('- Database provider:', auth.config.database?.config?.provider);

// Test password hashing
async function testPasswordHashing() {
  const testPassword = 'helper123';
  const hashed = await hashPassword(testPassword);
  console.log('\nPassword Hashing Test:');
  console.log('- Original password:', testPassword);
  console.log('- Hashed password:', hashed);
}

testPasswordHashing();