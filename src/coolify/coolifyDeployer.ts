// src/coolify/coolifyDeployer.ts
// High-level deployment abstraction over the Coolify API.
// Used by the orchestrator to deploy scaffolded projects and agent branches.

import {
  createApplication,
  deployApplication,
  restartApplication,
  getApplication,
} from "./coolifyClient.js";
import type { CoolifyApplication } from "./coolifyClient.js";
import { COOLIFY_CONFIG } from "../config.js";
import { logger } from "../observability/logger.js";

// ─── Types ───────────────────────────────────────────────────────

export interface DeployFromRepoRequest {
  gitRepo: string;
  branch?: string | undefined;
  name?: string | undefined;
  description?: string | undefined;
  buildPack?: string | undefined;
  portsExposes?: string | undefined;
  domains?: string | undefined;
  projectUuid?: string | undefined;
  serverUuid?: string | undefined;
}

export interface DeployResult {
  ok: boolean;
  uuid?: string | undefined;
  message: string;
  application?: CoolifyApplication | undefined;
}

export interface StatusResult {
  ok: boolean;
  uuid: string;
  status?: string | undefined;
  fqdn?: string | undefined;
  message: string;
}

// ─── Deployer ────────────────────────────────────────────────────

/**
 * Creates a new application from a public git repo and triggers deployment.
 */
export async function deployFromRepo(
  request: DeployFromRepoRequest
): Promise<DeployResult> {
  const projectUuid = request.projectUuid ?? COOLIFY_CONFIG.projectUuid;
  const serverUuid = request.serverUuid ?? COOLIFY_CONFIG.serverUuid;

  if (!projectUuid || !serverUuid) {
    return {
      ok: false,
      message: "Missing COOLIFY_PROJECT_UUID or COOLIFY_SERVER_UUID",
    };
  }

  try {
    logger.info(`Coolify: creating app from ${request.gitRepo}`);

    const createRes = await createApplication({
      project_uuid: projectUuid,
      server_uuid: serverUuid,
      git_repository: request.gitRepo,
      git_branch: request.branch ?? "main",
      build_pack: request.buildPack ?? "nixpacks",
      ports_exposes: request.portsExposes ?? "3000",
      name: request.name,
      description: request.description,
      domains: request.domains,
      is_auto_deploy_enabled: true,
    });

    if (!createRes.ok || !createRes.data) {
      return {
        ok: false,
        message: `Failed to create app: ${createRes.error ?? "unknown error"}`,
      };
    }

    const app = createRes.data;
    logger.info(`Coolify: app created — uuid=${app.uuid}`);

    // Trigger deployment
    const deployRes = await deployApplication(app.uuid);

    if (!deployRes.ok) {
      return {
        ok: false,
        uuid: app.uuid,
        message: `App created but deploy failed: ${deployRes.error ?? "unknown error"}`,
        application: app,
      };
    }

    logger.info(`Coolify: deployment triggered for ${app.uuid}`);

    return {
      ok: true,
      uuid: app.uuid,
      message: `Application created and deployment triggered`,
      application: app,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.warn("Coolify deploy error", { error: message });
    return { ok: false, message };
  }
}

/**
 * Restarts an existing application by UUID.
 */
export async function redeployApplication(uuid: string): Promise<DeployResult> {
  try {
    logger.info(`Coolify: redeploying ${uuid}`);
    const res = await restartApplication(uuid);

    if (!res.ok) {
      return {
        ok: false,
        uuid,
        message: `Redeploy failed: ${res.error ?? "unknown error"}`,
      };
    }

    return {
      ok: true,
      uuid,
      message: "Application redeployed successfully",
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.warn("Coolify redeploy error", { error: message });
    return { ok: false, uuid, message };
  }
}

/**
 * Fetches the current status of an application.
 */
export async function getDeploymentStatus(uuid: string): Promise<StatusResult> {
  try {
    const res = await getApplication(uuid);

    if (!res.ok || !res.data) {
      return {
        ok: false,
        uuid,
        message: `Status check failed: ${res.error ?? "unknown error"}`,
      };
    }

    return {
      ok: true,
      uuid,
      status: res.data.status,
      fqdn: res.data.fqdn,
      message: `Status: ${res.data.status ?? "unknown"}`,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.warn("Coolify status check error", { error: message });
    return { ok: false, uuid, message };
  }
}
