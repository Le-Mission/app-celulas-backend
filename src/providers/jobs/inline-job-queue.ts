export interface JobPayload {
  type: string;
  data: Record<string, unknown>;
}

export type JobHandler = (payload: JobPayload) => Promise<void>;

export interface JobQueue {
  publish(payload: JobPayload): Promise<void>;
  subscribe(type: string, handler: JobHandler): void;
}

export class InlineJobQueue implements JobQueue {
  private handlers = new Map<string, JobHandler[]>();

  async publish(payload: JobPayload): Promise<void> {
    const handlers = this.handlers.get(payload.type) ?? [];
    for (const handler of handlers) {
      try {
        await handler(payload);
      } catch (err) {
        console.error(`Job handler error for ${payload.type}:`, err);
      }
    }
  }

  subscribe(type: string, handler: JobHandler): void {
    const existing = this.handlers.get(type) ?? [];
    existing.push(handler);
    this.handlers.set(type, existing);
  }
}
