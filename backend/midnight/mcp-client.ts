/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MIDNIGHT MCP CLIENT - The Bridge Between Your App and Midnight Blockchain
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * 🎯 WHAT THIS FILE DOES:
 * This file creates a client that talks to the Midnight MCP server, which then
 * talks to the real Midnight blockchain. Think of it as your app's translator.
 * 
 * 🗺️ WHERE THIS FITS:
 * Your App → THIS FILE → Midnight MCP Server → Midnight Blockchain
 * 
 * 📖 BREADCRUMB TRAIL:
 * 1. Import this class in your API
 * 2. Create an instance with your agent ID
 * 3. Call connect() to establish blockchain connection
 * 4. Use callTool() to verify credentials, check balances, etc.
 * 5. Get back REAL blockchain responses!
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ┌─────────────────────────────────────────────────────────────────┐
// │ STEP 1: Import Required Libraries                               │
// └─────────────────────────────────────────────────────────────────┘
// These are from the MCP SDK - they handle the low-level communication
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

// ┌─────────────────────────────────────────────────────────────────┐
// │ STEP 2: Define Configuration Types                              │
// └─────────────────────────────────────────────────────────────────┘
/**
 * Configuration for MCP Client
 * 
 * BREADCRUMB: This tells the client how to connect to Midnight
 */
export interface MCPConfig {
  // BREADCRUMB: Unique ID for this agent (e.g., 'verifier-agent', 'banker-agent')
  // Each agent gets its own isolated wallet and storage
  agentId: string;
  
  // BREADCRUMB: Full path to the Midnight MCP server's entry point
  // Usually: /I-am-midnight/midnight-mcp-johns_copy/dist/stdio-server.js
  mcpServerPath: string;
  
  // BREADCRUMB: Which Midnight network to use
  // 'TestNet' for testing, 'MainNet' for production (optional, defaults to TestNet)
  networkId?: string;
}

/**
 * Result from MCP Tool Calls
 * 
 * BREADCRUMB: This is what you get back from blockchain operations
 */
export interface MCPToolResult {
  // BREADCRUMB: Did the operation succeed?
  success: boolean;
  
  // BREADCRUMB: The actual data from Midnight (if successful)
  data?: any;
  
  // BREADCRUMB: Error message (if failed)
  error?: string;
}

// ┌─────────────────────────────────────────────────────────────────┐
// │ STEP 3: The Main MCP Client Class                               │
// └─────────────────────────────────────────────────────────────────┘
/**
 * Midnight MCP Client
 * 
 * BREADCRUMB: This is your main class for talking to Midnight blockchain
 * 
 * HOW TO USE:
 * ```typescript
 * const client = new MidnightMCPClient({
 *   agentId: 'verifier-agent',
 *   mcpServerPath: '/path/to/stdio-server.js'
 * });
 * await client.connect();
 * const result = await client.callTool('walletBalance');
 * ```
 */
export class MidnightMCPClient {
  // ┌─────────────────────────────────────────────────────────┐
  // │ Private Properties (Internal Use Only)                  │
  // └─────────────────────────────────────────────────────────┘
  
  // BREADCRUMB: The MCP client that handles protocol communication
  private client: Client | null = null;
  
  // BREADCRUMB: The transport layer (STDIO = standard input/output pipes)
  private transport: StdioClientTransport | null = null;
  
  // BREADCRUMB: Our configuration settings
  private config: MCPConfig;
  
  // BREADCRUMB: Are we currently connected to Midnight?
  private connected: boolean = false;

  /**
   * Constructor - Create a new MCP Client
   * 
   * BREADCRUMB: This sets up the client but doesn't connect yet
   * You need to call connect() after creating the instance
   */
  constructor(config: MCPConfig) {
    this.config = config;
    
    // BREADCRUMB: Log creation for debugging
    console.log(`[MCP-Client] 🏗️  Created client for agent: ${config.agentId}`);
  }

