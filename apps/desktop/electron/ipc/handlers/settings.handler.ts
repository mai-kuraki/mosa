import { ok, err, type Result } from "@mosa/shared-utils";
import { createLogger } from "../../services/logger.service";

const logger = createLogger("ipc:settings");

interface AppSettings {
  exportDefaults: {
    format: "jpeg" | "png" | "tiff";
    quality: number;
    outputDir: string;
  };
  watermark: {
    enabled: boolean;
    templatePath: string;
    position: string;
    opacity: number;
    scale: number;
  };
  appearance: {
    theme: "dark";
    language: string;
  };
  performance: {
    workerCount: number;
    previewQuality: number;
  };
}

const defaultSettings: AppSettings = {
  exportDefaults: {
    format: "jpeg",
    quality: 90,
    outputDir: "",
  },
  watermark: {
    enabled: false,
    templatePath: "",
    position: "bottom-right",
    opacity: 0.8,
    scale: 0.15,
  },
  appearance: {
    theme: "dark",
    language: "zh-CN",
  },
  performance: {
    workerCount: 0, // 0 = auto (cpu count - 1)
    previewQuality: 80,
  },
};

let currentSettings: AppSettings = { ...defaultSettings };

export async function handleSettingsGet(): Promise<Result<AppSettings, string>> {
  try {
    // TODO: Load from electron-store
    return ok(currentSettings);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return err(message);
  }
}

export async function handleSettingsSet(
  data: Partial<AppSettings>
): Promise<Result<void, string>> {
  try {
    logger.info("Updating settings");
    currentSettings = { ...currentSettings, ...data };
    // TODO: Persist to electron-store
    return ok(undefined);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return err(message);
  }
}
