const { auth } = require('./lib/better-auth');

// Debug the Better Auth configuration
console.log('Better Auth Configuration:');
console.log('- Base Path:', auth.config.basePath);
console.log('- Username plugin enabled:', auth.config.plugins?.some(p => p?.name === 'username') || false);
console.log('- Available methods:', Object.keys(auth));

// Check if toNextJsHandler is working
const { toNextJsHandler } = require('better-auth/next-js');
console.log('\ntoNextJsHandler exists:', typeof toNextJsHandler === 'function');
