import type {
  IntegrationActionAuditEvent,
  IntegrationActionAuditRecord,
} from "./types.js";

export interface IntegrationActionAuditStore {
  appendAuditEvent(event: IntegrationActionAuditEvent): Promise<void>;
  getAuditRecord(actionId: string): Promise<IntegrationActionAuditRecord | undefined>;
  listAuditRecords(): Promise<IntegrationActionAuditRecord[]>;
}
export class InMemoryIntegrationActionAuditStore
  implements IntegrationActionAuditStore
{
  private readonly records = new Map<string, IntegrationActionAuditRecord>();

  async appendAuditEvent(event: IntegrationActionAuditEvent): Promise<void> {
    const existing = this.records.get(event.actionId);
    if (!existing) {
      this.records.set(event.actionId, {
        actionId: event.actionId,
        integration: event.integration,
        action: event.action,
        riskLevel: event.riskLevel,
        createdAt: event.createdAt,
        updatedAt: event.createdAt,
        events: [event],
      });
      return;
    }

    this.records.set(event.actionId, {
      ...existing,
      updatedAt: event.createdAt,
      events: [...existing.events, event],
    });
  }

  async getAuditRecord(
    actionId: string,
  ): Promise<IntegrationActionAuditRecord | undefined> {
    return this.records.get(actionId);
  }

  async listAuditRecords(): Promise<IntegrationActionAuditRecord[]> {
    return [...this.records.values()];
  }
}

export function createInMemoryAuditStore(): IntegrationActionAuditStore {
  return new InMemoryIntegrationActionAuditStore();
}
