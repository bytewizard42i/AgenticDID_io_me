/**
 * Midnight Gatekeeper - Verifier API
 * AgenticDID.io
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config, isDev } from './config.js';
import { registerRoutes } from './routes.js';

const app = Fastify({
  logger: {
    level: isDev ? 'info' : 'warn',
    transport: isDev
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  },
});

// CORS
await app.register(cors, {
  origin: isDev ? '*' : ['https://agenticdid.io'],
  methods: ['GET', 'POST'],
});

// Register routes
await registerRoutes(app);

// Start server
try {
  await app.listen({ port: config.port, host: '0.0.0.0' });
  console.log(`🛡️  Midnight Gatekeeper running on http://localhost:${config.port}`);
  console.log(`📋 Environment: ${config.nodeEnv}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
