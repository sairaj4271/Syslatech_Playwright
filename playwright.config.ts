// playwright.config.ts
import { defineConfig } from "@playwright/test";
import { configManager } from "./src/config/env.index";
import "./src/utils/runtimeGlobal";


const baseURL = configManager.getBaseURL();
const browserConf = configManager.getBrowserConfig();

export default defineConfig({
  testDir: "./src/tests",
  timeout: 900_000,

  expect: {
    timeout: 25_000,
  },

  use: {
    baseURL,
    headless: browserConf.headless,

    // 🟩 USE FULL SCREEN SIZE (browser window handles it)
    viewport: null,
launchOptions: {
  args: [
    "--start-maximized",
    "--window-size=1920,1080"
  ],
},
    actionTimeout: configManager.getTimeout("action"),
    navigationTimeout: configManager.getTimeout("navigation"),

    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],

  reporter: [
     ["list"],
    ["html", { open: "never" }],
    ["junit", { outputFile: "reports/results.xml" }],
    ["allure-playwright"],
  ],
});
