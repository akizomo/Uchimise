import type { Context } from 'hono';

// Typed Hono context variables injected by auth middleware
export type AppEnv = {
  Variables: {
    userId: string;
    userToken: string;
  };
};

export type AppContext = Context<AppEnv>;
