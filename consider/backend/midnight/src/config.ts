/**
 * Midnight Gateway Configuration
 * 
 * Environment-based configuration for Midnight Network integration.
 * Supports multiple deployment modes: undeployed (local), devnet, testnet.
 * 
 * Pattern learned from reference-repos/example-counter/counter-cli/src/config.ts
 */

import type { Logger } from 'pino';

// Mock NetworkId types until we integrate real Midnight packages
export type NetworkId = 'undeployed' | 'devnet' | 'testnet';

/**
 * Midnight Network deployment modes
 */
export enum DeploymentMode {
  /** Local development with standalone proof server */
  UNDEPLOYED = 'undeployed',
  
  /** Midnight devnet environment */
  DEVNET = 'devnet',
  
  /** Midnight testnet environment */
  TESTNET = 'testnet',
}

/**
 * Midnight Gateway configuration interface
 */
export interface MidnightConfig {
  /** Deployment mode */
  mode: DeploymentMode;
  
  /** Midnight Network ID (must match mode) */
  networkId: NetworkId; // Currently mock - will use real @midnight-ntwrk packages when connected
  
  /** Proof server URL (typically localhost for privacy) */
  proofServerUrl: string;
  
  /** Indexer API URL (for public data) */
  indexerUrl: string;
  
  /** Node RPC URL (for chain state) */
  nodeUrl: string;
  
  /** Path to compiled contracts directory */
  contractsPath: string;
  
  /** Fastify server port */
  port: number;
  
  /** Fastify server host */
  host: string;
  
  /** Enable CORS */
  corsEnabled: boolean;
  
  /** Allowed CORS origins */
  corsOrigins: string[];
  
  /** Log level */
  logLevel: string;
  
  /** Pretty print logs (dev mode) */
  prettyLogs: boolean;
  
  /** Request timeout in milliseconds */
  requestTimeout: number;
  
  /** Proof generation timeout in milliseconds */
  proofTimeout: number;
}

/**
 * Environment variable names
 */
const ENV = {
  // Deployment
  NODE_ENV: 'NODE_ENV',
  DEPLOYMENT_MODE: 'DEPLOYMENT_MODE',
  
  // Network
  PROOF_SERVER_URL: 'PROOF_SERVER_URL',
  INDEXER_URL: 'INDEXER_URL',
  NODE_URL: 'NODE_URL',
  
  // Paths
  CONTRACTS_PATH: 'CONTRACTS_PATH',
  
  // Server
  PORT: 'PORT',
  HOST: 'HOST',
  
  // CORS
  CORS_ENABLED: 'CORS_ENABLED',
  CORS_ORIGINS: 'CORS_ORIGINS',
  
  // Logging
  LOG_LEVEL: 'LOG_LEVEL',
  PRETTY_LOGS: 'PRETTY_LOGS',
  
  // Timeouts
  REQUEST_TIMEOUT: 'REQUEST_TIMEOUT',
  PROOF_TIMEOUT: 'PROOF_TIMEOUT',
} as const;

/**
 * Default configuration for undeployed (local) mode
 */
const UNDEPLOYED_DEFAULTS: Omit<MidnightConfig, 'mode' | 'networkId'> = {
  proofServerUrl: 'http://localhost:6300',
  indexerUrl: 'http://localhost:8088/api/v1/graphql',
  nodeUrl: 'http://localhost:9944',
  contractsPath: '../../protocol/compiled',
  port: 3003,
  host: '0.0.0.0',
  corsEnabled: true,
  corsOrigins: ['http://localhost:3000', 'http://localhost:5173'],
  logLevel: 'debug',
  prettyLogs: true,
  requestTimeout: 30000,
  proofTimeout: 120000, // 2 minutes for proof generation
};

/**
 * Default configuration for testnet mode
 */
