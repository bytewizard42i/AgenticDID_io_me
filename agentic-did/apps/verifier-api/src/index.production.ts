/**
 * PRODUCTION SERVER - Cloud Run Deployment
 * Serves both frontend static files and API endpoints
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config, isDev } from './config.js';
import { registerRoutes } from './routes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = Fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname',
      },
    },
  },
});

// CORS
await app.register(cors, {
  origin: '*',
  methods: ['GET', 'POST'],
});

// Register API routes first
await registerRoutes(app);

// Serve static frontend files
// In Docker, working directory is /app, so frontend is at /app/apps/web/dist
const frontendPath = '/app/apps/web/dist';
console.log(`📁 Serving frontend from: ${frontendPath}`);

await app.register(fastifyStatic, {
  root: frontendPath,
  prefix: '/',
});

// Fallback to index.html for SPA routing
app.setNotFoundHandler((request, reply) => {
  // If it's an API route, return 404
  if (request.url.startsWith('/api') || request.url.startsWith('/health') || request.url.startsWith('/challenge') || request.url.startsWith('/verify')) {
    reply.code(404).send({ error: 'Route not found' });
    return;
  }
  
  // Otherwise serve index.html for SPA
  reply.sendFile('index.html');
});

// Start server
const PORT = parseInt(process.env.PORT || '8080');

try {
  await app.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`🚀 AgenticDID Production Server`);
  console.log(`   Frontend: http://localhost:${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
