import { getDueJobs, updateJobStatus } from "./jobStore.js";
import { runJob } from "./jobRunner.js";
import type { JobRecord, JobRunResult } from "./types.js";

export interface RunDueJobsOptions {
  now?: Date;
  limit?: number;
}

export interface RunDueJobsResult {
  selected: number;
  ran: number;
  results: JobRunResult[];
}

function clampLimit(limit: number | undefined): number | null {
  if (limit === undefined) {
    return null;
  }
  if (!Number.isInteger(limit) || limit <= 0) {
    throw new Error("job run limit must be a positive integer");
  }
  return Math.min(limit, 100);
}

function isExpired(job: JobRecord, now: Date): boolean {
  if (!job.expiresAt) {
    return false;
  }
  const expiresMs = Date.parse(job.expiresAt);
  return Number.isFinite(expiresMs) && expiresMs <= now.getTime();
}

export async function selectDueJobs(
  now = new Date(),
  limit?: number,
): Promise<JobRecord[]> {
  const jobs = await getDueJobs(now);
  const capped = clampLimit(limit);
  return capped === null ? jobs : jobs.slice(0, capped);
}

export async function runDueJobs(
  options: RunDueJobsOptions = {},
): Promise<RunDueJobsResult> {
  const now = options.now ?? new Date();
  const jobs = await selectDueJobs(now, options.limit);
  const results: JobRunResult[] = [];

  for (const job of jobs) {
    if (isExpired(job, now)) {
      await updateJobStatus({
        jobId: job.jobId,
        status: "expired",
        lastErrorCode: "job.expired",
        log: {
          timestamp: now.toISOString(),
          event: "expired",
          safeMessage: "Job expired before manual runner could run it.",
          errorCode: "job.expired",
          redaction: null,
          relatedId: null,
        },
      });
      continue;
    }
    results.push(await runJob(job));
  }

  return {
    selected: jobs.length,
    ran: results.length,
    results,
  };
}