const TESTNET_DEFAULTS: Omit<MidnightConfig, 'mode' | 'networkId'> = {
  proofServerUrl: 'http://localhost:6300', // Proof server always local for privacy!
  indexerUrl: 'https://indexer.testnet-02.midnight.network/api/v1/graphql',
  nodeUrl: 'https://rpc.testnet-02.midnight.network',
  contractsPath: '../../protocol/compiled',
  port: 3003,
  host: '0.0.0.0',
  corsEnabled: true,
  corsOrigins: [], // Set via env var
  logLevel: 'info',
  prettyLogs: false,
  requestTimeout: 30000,
  proofTimeout: 180000, // 3 minutes for proof generation on testnet
};

/**
 * Default configuration for devnet mode
 */
const DEVNET_DEFAULTS: Omit<MidnightConfig, 'mode' | 'networkId'> = {
  proofServerUrl: 'http://localhost:6300', // Proof server always local for privacy!
  indexerUrl: 'https://indexer.devnet-02.midnight.network/api/v1/graphql',
  nodeUrl: 'https://rpc.devnet-02.midnight.network',
  contractsPath: '../../protocol/compiled',
  port: 3003,
  host: '0.0.0.0',
  corsEnabled: true,
  corsOrigins: [], // Set via env var
  logLevel: 'info',
  prettyLogs: false,
  requestTimeout: 30000,
  proofTimeout: 180000, // 3 minutes for proof generation on devnet
};

/**
 * Load configuration from environment variables
 * 
 * @param logger - Optional logger for configuration warnings
 * @returns Validated configuration object
 */
export function loadConfig(logger?: Logger): MidnightConfig {
  // Determine deployment mode
  const modeStr = process.env[ENV.DEPLOYMENT_MODE] || DeploymentMode.UNDEPLOYED;
  const mode = parseDeploymentMode(modeStr);
  
  logger?.info(`Loading configuration for deployment mode: ${mode}`);
  
  // Get defaults for mode
  const defaults = getDefaultsForMode(mode);
  
  // Build config from environment with defaults
  const config: MidnightConfig = {
    mode,
    networkId: getNetworkIdForMode(mode),
    
    // Network URLs
    proofServerUrl: process.env[ENV.PROOF_SERVER_URL] || defaults.proofServerUrl,
    indexerUrl: process.env[ENV.INDEXER_URL] || defaults.indexerUrl,
    nodeUrl: process.env[ENV.NODE_URL] || defaults.nodeUrl,
    
    // Paths
    contractsPath: process.env[ENV.CONTRACTS_PATH] || defaults.contractsPath,
    
    // Server
    port: parseInt(process.env[ENV.PORT] || String(defaults.port), 10),
    host: process.env[ENV.HOST] || defaults.host,
    
    // CORS
    corsEnabled: parseBool(process.env[ENV.CORS_ENABLED], defaults.corsEnabled),
    corsOrigins: process.env[ENV.CORS_ORIGINS]
      ? process.env[ENV.CORS_ORIGINS]!.split(',').map((o) => o.trim())
      : defaults.corsOrigins,
    
    // Logging
    logLevel: process.env[ENV.LOG_LEVEL] || defaults.logLevel,
    prettyLogs: parseBool(process.env[ENV.PRETTY_LOGS], defaults.prettyLogs),
    
    // Timeouts
    requestTimeout: parseInt(
      process.env[ENV.REQUEST_TIMEOUT] || String(defaults.requestTimeout),
      10
    ),
    proofTimeout: parseInt(
      process.env[ENV.PROOF_TIMEOUT] || String(defaults.proofTimeout),
      10
    ),
  };
  
  // Validate configuration
  validateConfig(config, logger);
  
  // Mock NetworkId setting (real implementation will use setNetworkId from @midnight-ntwrk packages)
  logger?.info(`NetworkId configured: ${config.networkId}`);
  
  return config;
}

/**
 * Parse deployment mode string
 */
