import { Context } from 'hono';

export type AppContextInput = { Bindings: Env };

export type AuthContextInput = AppContextInput & {
  Variables: {
    authToken: string;
  };
};

export type AppContext = Context<AppContextInput>;
export type AuthContext = Context<AuthContextInput>;
