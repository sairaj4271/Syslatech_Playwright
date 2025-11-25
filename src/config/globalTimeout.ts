// src/config/globalTimeout.ts
import { configManager } from "./env.index";
import type { TimeoutKeys } from "./types";

export const Global_Timeout: Record<TimeoutKeys, number> = {
  action: configManager.getTimeout("action"),
  wait: configManager.getTimeout("wait"),
  navigation: configManager.getTimeout("navigation"),
};

// If you prefer old style:
export const GLOBAL_TIMEOUT = {
  ACTION: Global_Timeout.action,
  WAIT: Global_Timeout.wait,
  NAVIGATION: Global_Timeout.navigation,
};
