import type { IntegrationActionApprovalRequest } from "./types.js";

export interface IntegrationActionApprovalStore {
  save(request: IntegrationActionApprovalRequest): Promise<void>;
  update(request: IntegrationActionApprovalRequest): Promise<void>;
  getById(approvalId: string): Promise<IntegrationActionApprovalRequest | undefined>;
  getByActionId(actionId: string): Promise<IntegrationActionApprovalRequest | undefined>;
  verifyActCode?(approvalId: string, actCode: string): Promise<boolean>;
}

export class InMemoryIntegrationActionApprovalStore
  implements IntegrationActionApprovalStore
{
  private readonly approvals = new Map<string, IntegrationActionApprovalRequest>();

  async save(request: IntegrationActionApprovalRequest): Promise<void> {
    this.approvals.set(request.id, request);
  }

  async update(request: IntegrationActionApprovalRequest): Promise<void> {
    this.approvals.set(request.id, request);
  }

  async getById(
    approvalId: string,
  ): Promise<IntegrationActionApprovalRequest | undefined> {
    return this.approvals.get(approvalId);
  }

  async getByActionId(
    actionId: string,
  ): Promise<IntegrationActionApprovalRequest | undefined> {
    return [...this.approvals.values()].find(
      (request) => request.actionId === actionId,
    );
  }
}

export function createInMemoryApprovalStore(): IntegrationActionApprovalStore {
  return new InMemoryIntegrationActionApprovalStore();
}
