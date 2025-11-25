// src/config/types.ts
export type Environment = "dev" | "qa";

export type TimeoutKeys = "action" | "wait" | "navigation";

export interface TimeoutConfig {
  action: number;
  wait: number;
  navigation: number;
}

export interface CredentialsConfig {
  username: string;
  password: string;
}

export interface BrowserConfig {
  headless: boolean;
  slowMo?: number;
  timeout: number;
}

export interface LoggingConfig {
  level: "debug" | "info" | "warn" | "error";
  verbose?: boolean;
}

export interface RequestOptionsConfig {
  timeout: number;
  retries: number;
}

export interface AppConfig {
  env: Environment;
  baseURL: string;
  easyURL: string;
  apiBaseURL?: string;
  credentials: CredentialsConfig;
  timeouts: TimeoutConfig;
  browser: BrowserConfig;
  requestOptions?: RequestOptionsConfig;
  logging?: LoggingConfig;
}
