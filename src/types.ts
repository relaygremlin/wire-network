/**
 * Core types for Wire Network
 */

export interface Agent {
  id: string;
  name: string;
  capabilities: string[];
  endpoint?: string;
  publicKey?: string;
  metadata?: Record<string, unknown>;
  registeredAt: string;
  lastSeen: string;
}

export interface MemoryEntry {
  id: string;
  agentId: string;
  content: string;
  tags: string[];
  embedding?: number[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  from: string;
  to: string;
  content: string;
  metadata?: Record<string, unknown>;
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;
}

export interface AgentRegistration {
  name: string;
  capabilities: string[];
  endpoint?: string;
  publicKey?: string;
  metadata?: Record<string, unknown>;
}
