// playwright.config.ts
import { defineConfig } from "@playwright/test";
import { configManager } from "./src/config/env.index";
import "./src/utils/runtimeGlobal";

// Read runtime configs
const baseURL = configManager.getBaseURL();
const browserConf = configManager.getBrowserConfig();

// Detect Jenkins CI
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./src/tests",

  // Full test timeout (15 mins)
  timeout: 900_000,

  expect: {
    timeout: 25_000,
  },

  use: {
    baseURL,

    // CI → Always headless, Local → use your env config
    headless: isCI ? true : browserConf.headless,

    // Viewport handling
    viewport: null,

    // Jenkins uses secure args
    launchOptions: isCI
      ? {
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        }
      : {
          args: ["--start-maximized", "--window-size=1920,1080"],
        },

    actionTimeout: configManager.getTimeout("action"),
    navigationTimeout: configManager.getTimeout("navigation"),

    screenshot: isCI ? "only-on-failure" : "only-on-failure",
    video: isCI ? "retain-on-failure" : "retain-on-failure",
    trace: isCI ? "retain-on-failure" : "retain-on-failure",
  },

  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : 4,

  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],

  reporter: isCI
    ? [
        ["list"],
        ["junit", { outputFile: "reports/results.xml" }],
        ["html"]
        ["allure-playwright"],
      ]
    : [
        ["list"],
        ["html", { open: "never" }],
        ["junit", { outputFile: "reports/results.xml" }],
        ["allure-playwright"],
      ],
});
