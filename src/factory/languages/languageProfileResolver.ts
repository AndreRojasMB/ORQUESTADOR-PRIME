import {
  languageProfileBoundaries,
  languageProfiles,
  supportedLanguageIds,
} from "./languageProfiles.js";
import type {
  LanguageId,
  LanguageProfile,
  LanguageProfileResult,
  LanguageProfileValidationFinding,
} from "./types.js";

const normalizeId = (value: string): string =>
  value.trim().toLowerCase().replace(/_/g, "-");

const normalizePath = (value: string): string =>
  value.trim().replace(/\\/g, "/").toLowerCase();

const makeFinding = (
  reasonCode: string,
  safeMessage: string,
  languageId?: string,
): LanguageProfileValidationFinding => ({
  id: "finding_1",
  severity: "fail",
  reasonCode,
  safeMessage,
  ...(languageId ? { languageId } : {}),
});

const isLanguageId = (value: string): value is LanguageId =>
  supportedLanguageIds.includes(value as LanguageId);

const result = (
  status: LanguageProfileResult["status"],
  errors: LanguageProfileValidationFinding[],
  warnings: LanguageProfileValidationFinding[] = [],
  profile?: LanguageProfile,
  score?: number,
  matchedSignals?: string[],
): LanguageProfileResult => ({
  ok: status !== "language_not_found" && errors.length === 0,
  status,
  ...(profile ? { profile } : {}),
  ...(typeof score === "number" ? { score } : {}),
  ...(matchedSignals ? { matchedSignals } : {}),
  warnings,
  errors,
  advisoryOnly: true,
  boundaries: languageProfileBoundaries,
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

export const getLanguageProfile = (
  languageId: LanguageId | string,
): LanguageProfileResult => {
  const normalized = normalizeId(languageId);
  if (!isLanguageId(normalized)) {
    return result("language_not_found", [
      makeFinding(
        "LANGUAGE_NOT_FOUND",
        "Requested language profile is not in the supported source registry.",
        languageId,
      ),
    ]);
  }

  const profile = languageProfiles.find((item) => item.id === normalized);
  return profile
    ? result("profile_found", [], [], profile)
    : result("language_not_found", [
        makeFinding(
          "LANGUAGE_NOT_FOUND",
          "Requested language profile is not in the supported source registry.",
          normalized,
        ),
      ]);
};

export const listLanguageProfiles = (): LanguageProfile[] =>
  languageProfiles.map((profile) => ({ ...profile }));

export const scoreLanguageProfilesFromPaths = (
  paths: readonly string[],
): LanguageProfileResult[] =>
  languageProfiles.map((profile) => {
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
