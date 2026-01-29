export const PROJECT_NAME = "tessa" as const;
export const LEGACY_PROJECT_NAME_1 = "moltbot" as const;
export const LEGACY_PROJECT_NAME_2 = "clawdbot" as const;

// For backward compatibility
export const LEGACY_PROJECT_NAME = LEGACY_PROJECT_NAME_2;

export const LEGACY_PROJECT_NAMES = [LEGACY_PROJECT_NAME_1, LEGACY_PROJECT_NAME_2] as const;

export const MANIFEST_KEY = PROJECT_NAME;

export const LEGACY_MANIFEST_KEYS = LEGACY_PROJECT_NAMES;

export const PLUGIN_MANIFEST_FILENAME = "tessa.plugin.json" as const;
export const LEGACY_PLUGIN_MANIFEST_FILENAME_1 = "moltbot.plugin.json" as const;
export const LEGACY_PLUGIN_MANIFEST_FILENAME_2 = "clawdbot.plugin.json" as const;

// For backward compatibility
export const LEGACY_MANIFEST_KEY = LEGACY_PROJECT_NAME_2;
export const LEGACY_PLUGIN_MANIFEST_FILENAME = LEGACY_PLUGIN_MANIFEST_FILENAME_2;

export const LEGACY_PLUGIN_MANIFEST_FILENAMES = [
  LEGACY_PLUGIN_MANIFEST_FILENAME_1,
  LEGACY_PLUGIN_MANIFEST_FILENAME_2,
] as const;

export const LEGACY_CANVAS_HANDLER_NAME = `${LEGACY_PROJECT_NAME_2}CanvasA2UIAction` as const;

export const LEGACY_CANVAS_HANDLER_NAMES = [LEGACY_CANVAS_HANDLER_NAME] as const;

export const MACOS_APP_SOURCES_DIR = "apps/macos/Sources/Tessa" as const;

export const LEGACY_MACOS_APP_SOURCES_DIR = "apps/macos/Sources/Clawdbot" as const;
export const LEGACY_MACOS_APP_SOURCES_DIR_1 = "apps/macos/Sources/Moltbot" as const;

export const LEGACY_MACOS_APP_SOURCES_DIRS = [
  LEGACY_MACOS_APP_SOURCES_DIR,
  LEGACY_MACOS_APP_SOURCES_DIR_1,
] as const;
