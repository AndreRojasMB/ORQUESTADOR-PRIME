// src/coolify/coolifyClient.ts
// HTTP client for the Coolify REST API.
// All endpoints require Bearer token auth via COOLIFY_API_TOKEN.
// Base route: http://<host>:8000/api/v1

import { COOLIFY_CONFIG } from "../config.js";

// ─── Types ───────────────────────────────────────────────────────

export interface CoolifyApplication {
  uuid: string;
  name: string;
  description?: string | undefined;
  fqdn?: string | undefined;
  status?: string | undefined;
  git_repository?: string | undefined;
  git_branch?: string | undefined;
  build_pack?: string | undefined;
  created_at?: string | undefined;
  updated_at?: string | undefined;
}

export interface CoolifyServer {
  uuid: string;
  name: string;
  ip: string;
  description?: string | undefined;
}

export interface CoolifyProject {
  uuid: string;
  name: string;
  description?: string | undefined;
}

export interface CoolifyCreateAppRequest {
  project_uuid: string;
  server_uuid: string;
  environment_name?: string | undefined;
  git_repository: string;
  git_branch?: string | undefined;
  build_pack?: string | undefined;
  ports_exposes?: string | undefined;
  name?: string | undefined;
  description?: string | undefined;
  domains?: string | undefined;
  is_auto_deploy_enabled?: boolean | undefined;
}

export interface CoolifyApiResponse<T = unknown> {
  ok: boolean;
  data?: T | undefined;
  error?: string | undefined;
  statusCode: number;
}

// ─── Helpers ─────────────────────────────────────────────────────

function baseUrl(): string {
  return COOLIFY_CONFIG.apiUrl.replace(/\/+$/, "");
}

function headers(): Record<string, string> {
  const h: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  };
  if (COOLIFY_CONFIG.token) {
    h["Authorization"] = `Bearer ${COOLIFY_CONFIG.token}`;
  }
  return h;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<CoolifyApiResponse<T>> {
  const url = `${baseUrl()}/api/v1${path}`;

  const res = await fetch(url, {
    method,
    headers: headers(),
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });

  const data = await res.json().catch(() => null) as T | null;

  if (!res.ok) {
    const errMsg =
      data && typeof data === "object" && "message" in data
        ? String((data as Record<string, unknown>).message)
        : `Coolify API error (${res.status})`;
    return { ok: false, error: errMsg, statusCode: res.status };
  }

  return { ok: true, data: data ?? undefined, statusCode: res.status };
}

// ─── Applications ────────────────────────────────────────────────

export async function listApplications(): Promise<CoolifyApiResponse<CoolifyApplication[]>> {
  return request<CoolifyApplication[]>("GET", "/applications");
}

export async function getApplication(uuid: string): Promise<CoolifyApiResponse<CoolifyApplication>> {
  return request<CoolifyApplication>("GET", `/applications/${uuid}`);
}

export async function createApplication(
  config: CoolifyCreateAppRequest
): Promise<CoolifyApiResponse<CoolifyApplication>> {
  return request<CoolifyApplication>("POST", "/applications/public", config);
}

export async function deployApplication(uuid: string): Promise<CoolifyApiResponse> {
  return request("POST", `/deploy?uuid=${uuid}`, {});
}

export async function startApplication(uuid: string): Promise<CoolifyApiResponse> {
  return request("POST", `/applications/${uuid}/start`, {});
}

export async function stopApplication(uuid: string): Promise<CoolifyApiResponse> {
  return request("POST", `/applications/${uuid}/stop`, {});
}

export async function restartApplication(uuid: string): Promise<CoolifyApiResponse> {
  return request("POST", `/applications/${uuid}/restart`, {});
}

// ─── Servers & Projects ──────────────────────────────────────────

export async function listServers(): Promise<CoolifyApiResponse<CoolifyServer[]>> {
  return request<CoolifyServer[]>("GET", "/servers");
}

export async function listProjects(): Promise<CoolifyApiResponse<CoolifyProject[]>> {
  return request<CoolifyProject[]>("GET", "/projects");
}
