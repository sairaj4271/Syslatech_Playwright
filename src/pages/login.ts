import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './basePage';
import { ElementUtils } from '../utils/elementUtils';
import { WaitUtils } from '../utils/waitUtils';
import { ErrorHandler } from '../utils/errorHandler';
import { logger } from '../utils/logger';
import { configManager } from '../config/env.index';
import { Global_Timeout } from '../config/globalTimeout';

export class LoginPage extends BasePage {
  private loginMenu: Locator;
  private usernameInput: Locator;
  private passwordInput: Locator;
  private loginButton: Locator;
  private dashboardHeader: Locator;

  constructor(page: Page) {
    super(page);

    this.loginMenu = page.locator('(//div[text()="Login"])[1]');
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.locator('button[type="submit"]');
    this.dashboardHeader = page.locator('(//*[contains(text(),"+ Dashboard")])[1]');
  }

  async navigateTo(): Promise<this> {
    return ErrorHandler.handle(async () => {
      const url = configManager.getBaseURL();
      logger.info(` Opening Base URL: ${url}`);

      await this.page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: Global_Timeout.navigation,
      });

      const domain = url.replace(/^https?:\/\//, '').split('/')[0];

      await WaitUtils.waitForURLContains(this.page, domain, Global_Timeout.navigation);

      return this;
    });
  }

  async clickLoginMenu(): Promise<this> {
    return ErrorHandler.handle(async () => {
      await ElementUtils.click(this.loginMenu, { timeout: Global_Timeout.action });
      return this;
    });
  }

  async login(): Promise<this> {
    return ErrorHandler.handle(async () => {
      const { username, password } = configManager.getCredentials();

      //  This now prints the REAL test user, not your Windows username
      logger.info(`Logging in as: ${username}`);

      await ElementUtils.fill(this.usernameInput, username, { timeout: Global_Timeout.action });
      await ElementUtils.fill(this.passwordInput, password, { timeout: Global_Timeout.action });
      await ElementUtils.click(this.loginButton, { timeout: Global_Timeout.action });

      // Wait for login success
      await WaitUtils.waitForElementIsVisible(this.dashboardHeader, Global_Timeout.wait);

      logger.info(` Login successful`);

      return this;
    });
  }

  async validateUI(): Promise<this> {
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeEnabled();
    return this;
  }
}