function parseDeploymentMode(value: string): DeploymentMode {
  const normalized = value.toLowerCase();
  
  switch (normalized) {
    case 'undeployed':
    case 'local':
    case 'standalone':
      return DeploymentMode.UNDEPLOYED;
    
    case 'devnet':
    case 'dev':
      return DeploymentMode.DEVNET;
    
    case 'testnet':
    case 'test':
      return DeploymentMode.TESTNET;
    
    default:
      console.warn(`Unknown deployment mode "${value}", defaulting to undeployed`);
      return DeploymentMode.UNDEPLOYED;
  }
}

/**
 * Get NetworkId for deployment mode
 */
function getNetworkIdForMode(mode: DeploymentMode): NetworkId {
  switch (mode) {
    case DeploymentMode.UNDEPLOYED:
      return 'undeployed';
    
    case DeploymentMode.DEVNET:
      return 'devnet';
    
    case DeploymentMode.TESTNET:
      return 'testnet';
    
    default:
      return 'undeployed';
  }
}

/**
 * Get default configuration for deployment mode
 */
function getDefaultsForMode(
  mode: DeploymentMode
): Omit<MidnightConfig, 'mode' | 'networkId'> {
  switch (mode) {
    case DeploymentMode.UNDEPLOYED:
      return UNDEPLOYED_DEFAULTS;
    
    case DeploymentMode.DEVNET:
      return DEVNET_DEFAULTS;
    
    case DeploymentMode.TESTNET:
      return TESTNET_DEFAULTS;
    
    default:
      return UNDEPLOYED_DEFAULTS;
  }
}

/**
 * Parse boolean from string or boolean
 */
function parseBool(value: string | boolean | undefined, defaultValue: boolean): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  
  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    return normalized === 'true' || normalized === '1' || normalized === 'yes';
  }
  
  return defaultValue;
}

/**
 * Validate configuration
 */
function validateConfig(config: MidnightConfig, logger?: Logger): void {
  const errors: string[] = [];
  
  // Validate URLs
  if (!isValidUrl(config.proofServerUrl)) {
    errors.push(`Invalid proof server URL: ${config.proofServerUrl}`);
  }
  
  if (!isValidUrl(config.indexerUrl)) {
    errors.push(`Invalid indexer URL: ${config.indexerUrl}`);
  }
  
  if (!isValidUrl(config.nodeUrl)) {
    errors.push(`Invalid node URL: ${config.nodeUrl}`);
  }
  
  // Validate port
  if (config.port < 1 || config.port > 65535) {
    errors.push(`Invalid port: ${config.port} (must be 1-65535)`);
  }
  
  // Validate timeouts
  if (config.requestTimeout < 1000) {
    errors.push(`Request timeout too low: ${config.requestTimeout}ms (minimum 1000ms)`);
  }
  
  if (config.proofTimeout < 10000) {
    errors.push(`Proof timeout too low: ${config.proofTimeout}ms (minimum 10000ms)`);
  }
  
  // Log errors
  if (errors.length > 0) {
    errors.forEach((error) => logger?.error(error));
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
  
  logger?.debug('Configuration validation passed');
}

/**
 * Simple URL validation
 */
function isValidUrl(urlString: string): boolean {
  try {
    new URL(urlString);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get configuration summary for logging (sanitized)
 */
export function getConfigSummary(config: MidnightConfig): Record<string, any> {
  return {
    mode: config.mode,
    networkId: config.networkId, // Mock implementation (string)
    proofServerUrl: config.proofServerUrl,
    indexerUrl: sanitizeUrl(config.indexerUrl),
    nodeUrl: sanitizeUrl(config.nodeUrl),
    port: config.port,
    host: config.host,
    corsEnabled: config.corsEnabled,
    logLevel: config.logLevel,
  };
}

/**
 * Sanitize URL for logging (remove sensitive parts)
 */
function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
  } catch {
    return url;
  }
}
