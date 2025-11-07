/**
 * Verifier API Configuration
 */

import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '8787', 10),
  jwtSecret: process.env.JWT_SECRET || 'dev-only-secret',
  tokenTTL: parseInt(process.env.TOKEN_TTL_SECONDS || '120', 10),
  midnightAdapterUrl: process.env.MIDNIGHT_ADAPTER_URL || 'http://localhost:8788',
  nodeEnv: process.env.NODE_ENV || 'development',
  issuer: process.env.ISSUER || 'https://agenticdid.io',
};

export const isDev = config.nodeEnv === 'development';
