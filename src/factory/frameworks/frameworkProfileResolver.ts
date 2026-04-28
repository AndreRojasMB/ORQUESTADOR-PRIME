import {
  frameworkProfileBoundaries,
  frameworkProfiles,
  supportedFrameworkIds,
} from "./frameworkProfiles.js";
import type {
  FrameworkId,
  FrameworkProfile,
  FrameworkProfileResult,
  FrameworkProfileValidationFinding,
} from "./types.js";

const normalizeId = (value: string): string =>
  value.trim().toLowerCase().replace(/_/g, "-");

const normalizePath = (value: string): string =>
  value.trim().replace(/\\/g, "/").toLowerCase();

const makeFinding = (
  reasonCode: string,
  safeMessage: string,
  frameworkId?: string,
): FrameworkProfileValidationFinding => ({
  id: "finding_1",
  severity: "fail",
  reasonCode,
  safeMessage,
  ...(frameworkId ? { frameworkId } : {}),
});

const isFrameworkId = (value: string): value is FrameworkId =>
  supportedFrameworkIds.includes(value as FrameworkId);

const result = (
  status: FrameworkProfileResult["status"],
  errors: FrameworkProfileValidationFinding[],
  warnings: FrameworkProfileValidationFinding[] = [],
  profile?: FrameworkProfile,
  score?: number,
  matchedSignals?: string[],
): FrameworkProfileResult => ({
  ok: status !== "framework_not_found" && errors.length === 0,
  status,
  ...(profile ? { profile } : {}),
  ...(typeof score === "number" ? { score } : {}),
  ...(matchedSignals ? { matchedSignals } : {}),
  warnings,
  errors,
  advisoryOnly: true,
  boundaries: frameworkProfileBoundaries,
});

const signalMatchesPath = (signalValue: string, rawPath: string): boolean => {
  const value = normalizePath(signalValue);
  const path = normalizePath(rawPath);

  if (!value) {
    return false;
  }
  if (value.startsWith(".")) {
    return path.endsWith(value);
  }
  if (value.endsWith("/")) {
    return path.includes(value);
  }
  return path.endsWith(`/${value}`) || path === value || path.includes(`/${value}/`);
};

export const getFrameworkProfile = (
  frameworkId: FrameworkId | string,
): FrameworkProfileResult => {
  const normalized = normalizeId(frameworkId);
  if (!isFrameworkId(normalized)) {
    return result("framework_not_found", [
      makeFinding(
        "FRAMEWORK_NOT_FOUND",
        "Requested framework profile is not in the supported source registry.",
        frameworkId,
      ),
    ]);
  }

  const profile = frameworkProfiles.find((item) => item.id === normalized);
  return profile
    ? result("profile_found", [], [], profile)
    : result("framework_not_found", [
        makeFinding(
          "FRAMEWORK_NOT_FOUND",
          "Requested framework profile is not in the supported source registry.",
          normalized,
        ),
      ]);
};

export const listFrameworkProfiles = (): FrameworkProfile[] =>
  frameworkProfiles.map((profile) => ({ ...profile }));

export const scoreFrameworkProfilesFromPaths = (
  paths: readonly string[],
): FrameworkProfileResult[] =>
  frameworkProfiles.map((profile) => {
    const matchedSignals = profile.detectionSignals
      .filter((signal) => paths.some((path) => signalMatchesPath(signal.value, path)))
      .map((signal) => signal.signalId);

    return result(
      "scored",
      [],
      [],
      profile,
      matchedSignals.length,
      matchedSignals,
    );
  });
