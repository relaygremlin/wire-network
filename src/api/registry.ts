import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { registry } from '../registry/index.js';

const AgentRegistrationSchema = z.object({
  name: z.string().min(1).max(100),
  capabilities: z.array(z.string()).min(1),
  endpoint: z.string().url().optional(),
  publicKey: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export async function registerRegistryRoutes(server: FastifyInstance) {
  /**
   * Register a new agent
   */
  server.post('/registry/register', {
    schema: {
      description: 'Register a new agent in the network',
      tags: ['registry'],
      body: {
        type: 'object',
        required: ['name', 'capabilities'],
        properties: {
          name: { type: 'string' },
          capabilities: { type: 'array', items: { type: 'string' } },
          endpoint: { type: 'string' },
          publicKey: { type: 'string' },
          metadata: { type: 'object' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            capabilities: { type: 'array', items: { type: 'string' } },
            registeredAt: { type: 'string' },
            lastSeen: { type: 'string' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const result = AgentRegistrationSchema.safeParse(request.body);
      if (!result.success) {
        return reply.code(400).send({
          error: 'Invalid request',
          details: result.error.errors,
        });
      }

      const agent = registry.register(result.data);
      return reply.code(200).send(agent);
    },
  });

  /**
   * List all agents
   */
  server.get('/registry/agents', {
    schema: {
      description: 'List all registered agents',
      tags: ['registry'],
      querystring: {
        type: 'object',
        properties: {
          capability: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              capabilities: { type: 'array', items: { type: 'string' } },
              lastSeen: { type: 'string' },
            },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { capability } = request.query as { capability?: string };
      const agents = registry.list({ capability });
      return reply.code(200).send(agents);
    },
  });

  /**
   * Get agent by ID
   */
  server.get('/registry/agents/:id', {
    schema: {
      description: 'Get agent details by ID',
      tags: ['registry'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const agent = registry.get(id);

      if (!agent) {
        return reply.code(404).send({ error: 'Agent not found' });
      }

      return reply.code(200).send(agent);
    },
  });

  /**
   * Update agent heartbeat
   */
  server.post('/registry/agents/:id/heartbeat', {
    schema: {
      description: 'Update agent last seen timestamp',
      tags: ['registry'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const success = registry.heartbeat(id);

      if (!success) {
        return reply.code(404).send({ error: 'Agent not found' });
      }

      return reply.code(200).send({ success: true });
    },
  });

  /**
   * Unregister agent
   */
  server.delete('/registry/agents/:id', {
    schema: {
      description: 'Unregister an agent from the network',
      tags: ['registry'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const success = registry.unregister(id);

      if (!success) {
        return reply.code(404).send({ error: 'Agent not found' });
      }

      return reply.code(200).send({ success: true });
    },
  });
}