  // ┌─────────────────────────────────────────────────────────────────┐
  // │ CORE METHOD #1: Connect to Midnight                             │
  // └─────────────────────────────────────────────────────────────────┘
  /**
   * Connect to the Midnight MCP Server
   * 
   * BREADCRUMB: This is the FIRST thing you must do after creating the client
   * It spawns the MCP server and establishes the connection to Midnight
   * 
   * WHAT HAPPENS:
   * 1. Spawns MCP server as a subprocess (using Node.js)
   * 2. Sets up STDIO communication pipes
   * 3. MCP server connects to Midnight blockchain
   * 4. Creates isolated wallet for this agent
   * 5. Returns when ready to use
   * 
   * @throws Error if connection fails
   */
  async connect(): Promise<void> {
    // BREADCRUMB: Check if already connected (avoid duplicate connections)
    if (this.connected) {
      console.log(`[MCP-Client] ℹ️  Already connected as ${this.config.agentId}`);
      return;
    }

    console.log(`[MCP-Client] 🔌 Connecting agent: ${this.config.agentId}`);
    console.log(`[MCP-Client] 📁 MCP Server path: ${this.config.mcpServerPath}`);
    console.log(`[MCP-Client] 🌐 Network: ${this.config.networkId || 'TestNet'}`);

    try {
      // ┌───────────────────────────────────────────────────────────┐
      // │ STEP 3.1: Create STDIO Transport                          │
      // └───────────────────────────────────────────────────────────┘
      // BREADCRUMB: This spawns the MCP server as a subprocess
      // Think of it like opening another terminal and running a command
      this.transport = new StdioClientTransport({
        command: 'node',  // BREADCRUMB: Use Node.js to run the server
        args: [this.config.mcpServerPath],  // BREADCRUMB: Path to server script
        env: {
          // BREADCRUMB: Pass environment variables to the subprocess
          ...process.env,  // Include all existing env vars
          AGENT_ID: this.config.agentId,  // 🔑 This gives each agent its own wallet!
          NETWORK_ID: this.config.networkId || 'TestNet',  // Which blockchain network
          LOG_LEVEL: 'info'  // How verbose should logging be
        }
      });

      // ┌───────────────────────────────────────────────────────────┐
      // │ STEP 3.2: Create MCP Client                               │
      // └───────────────────────────────────────────────────────────┘
      // BREADCRUMB: Create the client that will talk via the transport
      this.client = new Client(
        {
          // BREADCRUMB: Identify ourselves to the MCP server
          name: 'agenticdid-client',
          version: '1.0.0'
        },
        {
          // BREADCRUMB: What capabilities do we support?
          capabilities: {
            tools: {}  // We'll use tools from the Midnight MCP server
          }
        }
      );

      // ┌───────────────────────────────────────────────────────────┐
      // │ STEP 3.3: Connect!                                         │
      // └───────────────────────────────────────────────────────────┘
      // BREADCRUMB: This actually establishes the connection
      await this.client.connect(this.transport);
      this.connected = true;

      console.log(`[MCP-Client] ✅ Connected successfully!`);
      
      // ┌───────────────────────────────────────────────────────────┐
      // │ STEP 3.4: List Available Tools (for debugging)            │
      // └───────────────────────────────────────────────────────────┘
      // BREADCRUMB: Show what operations are available
      const tools = await this.client.listTools();
      console.log(`[MCP-Client] 🛠️  Available tools:`, tools.tools.map(t => t.name).join(', '));

    } catch (error) {
      // BREADCRUMB: Connection failed - log the error
      console.error(`[MCP-Client] ❌ Connection failed:`, error);
      throw new Error(`Failed to connect to Midnight MCP server: ${error}`);
    }
  }

  // ┌─────────────────────────────────────────────────────────────────┐
  // │ CORE METHOD #2: Check Connection Status                         │
  // └─────────────────────────────────────────────────────────────────┘
  /**
   * Check if Connected
   * 
   * BREADCRUMB: Use this to verify you're ready to make blockchain calls
   */
  isConnected(): boolean {
    return this.connected && this.client !== null;
  }

