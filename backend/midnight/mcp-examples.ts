/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MCP CLIENT EXAMPLES - Learn By Doing!
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * 🎯 WHAT THIS FILE IS:
 * Real, working examples showing you how to use the MCP client.
 * Copy these examples into your own code!
 * 
 * 🏃 HOW TO RUN THESE:
 * ```bash
 * cd /home/js/CascadeProjects/AgenticDID-MAIN/AgenticDID_REAL-DEAL/backend/midnight
 * npx tsx mcp-examples.ts
 * ```
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { MidnightMCPClient, createMCPClient } from './mcp-client';

// ┌─────────────────────────────────────────────────────────────────┐
// │ CONFIGURATION - Update This For Your Setup!                     │
// └─────────────────────────────────────────────────────────────────┘

// BREADCRUMB: Path to your Midnight MCP server
// This is where the MCP server lives - update if different!
const MCP_SERVER_PATH = '/home/js/CascadeProjects/AgenticDID-MAIN/I-am-midnight/midnight-mcp-johns_copy/dist/stdio-server.js';

// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE 1: Simple Connection Test
// ═══════════════════════════════════════════════════════════════════════════
/**
 * BREADCRUMB: The simplest possible example
 * This connects to Midnight and checks if it's working
 */
async function example1_SimpleConnection() {
  console.log('\n📋 EXAMPLE 1: Simple Connection Test');
  console.log('═══════════════════════════════════════\n');

  try {
    // STEP 1: Create the client (using the easy factory function)
    console.log('1️⃣  Creating MCP client...');
    const client = await createMCPClient('example-agent', MCP_SERVER_PATH);
    
    // STEP 2: Check health
    console.log('2️⃣  Checking health...');
    const health = await client.healthCheck();
    console.log('   Health:', health);
    
    // STEP 3: Get wallet status
    console.log('3️⃣  Getting wallet status...');
    const status = await client.getWalletStatus();
    console.log('   Status:', JSON.stringify(status, null, 2));
    
    // STEP 4: Clean up
    console.log('4️⃣  Disconnecting...');
    await client.disconnect();
    
    console.log('\n✅ Example 1 Complete!\n');
    
  } catch (error) {
    console.error('❌ Example 1 Failed:', error);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE 2: Check Wallet Balance
// ═══════════════════════════════════════════════════════════════════════════
/**
 * BREADCRUMB: Check how much tDUST an agent has
 * This is useful for testing and debugging
 */
async function example2_CheckBalance() {
  console.log('\n📋 EXAMPLE 2: Check Wallet Balance');
  console.log('═══════════════════════════════════════\n');

  try {
    // BREADCRUMB: Connect with a specific agent ID
    console.log('1️⃣  Connecting as verifier-agent...');
    const client = await createMCPClient('verifier-agent', MCP_SERVER_PATH);
    
    // BREADCRUMB: Get the wallet address
    console.log('2️⃣  Getting wallet address...');
    const addressResult = await client.getWalletAddress();
    if (addressResult.success) {
      console.log('   Address:', addressResult.data);
    }
    
    // BREADCRUMB: Check the balance
    console.log('3️⃣  Checking balance...');
    const balanceResult = await client.getWalletBalance();
    if (balanceResult.success) {
      console.log('   Balance:', balanceResult.data);
    } else {
      console.log('   Error:', balanceResult.error);
    }
    
    // BREADCRUMB: Clean up
    await client.disconnect();
    
    console.log('\n✅ Example 2 Complete!\n');
    
  } catch (error) {
    console.error('❌ Example 2 Failed:', error);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE 3: Verify a Transaction (The Important One!)
// ═══════════════════════════════════════════════════════════════════════════
/**
 * BREADCRUMB: This shows how to verify an agent's credential on-chain
 * 
 * THE REAL-WORLD FLOW:
 * 1. Agent presents a credential with a transaction hash
 * 2. You call verifyTransaction() with that hash
 * 3. Midnight blockchain checks if it's valid
 * 4. You get back the verification result
 * 5. You allow or deny the agent's action
 */
async function example3_VerifyTransaction() {
  console.log('\n📋 EXAMPLE 3: Verify Transaction');
  console.log('═══════════════════════════════════════\n');

  try {
    const client = await createMCPClient('verifier-agent', MCP_SERVER_PATH);
    
    // BREADCRUMB: In real use, you'd get this from the agent's credential
    // For this example, we'll use a dummy hash (this will likely fail)
    const exampleTxHash = 'abc123...'; // Replace with real hash in production
    
    console.log('1️⃣  Verifying transaction:', exampleTxHash);
    const verifyResult = await client.verifyTransaction(exampleTxHash);
    
    if (verifyResult.success) {
      console.log('   ✅ Transaction verified on blockchain!');
      console.log('   Data:', JSON.stringify(verifyResult.data, null, 2));
    } else {
      console.log('   ❌ Verification failed:', verifyResult.error);
      console.log('   (This is expected for dummy hash)');
    }
    
    await client.disconnect();
    
    console.log('\n✅ Example 3 Complete!\n');
    
  } catch (error) {
    console.error('❌ Example 3 Failed:', error);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE 4: Multiple Agents (Different Wallets)
// ═══════════════════════════════════════════════════════════════════════════
/**
 * BREADCRUMB: Each agent gets its own isolated wallet!
 * This example shows multiple agents with different wallets
 */
async function example4_MultipleAgents() {
  console.log('\n📋 EXAMPLE 4: Multiple Agents');
  console.log('═══════════════════════════════════════\n');

  try {
    // BREADCRUMB: Create three different agents
    console.log('1️⃣  Creating three agents...\n');
    
    const bankerAgent = await createMCPClient('banker-agent', MCP_SERVER_PATH);
    const shopperAgent = await createMCPClient('shopper-agent', MCP_SERVER_PATH);
    const travelerAgent = await createMCPClient('traveler-agent', MCP_SERVER_PATH);
    
    // BREADCRUMB: Get balance for each agent
    console.log('2️⃣  Checking balances...\n');
    
    console.log('   Banker Agent:');
    const bankerBalance = await bankerAgent.getWalletBalance();
    console.log('   ', bankerBalance);
    
    console.log('\n   Shopper Agent:');
    const shopperBalance = await shopperAgent.getWalletBalance();
    console.log('   ', shopperBalance);
    
    console.log('\n   Traveler Agent:');
    const travelerBalance = await travelerAgent.getWalletBalance();
    console.log('   ', travelerBalance);
    
    // BREADCRUMB: Clean up all connections
    console.log('\n3️⃣  Disconnecting all agents...');
    await bankerAgent.disconnect();
    await shopperAgent.disconnect();
    await travelerAgent.disconnect();
    
    console.log('\n✅ Example 4 Complete!\n');
    console.log('💡 Notice: Each agent has its own separate wallet!');
    
  } catch (error) {
    console.error('❌ Example 4 Failed:', error);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE 5: Error Handling
// ═══════════════════════════════════════════════════════════════════════════
/**
 * BREADCRUMB: Always check for errors!
 * This shows proper error handling patterns
 */
async function example5_ErrorHandling() {
  console.log('\n📋 EXAMPLE 5: Error Handling');
  console.log('═══════════════════════════════════════\n');

  try {
    const client = await createMCPClient('error-test-agent', MCP_SERVER_PATH);
    
    // BREADCRUMB: Method 1 - Check success flag
    console.log('1️⃣  Method 1: Check success flag\n');
    const result1 = await client.getWalletBalance();
    if (result1.success) {
      console.log('   ✅ Success:', result1.data);
    } else {
      console.log('   ❌ Failed:', result1.error);
    }
    
    // BREADCRUMB: Method 2 - Try-catch
    console.log('\n2️⃣  Method 2: Try-catch\n');
    try {
      const result2 = await client.verifyTransaction('invalid-hash');
      if (result2.success) {
        console.log('   Verified!');
      } else {
        console.log('   Not verified:', result2.error);
      }
    } catch (err) {
      console.log('   Exception caught:', err);
    }
    
    await client.disconnect();
    
    console.log('\n✅ Example 5 Complete!\n');
    console.log('💡 Always check .success before using .data');
    
  } catch (error) {
    console.error('❌ Example 5 Failed:', error);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE 6: Integration with Your API
// ═══════════════════════════════════════════════════════════════════════════
/**
 * BREADCRUMB: How to use this in your Express/Fastify API
 * 
 * This is a mock example showing how to integrate MCP into your API endpoints
 */
async function example6_APIIntegration() {
  console.log('\n📋 EXAMPLE 6: API Integration Pattern');
  console.log('═══════════════════════════════════════\n');

  console.log('In your API (Express/Fastify), you would do this:\n');
  
  console.log(`
// ════════════════════════════════════════════════════════════
// YOUR API FILE (e.g., api.ts or routes.ts)
// ════════════════════════════════════════════════════════════

import { createMCPClient } from './midnight/mcp-client';

// BREADCRUMB: Create a global MCP client (or one per request)
let mcpClient;

// BREADCRUMB: Initialize on server startup
async function initializeMidnight() {
  mcpClient = await createMCPClient(
    'api-verifier-agent',
    '/path/to/stdio-server.js'
  );
  console.log('Midnight MCP connected!');
}

// BREADCRUMB: Use in your API endpoint
app.post('/api/verify-credential', async (req, res) => {
  const { credentialHash, txHash } = req.body;
  
  // STEP 1: Verify on Midnight blockchain
  const result = await mcpClient.verifyTransaction(txHash);
  
  // STEP 2: Check result
  if (result.success) {
    // STEP 3: Credential is valid!
    res.json({
      verified: true,
      onChain: true,
      data: result.data
    });
  } else {
    // STEP 4: Credential failed verification
    res.status(403).json({
      verified: false,
      error: result.error
    });
  }
});

// BREADCRUMB: Clean up on server shutdown
process.on('SIGTERM', async () => {
  await mcpClient.disconnect();
});
  `);
  
  console.log('\n✅ Example 6 Complete!\n');
  console.log('💡 Copy this pattern into your API code');
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN FUNCTION - Run All Examples
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║          MCP CLIENT EXAMPLES - LEARN BY DOING!            ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  
  // BREADCRUMB: Uncomment the examples you want to run
  
  await example1_SimpleConnection();
  // await example2_CheckBalance();
  // await example3_VerifyTransaction();
  // await example4_MultipleAgents();
  // await example5_ErrorHandling();
  await example6_APIIntegration();
  
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║                    ALL EXAMPLES DONE!                     ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('\n');
  console.log('📚 Next Steps:');
  console.log('   1. Read mcp-adapter.ts to see full integration');
  console.log('   2. Check MCP_INTEGRATION_GUIDE.md for troubleshooting');
  console.log('   3. Integrate into your API endpoints');
  console.log('\n');
}

// ┌─────────────────────────────────────────────────────────────────┐
// │ RUN IT!                                                          │
// └─────────────────────────────────────────────────────────────────┘
// BREADCRUMB: This runs when you execute the file
if (require.main === module) {
  main().catch(console.error);
}

// BREADCRUMB: Export for use in other files
export {
  example1_SimpleConnection,
  example2_CheckBalance,
  example3_VerifyTransaction,
  example4_MultipleAgents,
  example5_ErrorHandling,
  example6_APIIntegration
};
