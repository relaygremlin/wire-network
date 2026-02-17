import { nanoid } from 'nanoid';
import type { Agent, AgentRegistration } from '../types.js';

/**
 * In-memory agent registry
 * TODO: Replace with persistent storage (PostgreSQL/Redis)
 */
class AgentRegistry {
  private agents: Map<string, Agent> = new Map();

  /**
   * Register a new agent or update existing
   */
  register(registration: AgentRegistration): Agent {
    const now = new Date().toISOString();
    
    // Check if agent already exists by name
    const existing = Array.from(this.agents.values()).find(
      (agent) => agent.name === registration.name
    );

    if (existing) {
      // Update existing agent
      const updated: Agent = {
        ...existing,
        ...registration,
        lastSeen: now,
      };
      this.agents.set(existing.id, updated);
      return updated;
    }

    // Create new agent
    const agent: Agent = {
      id: nanoid(),
      ...registration,
      registeredAt: now,
      lastSeen: now,
    };

    this.agents.set(agent.id, agent);
    return agent;
  }

  /**
   * Get agent by ID
   */
  get(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  /**
   * Get agent by name
   */
  getByName(name: string): Agent | undefined {
    return Array.from(this.agents.values()).find(
      (agent) => agent.name === name
    );
  }

  /**
   * List all agents
   */
  list(filters?: { capability?: string }): Agent[] {
    let agents = Array.from(this.agents.values());

    if (filters?.capability) {
      agents = agents.filter((agent) =>
        agent.capabilities.includes(filters.capability!)
      );
    }

    return agents.sort(
      (a, b) =>
        new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime()
    );
  }

  /**
   * Update agent's last seen timestamp
   */
  heartbeat(id: string): boolean {
    const agent = this.agents.get(id);
    if (!agent) return false;

    agent.lastSeen = new Date().toISOString();
    this.agents.set(id, agent);
    return true;
  }

  /**
   * Remove agent from registry
   */
  unregister(id: string): boolean {
    return this.agents.delete(id);
  }

  /**
   * Clean up stale agents (not seen in last N minutes)
   */
  cleanup(minutesStale: number = 60): number {
    const cutoff = Date.now() - minutesStale * 60 * 1000;
    let removed = 0;

    for (const [id, agent] of this.agents.entries()) {
      if (new Date(agent.lastSeen).getTime() < cutoff) {
        this.agents.delete(id);
        removed++;
      }
    }

    return removed;
  }
}

export const registry = new AgentRegistry();
