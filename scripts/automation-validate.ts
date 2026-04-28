import { randomUUID } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { basename } from "node:path";

import { validateAutomationWorkflow } from "../src/automation/validator.js";
import type {
  AutomationSafeMetadata,
  AutomationValidationBoundaries,
  AutomationValidationFinding,
  AutomationValidationResult,
  AutomationValidationStatus,
} from "../src/automation/types.js";

const MAX_INPUT_BYTES = 1024 * 1024;
const SCHEMA_VERSION = "1.0";

const BOUNDARIES: AutomationValidationBoundaries = {
  noExecution: true,
  noNodeRuns: true,
  noStoreMutation: true,
  noLocksCreated: true,
  noProviderCalls: true,
  noNetwork: true,
  noActionDispatch: true,
  noProposalCreation: true,
  noApprovalExecution: true,
  noCredentialAccess: true,
};

interface CliArgs {
  inputPath?: string;
  pretty: boolean;
}

interface InputSummary {
  fileName?: string;
  pathRedacted: true;
  sizeBytes?: number;
}

interface AutomationValidationCliErrorResult {
  validationId: string;
  createdAt: string;
  schemaVersion: "1.0";
  valid: false;
  status: "fail";
  errors: AutomationValidationFinding[];
  warnings: AutomationValidationFinding[];
  advisoryOnly: true;
  boundaries: AutomationValidationBoundaries;
  inputSummary: InputSummary;
}

type AutomationValidationCliSuccessResult = AutomationValidationResult & {
  inputSummary: InputSummary;
};

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { pretty: false };

  for (const arg of argv) {
    if (arg === "--pretty") {
      args.pretty = true;
      continue;
    }
    if (arg === "--json") {
      continue;
    }
    if (arg.startsWith("--input=")) {
      args.inputPath = arg.slice("--input=".length);
      continue;
    }
    throw newCliError("automation.cli.unknown_arg", "Unknown CLI argument.", {
      argCount: argv.length,
    });
  }

  if (!args.inputPath?.trim()) {
    throw newCliError("automation.cli.input_missing", "Input file is required.");
  }

  return {
    ...args,
    inputPath: args.inputPath.trim(),
  };
}

async function readWorkflowJson(inputPath: string): Promise<{
  value: unknown;
  inputSummary: InputSummary;
}> {
  const inputSummary: InputSummary = {
    fileName: basename(inputPath),
    pathRedacted: true,
  };

  let stats;
  try {
    stats = await stat(inputPath);
  } catch {
    throw newCliError(
      "automation.cli.input_unreadable",
      "Input file could not be read.",
      undefined,
      inputSummary,
    );
  }

  inputSummary.sizeBytes = stats.size;

  if (stats.isDirectory()) {
    throw newCliError(
      "automation.cli.input_is_directory",
      "Input path points to a directory.",
      undefined,
      inputSummary,
    );
  }
  if (stats.size > MAX_INPUT_BYTES) {
    throw newCliError(
      "automation.cli.file_too_large",
      "Input file exceeds the maximum allowed size.",
      { maxInputBytes: MAX_INPUT_BYTES },
      inputSummary,
    );
  }

  let raw: string;
  try {
    raw = await readFile(inputPath, "utf8");
  } catch {
    throw newCliError(
      "automation.cli.input_unreadable",
      "Input file could not be read.",
      undefined,
      inputSummary,
    );
  }

  try {
    return {
      value: JSON.parse(raw) as unknown,
      inputSummary,
    };
  } catch {
    throw newCliError(
      "automation.cli.json_invalid",
      "Input file is not valid JSON.",
      undefined,
      inputSummary,
    );
  }
}

function newCliError(
  reasonCode: string,
  safeMessage: string,
  metadata?: AutomationSafeMetadata,
  inputSummary?: InputSummary,
): AutomationValidationCliError {
  return new AutomationValidationCliError(
    buildErrorResult({
      reasonCode,
      safeMessage,
      metadata,
      inputSummary,
    }),
  );
}

class AutomationValidationCliError extends Error {
  readonly result: AutomationValidationCliErrorResult;

  constructor(result: AutomationValidationCliErrorResult) {
    super(result.errors[0]?.safeMessage ?? "Automation validation CLI failed.");
    this.result = result;
  }
}

function buildErrorResult(input: {
  reasonCode: string;
  safeMessage: string;
  metadata?: AutomationSafeMetadata;
  inputSummary?: InputSummary;
}): AutomationValidationCliErrorResult {
  return {
    validationId: `autocli_${randomUUID()}`,
    createdAt: new Date().toISOString(),
    schemaVersion: SCHEMA_VERSION,
    valid: false,
    status: "fail",
    errors: [
      {
        id: `autoclifind_${randomUUID()}`,
        severity: "fail",
        reasonCode: input.reasonCode,
        safeMessage: input.safeMessage,
        ...(input.metadata ? { metadata: input.metadata } : {}),
      },
    ],
    warnings: [],
    advisoryOnly: true,
    boundaries: BOUNDARIES,
    inputSummary: input.inputSummary ?? { pathRedacted: true },
  };
}

function writeJson(
  result: AutomationValidationCliSuccessResult | AutomationValidationCliErrorResult,
  pretty: boolean,
): void {
  process.stdout.write(`${JSON.stringify(result, null, pretty ? 2 : 0)}\n`);
}

async function main(): Promise<void> {
  let args: CliArgs;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (error) {
    const result = error instanceof AutomationValidationCliError
      ? error.result
      : buildErrorResult({
        reasonCode: "automation.cli.execution_error",
        safeMessage: "Automation validation CLI failed before reading input.",
      });
    writeJson(result, true);
    process.exitCode = 1;
    return;
  }

  try {
    const inputPath = args.inputPath;
    if (!inputPath) {
      throw newCliError("automation.cli.input_missing", "Input file is required.");
    }
    const { value, inputSummary } = await readWorkflowJson(inputPath);
    const result: AutomationValidationCliSuccessResult = {
      ...validateAutomationWorkflow(value),
      inputSummary,
    };
    writeJson(result, args.pretty);
    process.exitCode = result.status === "fail" ? 1 : 0;
  } catch (error) {
    const result = error instanceof AutomationValidationCliError
      ? error.result
      : buildErrorResult({
        reasonCode: "automation.cli.execution_error",
        safeMessage: "Automation validation CLI failed.",
      });
    writeJson(result, args.pretty);
    process.exitCode = 1;
  }
}

await main();