  // ┌─────────────────────────────────────────────────────────────────┐
  // │ CORE METHOD #3: Call Tools (The Main Event!)                    │
  // └─────────────────────────────────────────────────────────────────┘
  /**
   * Call a Tool on the Midnight MCP Server
   * 
   * BREADCRUMB: This is how you do ANYTHING on the Midnight blockchain
   * 
   * AVAILABLE TOOLS (from Midnight MCP server):
   * - 'walletStatus' → Check if wallet is synced and ready
   * - 'walletAddress' → Get this agent's Midnight address
   * - 'walletBalance' → Get this agent's tDUST balance
   * - 'getTransactions' → List recent transactions
   * - 'sendFunds' → Send money to another address
   * - 'verifyTransaction' → Verify a transaction on-chain
   * - 'getWalletConfig' → Get wallet configuration
   * 
   * EXAMPLE:
   * ```typescript
   * const result = await client.callTool('walletBalance');
   * if (result.success) {
   *   console.log('Balance:', result.data);
   * }
   * ```
   * 
   * @param toolName - Name of the tool to call
   * @param args - Arguments for the tool (optional)
   * @returns Result from the blockchain operation
   */
  async callTool(toolName: string, args: Record<string, unknown> = {}): Promise<MCPToolResult> {
    // BREADCRUMB: Safety check - are we connected?
    if (!this.isConnected() || !this.client) {
      throw new Error('MCP client not connected. Call connect() first.');
    }

    console.log(`[MCP-Client] 🔧 Calling tool: ${toolName}`, args);

    try {
      // ┌───────────────────────────────────────────────────────────┐
      // │ Send the Request to MCP Server                            │
      // └───────────────────────────────────────────────────────────┘
      // BREADCRUMB: This sends a JSON-RPC request via STDIO
      const result = await this.client.callTool({
        name: toolName,
        arguments: args
      });

      console.log(`[MCP-Client] ✅ Tool ${toolName} succeeded`);

      // BREADCRUMB: Return the successful result
      return {
        success: true,
        data: result.content  // The actual blockchain data!
      };

    } catch (error) {
      // BREADCRUMB: Tool call failed - return error
      console.error(`[MCP-Client] ❌ Tool ${toolName} failed:`, error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  // ┌─────────────────────────────────────────────────────────────────┐
  // │ CONVENIENCE METHODS (Shortcuts for Common Operations)           │
  // └─────────────────────────────────────────────────────────────────┘

  /**
   * Get Wallet Status
   * 
   * BREADCRUMB: Check if this agent's wallet is ready to use
   * 
   * WHAT YOU GET:
   * - synced: boolean (is wallet synced with blockchain?)
   * - blockHeight: number (current blockchain height)
   * - networkId: string (TestNet or MainNet)
   */
  async getWalletStatus(): Promise<MCPToolResult> {
    return this.callTool('walletStatus');
  }

  /**
   * Get Wallet Address
   * 
   * BREADCRUMB: Get this agent's Midnight blockchain address
   * Think of it like getting their Bitcoin address
   */
  async getWalletAddress(): Promise<MCPToolResult> {
    return this.callTool('walletAddress');
  }

  /**
   * Get Wallet Balance
   * 
   * BREADCRUMB: Check how much tDUST (testnet tokens) this agent has
   */
  async getWalletBalance(): Promise<MCPToolResult> {
    return this.callTool('walletBalance');
  }

  /**
   * Get Transaction History
   * 
   * BREADCRUMB: List recent transactions for this agent
   * 
   * @param limit - How many transactions to return (default: 10)
   */
  async getTransactions(limit: number = 10): Promise<MCPToolResult> {
    return this.callTool('getTransactions', { limit });
  }

  /**
   * Verify a Transaction
   * 
   * BREADCRUMB: 🔥 THIS IS THE KEY METHOD FOR CREDENTIAL VERIFICATION! 🔥
   * 
   * This checks if a transaction exists on the Midnight blockchain
   * and returns its verification status.
   * 
   * USE CASE:
   * When an agent presents a credential, you verify it on-chain:
   * 1. Agent gives you a transaction hash (txHash)
   * 2. You call this method with that hash
   * 3. Midnight blockchain checks if it's valid
   * 4. You get back verification result
   * 
   * @param txHash - The transaction hash to verify
   * @returns Verification result from blockchain
   */
  async verifyTransaction(txHash: string): Promise<MCPToolResult> {
    return this.callTool('verifyTransaction', { txHash });
  }

  /**
   * Send Funds
   * 
   * BREADCRUMB: Send tDUST tokens to another Midnight address
   * (Useful for testing, not needed for credential verification)
   * 
   * @param toAddress - Recipient's Midnight address
   * @param amount - Amount in tDUST (as string, e.g., '1000')
   */
  async sendFunds(toAddress: string, amount: string): Promise<MCPToolResult> {
    return this.callTool('sendFunds', { toAddress, amount });
  }

  /**
   * Get Wallet Configuration
   * 
   * BREADCRUMB: Get detailed info about this agent's wallet setup
   */
  async getWalletConfig(): Promise<MCPToolResult> {
    return this.callTool('getWalletConfig');
  }

  // ┌─────────────────────────────────────────────────────────────────┐
  // │ CLEANUP METHOD                                                   │
  // └─────────────────────────────────────────────────────────────────┘
  /**
   * Disconnect from MCP Server
   * 
   * BREADCRUMB: Clean shutdown - call this when done
   * This closes the connection and stops the MCP server subprocess
   */
  async disconnect(): Promise<void> {
    if (this.client && this.connected) {
      console.log(`[MCP-Client] 🔌 Disconnecting agent: ${this.config.agentId}`);
      await this.client.close();
      this.connected = false;
      this.client = null;
      console.log(`[MCP-Client] ✅ Disconnected successfully`);
    }
  }

  // ┌─────────────────────────────────────────────────────────────────┐
  // │ HEALTH CHECK METHOD                                              │
  // └─────────────────────────────────────────────────────────────────┘
  /**
   * Health Check
   * 
   * BREADCRUMB: Verify everything is working correctly
   * 
   * USE CASE: Call this periodically or before important operations
   * to make sure the blockchain connection is still good
   */
  async healthCheck(): Promise<{healthy: boolean; status: string}> {
    // BREADCRUMB: First check - are we even connected?
    if (!this.isConnected()) {
      return { healthy: false, status: 'MCP client not connected' };
    }

    try {
      // BREADCRUMB: Try to get wallet status (tests the full chain)
      const statusResult = await this.getWalletStatus();
      
      if (statusResult.success) {
        return { 
          healthy: true, 
          status: `Connected to Midnight as ${this.config.agentId}` 
        };
      } else {
        return { 
          healthy: false, 
          status: `Wallet error: ${statusResult.error}` 
        };
      }
    } catch (error) {
      return { 
        healthy: false, 
        status: `Health check failed: ${error}` 
      };
    }
  }
}

// ┌─────────────────────────────────────────────────────────────────┐
// │ FACTORY FUNCTION (Easy Way to Create Clients)                   │
// └─────────────────────────────────────────────────────────────────┘
/**
 * Create and Connect an MCP Client
 * 
 * BREADCRUMB: This is the EASIEST way to get started!
 * It creates the client AND connects it for you.
 * 
 * EXAMPLE:
 * ```typescript
 * const client = await createMCPClient(
 *   'verifier-agent',
 *   '/path/to/stdio-server.js'
 * );
 * // Now ready to use!
 * const balance = await client.getWalletBalance();
 * ```
 * 
 * @param agentId - Unique ID for this agent
 * @param mcpServerPath - Path to Midnight MCP server
 * @returns Connected MCP client ready to use
 */
export async function createMCPClient(
  agentId: string,
  mcpServerPath: string
): Promise<MidnightMCPClient> {
  // BREADCRUMB: Create the client
  const client = new MidnightMCPClient({
    agentId,
    mcpServerPath,
    networkId: 'TestNet'
  });

  // BREADCRUMB: Connect it
  await client.connect();
  
  // BREADCRUMB: Return it ready to use!
  return client;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🎉 YOU'RE DONE! Now you can use this client to talk to Midnight blockchain!
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * NEXT STEPS:
 * 1. Look at mcp-examples.ts to see real usage examples
 * 2. Check out mcp-adapter.ts to see how this integrates with your app
 * 3. Read MCP_INTEGRATION_GUIDE.md for troubleshooting
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */
