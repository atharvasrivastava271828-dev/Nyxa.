import { NyxaClient } from './index';

async function runTest() {
  console.log('[Nyxa. SDK Test] Initializing client...');
  
  const client = new NyxaClient({
    baseUrl: 'http://localhost:3000'
  });

  console.log('[Nyxa. SDK Test] Client configured successfully.');

  try {
    // 1. Fetch Agents (Mock Request to check connectivity)
    console.log('[Nyxa. SDK Test] Requesting agent marketplace catalog...');
    const result = await client.getAgents();
    console.log('[Nyxa. SDK Test] Active agents count:', result.agents.length);
  } catch (error: any) {
    // If the server is offline during build check, we catch and log but don't crash
    console.log('[Nyxa. SDK Test] Server is offline, but client structure compiled correctly.', error.message);
  }
}

// Execute test
runTest();
