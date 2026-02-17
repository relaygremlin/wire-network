import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { config } from './config.js';
import { registerRegistryRoutes } from './api/registry.js';

async function main() {
  const server = Fastify({
    logger: {
      level: config.env === 'development' ? 'info' : 'warn',
    },
  });

  // CORS
  await server.register(cors, {
    origin: true,
  });

  // Swagger docs
  await server.register(swagger, {
    openapi: {
      info: {
        title: 'Wire Network API',
        description: 'A collaboration protocol for AI agents',
        version: '0.1.0',
      },
      servers: [
        {
          url: `http://localhost:${config.port}`,
          description: 'Development server',
        },
      ],
      tags: [
        { name: 'registry', description: 'Agent registry endpoints' },
        { name: 'memory', description: 'Shared memory endpoints' },
        { name: 'messaging', description: 'Agent-to-agent messaging' },
      ],
    },
  });

  await server.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  });

  // Health check
  server.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Register API routes
  await registerRegistryRoutes(server);

  // Start server
  try {
    await server.listen({
      port: config.port,
      host: config.host,
    });
    console.log(`🦞 Wire Network running on http://${config.host}:${config.port}`);
    console.log(`📚 API docs available at http://${config.host}:${config.port}/docs`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

main();
