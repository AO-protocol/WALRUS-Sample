import { createLogger } from '@mastra/core/logger';
import { Mastra } from '@mastra/core/mastra';
import { LibSQLStore } from '@mastra/libsql';

import { walrusAgent, weatherAgent } from './agents';

export const mastra = new Mastra({
  agents: { weatherAgent, walrusAgent },
  storage: new LibSQLStore({
    // stores telemetry, evals, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: ":memory:",
  }),
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
});

/**
 * Export all Mastra agents and tools for use in applications
 */

// Export the agents
export * from './agents';

// Export the tools
export * from './tools';
