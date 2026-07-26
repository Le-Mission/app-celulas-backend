declare module "@abacatepay/sdk" {
  export function AbacatePay(options: { secret?: string }): {
    checkouts: {
      create(body: unknown): Promise<{ id: string; url: string; status: string }>;
      list(): Promise<unknown>;
      get(id: string): Promise<unknown>;
    };
    subscriptions: {
      create(body: unknown): Promise<{ id: string; url: string; status: string }>;
      list(): Promise<unknown>;
    };
    customers: {
      create(body: unknown): Promise<unknown>;
      list(query?: unknown): Promise<unknown>;
      get(id: string): Promise<unknown>;
      delete(id: string): Promise<unknown>;
    };
    rest: unknown;
  };
}
