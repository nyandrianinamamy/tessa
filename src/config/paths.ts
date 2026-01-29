import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { OpenClawConfig } from "./types.js";

/**
 * Nix mode detection: When TESSA_NIX_MODE=1, the gateway is running under Nix.
 * In this mode:
 * - No auto-install flows should be attempted
 * - Missing dependencies should produce actionable Nix-specific error messages
 * - Config is managed externally (read-only from Nix perspective)
 */
export function resolveIsNixMode(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.TESSA_NIX_MODE === "1" || env.CLAWDBOT_NIX_MODE === "1";
}

export const isNixMode = resolveIsNixMode();

const NEW_STATE_DIRNAME = ".tessa";
const LEGACY_STATE_DIRNAME_1 = ".moltbot";
const LEGACY_STATE_DIRNAME_2 = ".clawdbot";
const LEGACY_STATE_DIRNAME_3 = ".moldbot";
const CONFIG_FILENAME = "tessa.json";
const LEGACY_CONFIG_FILENAME_1 = "moltbot.json";
const LEGACY_CONFIG_FILENAME_2 = "clawdbot.json";
const LEGACY_CONFIG_FILENAME_3 = "moldbot.json";
const LEGACY_CONFIG_FILENAMES = [
  LEGACY_CONFIG_FILENAME_1,
  LEGACY_CONFIG_FILENAME_2,
  LEGACY_CONFIG_FILENAME_3,
] as const;

function newStateDir(homedir: () => string = os.homedir): string {
  return path.join(homedir(), NEW_STATE_DIRNAME);
}

function legacyStateDir1(homedir: () => string = os.homedir): string {
  return path.join(homedir(), LEGACY_STATE_DIRNAME_1);
}

function legacyStateDir2(homedir: () => string = os.homedir): string {
  return path.join(homedir(), LEGACY_STATE_DIRNAME_2);
}

function legacyStateDirs(homedir: () => string = os.homedir): string[] {
  return [
    path.join(homedir(), LEGACY_STATE_DIRNAME_2),
    path.join(homedir(), LEGACY_STATE_DIRNAME_1),
    path.join(homedir(), LEGACY_STATE_DIRNAME_3),
  ];
}

export function resolveNewStateDir(homedir: () => string = os.homedir): string {
  return newStateDir(homedir);
}

export function resolveLegacyStateDir(homedir: () => string = os.homedir): string {
  // Return the most legacy (.clawdbot) for backward compatibility functions
  return legacyStateDir2(homedir);
}

export function resolveLegacyStateDirs(homedir: () => string = os.homedir): string[] {
  return legacyStateDirs(homedir);
}

/**
 * State directory for mutable data (sessions, logs, caches).
 * Can be overridden via TESSA_STATE_DIR (preferred), MOLTBOT_STATE_DIR, or CLAWDBOT_STATE_DIR (legacy).
 * Default: ~/.tessa (new default)
 * Fallback order: ~/.tessa → ~/.moltbot → ~/.clawdbot
 */
export function resolveStateDir(
  env: NodeJS.ProcessEnv = process.env,
  homedir: () => string = os.homedir,
): string {
  const override =
    env.TESSA_STATE_DIR?.trim() || env.MOLTBOT_STATE_DIR?.trim() || env.CLAWDBOT_STATE_DIR?.trim();
  if (override) return resolveUserPath(override);
  const newDir = newStateDir(homedir);
  const legacy1Dir = legacyStateDir1(homedir);
  const legacy2Dir = legacyStateDir2(homedir);
  const hasNew = fs.existsSync(newDir);
  const hasLegacy1 = fs.existsSync(legacy1Dir);
  const hasLegacy2 = fs.existsSync(legacy2Dir);
  if (hasNew) return newDir;
  if (hasLegacy1) return legacy1Dir;
  if (hasLegacy2) return legacy2Dir;
  return newDir; // Default to new directory
}

function resolveUserPath(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith("~")) {
    const expanded = trimmed.replace(/^~(?=$|[\\/])/, os.homedir());
    return path.resolve(expanded);
  }
  return path.resolve(trimmed);
}

export const STATE_DIR = resolveStateDir();

/**
 * Config file path (JSON5).
 * Can be overridden via TESSA_CONFIG_PATH (preferred), MOLTBOT_CONFIG_PATH, or CLAWDBOT_CONFIG_PATH (legacy).
 * Default: $STATE_DIR/tessa.json
 */
export function resolveCanonicalConfigPath(
  env: NodeJS.ProcessEnv = process.env,
  stateDir: string = resolveStateDir(env, os.homedir),
): string {
  const override =
    env.TESSA_CONFIG_PATH?.trim() ||
    env.MOLTBOT_CONFIG_PATH?.trim() ||
    env.CLAWDBOT_CONFIG_PATH?.trim();
  if (override) return resolveUserPath(override);
  return path.join(stateDir, CONFIG_FILENAME);
}

/**
 * Resolve the active config path by preferring existing config candidates
 * before falling back to the canonical path.
 */
export function resolveConfigPathCandidate(
  env: NodeJS.ProcessEnv = process.env,
  homedir: () => string = os.homedir,
): string {
  const candidates = resolveDefaultConfigCandidates(env, homedir);
  const existing = candidates.find((candidate) => {
    try {
      return fs.existsSync(candidate);
    } catch {
      return false;
    }
  });
  if (existing) return existing;
  return resolveCanonicalConfigPath(env, resolveStateDir(env, homedir));
}

/**
 * Active config path (prefers existing config files in order: tessa.json, moltbot.json, clawdbot.json).
 */
export function resolveConfigPath(
  env: NodeJS.ProcessEnv = process.env,
  stateDir: string = resolveStateDir(env, os.homedir),
  homedir: () => string = os.homedir,
): string {
  const override =
    env.TESSA_CONFIG_PATH?.trim() ||
    env.MOLTBOT_CONFIG_PATH?.trim() ||
    env.CLAWDBOT_CONFIG_PATH?.trim();
  if (override) return resolveUserPath(override);
  const stateOverride =
    env.TESSA_STATE_DIR?.trim() || env.MOLTBOT_STATE_DIR?.trim() || env.CLAWDBOT_STATE_DIR?.trim();
  const candidates = [
    path.join(stateDir, CONFIG_FILENAME),
    ...LEGACY_CONFIG_FILENAMES.map((name) => path.join(stateDir, name)),
  ];
  const existing = candidates.find((candidate) => {
    try {
      return fs.existsSync(candidate);
    } catch {
      return false;
    }
  });
  if (existing) return existing;
  if (stateOverride) return path.join(stateDir, CONFIG_FILENAME);
  const defaultStateDir = resolveStateDir(env, homedir);
  if (path.resolve(stateDir) === path.resolve(defaultStateDir)) {
    return resolveConfigPathCandidate(env, homedir);
  }
  return path.join(stateDir, CONFIG_FILENAME);
}

export const CONFIG_PATH = resolveConfigPathCandidate();

/**
 * Resolve default config path candidates across new + legacy locations.
 * Order: explicit config path → state-dir-derived paths → new default → legacy defaults.
 */
export function resolveDefaultConfigCandidates(
  env: NodeJS.ProcessEnv = process.env,
  homedir: () => string = os.homedir,
): string[] {
  const explicit =
    env.TESSA_CONFIG_PATH?.trim() ||
    env.MOLTBOT_CONFIG_PATH?.trim() ||
    env.CLAWDBOT_CONFIG_PATH?.trim();
  if (explicit) return [resolveUserPath(explicit)];

  const candidates: string[] = [];
  const tessaStateDir = env.TESSA_STATE_DIR?.trim();
  if (tessaStateDir) {
    candidates.push(path.join(resolveUserPath(tessaStateDir), CONFIG_FILENAME));
    for (const name of LEGACY_CONFIG_FILENAMES) {
      candidates.push(path.join(resolveUserPath(tessaStateDir), name));
    }
  }
  const moltbotStateDir = env.MOLTBOT_STATE_DIR?.trim();
  if (moltbotStateDir) {
    candidates.push(path.join(resolveUserPath(moltbotStateDir), CONFIG_FILENAME));
    for (const name of LEGACY_CONFIG_FILENAMES) {
      candidates.push(path.join(resolveUserPath(moltbotStateDir), name));
    }
  }
  const legacyStateDirOverride = env.CLAWDBOT_STATE_DIR?.trim();
  if (legacyStateDirOverride) {
    candidates.push(path.join(resolveUserPath(legacyStateDirOverride), CONFIG_FILENAME));
    for (const name of LEGACY_CONFIG_FILENAMES) {
      candidates.push(path.join(resolveUserPath(legacyStateDirOverride), name));
    }
  }

  const defaultDirs = [newStateDir(homedir), ...legacyStateDirs(homedir)];
  for (const dir of defaultDirs) {
    candidates.push(path.join(dir, CONFIG_FILENAME));
    for (const name of LEGACY_CONFIG_FILENAMES) {
      candidates.push(path.join(dir, name));
    }
  }
  return candidates;
}

export const DEFAULT_GATEWAY_PORT = 18789;

/**
 * Gateway lock directory (ephemeral).
 * Default: os.tmpdir()/tessa-<uid> (uid suffix when available).
 */
export function resolveGatewayLockDir(tmpdir: () => string = os.tmpdir): string {
  const base = tmpdir();
  const uid = typeof process.getuid === "function" ? process.getuid() : undefined;
  const suffix = uid != null ? `tessa-${uid}` : "tessa";
  return path.join(base, suffix);
}

const OAUTH_FILENAME = "oauth.json";

/**
 * OAuth credentials storage directory.
 *
 * Precedence:
 * - `TESSA_OAUTH_DIR` (explicit override, preferred)
 * - `CLAWDBOT_OAUTH_DIR` (legacy override)
 * - `$*_STATE_DIR/credentials` (canonical server/default)
 */
export function resolveOAuthDir(
  env: NodeJS.ProcessEnv = process.env,
  stateDir: string = resolveStateDir(env, os.homedir),
): string {
  const override = env.TESSA_OAUTH_DIR?.trim() || env.CLAWDBOT_OAUTH_DIR?.trim();
  if (override) return resolveUserPath(override);
  return path.join(stateDir, "credentials");
}

export function resolveOAuthPath(
  env: NodeJS.ProcessEnv = process.env,
  stateDir: string = resolveStateDir(env, os.homedir),
): string {
  return path.join(resolveOAuthDir(env, stateDir), OAUTH_FILENAME);
}

export function resolveGatewayPort(
  cfg?: OpenClawConfig,
  env: NodeJS.ProcessEnv = process.env,
): number {
  const envRaw = env.TESSA_GATEWAY_PORT?.trim() || env.CLAWDBOT_GATEWAY_PORT?.trim();
  if (envRaw) {
    const parsed = Number.parseInt(envRaw, 10);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  const configPort = cfg?.gateway?.port;
  if (typeof configPort === "number" && Number.isFinite(configPort)) {
    if (configPort > 0) return configPort;
  }
  return DEFAULT_GATEWAY_PORT;
}
