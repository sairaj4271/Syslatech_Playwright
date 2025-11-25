// ============================================================================
//  BASE PAGE - ENTERPRISE LEVEL WITH AUTO-NAME LOGGING
// ============================================================================

import { Page, Locator, expect } from "@playwright/test";
import { ElementUtils } from "../utils/elementUtils";
import { WaitUtils } from "../utils/waitUtils";
import { ErrorHandler } from "../utils/errorHandler";
import { RetryOptions } from "../utils/retryUtils";
import { configManager } from "../config/env.index";
import { Global_Timeout } from "../config/globalTimeout";
import { Runtime } from "../utils/runtimeStore";


/**
 * BasePage - Enterprise-level reusable page actions
 *
 * HOW IT WORKS:
 * - Central abstraction for all common Playwright actions
 * - Wraps low-level operations with:
 *   - Auto-name logging
 *   - Error handling
 *   - Global timeouts
 *   - Method chaining
 *
 * WHEN TO USE:
 * - As the base class for all Page Object classes
 * - To keep tests readable and DRY
 *
 * @example
 * export class LoginPage extends BasePage {
 *   readonly username = this.getLocator('#username');
 *   readonly password = this.getLocator('#password');
 *   readonly loginBtn = this.getLocator('button[type="submit"]');
 *
 *   async login(user: string, pass: string) {
 *     return this
 *       .fill(this.username, user)
 *       .fill(this.password, pass)
 *       .click(this.loginBtn)
 *       .waitForURL(/dashboard/);
 *   }
 * }
 */
export class BasePage {
  protected page: Page;

  // ========================================================================
  //  CONSTRUCTOR
  // ========================================================================

  /**
   * constructor - Injects Playwright Page instance
   *
   * HOW IT WORKS:
   * - Stores the Playwright Page into `this.page`
   * - All actions and assertions are built on top of this instance
   *
   * WHEN TO USE:
   * - In every Page Object: call `super(page)` in its constructor
   *
   * @param page - Playwright Page instance
   */
  constructor(page: Page) {
    this.page = page;
  }

  // ========================================================================
  //  SELECTOR NORMALIZATION
  // ========================================================================

  /**
   * getLocator - Convert a string selector or Locator into a Locator
   *
   * HOW IT WORKS:
   * - If argument is already a Locator → returns it
   * - If starts with '//' or 'xpath=' → treats it as XPath
   * - Otherwise → treats it as CSS
   *
   * WHEN TO USE:
   * - Internally before calling any Playwright Locator API
   * - For all methods that accept string | Locator
   *
   * @param selector - CSS/XPath selector string or Locator
   * @returns Locator
   *
   * @example
   * const button = this.getLocator('#submit');
   * const row = this.getLocator('//tr[@data-id="1"]');
   */
  protected getLocator(selector: string | Locator): Locator {
    if (typeof selector !== "string") return selector;

    if (selector.startsWith("//") || selector.startsWith("xpath=")) {
      return this.page.locator(`xpath=${selector.replace("xpath=", "")}`);
    }

    return this.page.locator(selector);
  }

  // ========================================================================
  //  🧠 AUTO-NAME LOGGING ENGINE
  // ========================================================================

  /**
   * getElementName - Extract readable, human-friendly name for logs
   *
   * HOW IT WORKS:
   * - If explicit label is provided → returns it
   * - For Locators:
   *   - Tries to map to Page Object property (e.g. `loginButton`)
   *   - Falls back to parsing locator.toString()
   * - For string selectors:
   *   - Cleans CSS/XPath to something readable
   *
   * WHEN TO USE:
   * - Internally in every logging-aware method (click, fill, waits, asserts)
   *
   * @param selector - Selector or Locator
   * @param explicitLabel - Optional label override
   * @returns Friendly element name
   */
  protected getElementName(
    selector: string | Locator,
    explicitLabel?: string
  ): string {
    if (explicitLabel) return explicitLabel;

    // If Locator → try Page Object property mapping first
    if (typeof selector !== "string") {
      try {
        for (const key of Object.getOwnPropertyNames(this)) {
          if ((this as any)[key] === selector) {
            return key;
          }
        }
      } catch {
        // ignore reflection errors
      }

      // Fallback to locator.toString()
      try {
        const locAsString = selector.toString();

        // getByRole(...)
        const roleMatch = locAsString.match(/getByRole\((.*?)\)/);
        if (roleMatch) return roleMatch[1].replace(/["{}]/g, "").trim();

        // getByText(...)
        const textMatch = locAsString.match(/getByText\((.*?)\)/);
        if (textMatch) return `text=${textMatch[1].replace(/["]/g, "")}`;

        // getByTestId(...)
        const testIdMatch = locAsString.match(/getByTestId\((.*?)\)/);
        if (testIdMatch) return `testId=${testIdMatch[1].replace(/["]/g, "")}`;

        // locator("css=...")
        const cssMatch = locAsString.match(/locator\("([^"]+)"\)/);
        if (cssMatch) return this.extractLabelFromSelector(cssMatch[1]);

        // locator('xpath=...')
        const xpathMatch = locAsString.match(/locator\('xpath=(.*?)'\)/);
        if (xpathMatch) return this.extractLabelFromSelector(xpathMatch[1]);
      } catch {
        // ignore
      }

      return "UnknownElement";
    }

    // If plain string selector
    return this.extractLabelFromSelector(selector);
  }

  /**
   * extractLabelFromSelector - Convert raw selector into a short label
   *
   * HOW IT WORKS:
   * - "#loginBtn"  → "loginBtn"
   * - ".menu-item" → "menu-item"
   * - "//div[@id='x']" → "div-id-x"
   *
   * WHEN TO USE:
   * - Internally from getElementName() only
   *
   * @param selector - Raw CSS/XPath selector
   * @returns Clean label string
   */
  private extractLabelFromSelector(selector: string): string {
    let clean = selector
      .replace(/^css=/, "")
      .replace(/^xpath=/, "")
      .trim();

    if (clean.startsWith("#")) return clean.slice(1); // id
    if (clean.startsWith(".")) return clean.replace(/\./g, "-"); // class

    const textMatch = clean.match(/text\((.*?)\)|text=['"](.*?)['"]/);
    if (textMatch) {
      const t = textMatch[1] || textMatch[2];
      return t.trim().replace(/\s+/g, "_");
    }

    if (clean.startsWith("//") || clean.includes("@")) {
      return clean
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .substring(0, 30);
    }

    return clean.substring(0, 30);
  }

  // ========================================================================
  //  🌐 NAVIGATION
  // ========================================================================

  /**
   * navigateTo - Navigate to absolute URL
   *
   * HOW IT WORKS:
   * - Calls page.goto(url) with 'domcontentloaded'
   * - Then waits for 'networkidle' using WaitUtils
   *
   * WHEN TO USE:
   * - For external URLs or when not using baseURL
   *
   * @param url - Full URL
   * @returns this
   *
   * @example
   * await this.navigateTo('https://example.com/login');
   */
  async navigateTo(url: string): Promise<this> {
    console.log(` Navigate To → ${url}`);

    return ErrorHandler.handle<this>(
      async () => {
        await this.page.goto(url, {
          waitUntil: "domcontentloaded",
          timeout: Global_Timeout.navigation,
        });

        await WaitUtils.waitForLoadState(
          this.page,
          "networkidle",
          Global_Timeout.navigation
        );

        return this;
      },
      { context: `BasePage.navigateTo (${url})` }
    );
  }

  /**
   * goto - Navigate using baseURL + relative path
   *
   * HOW IT WORKS:
   * - Reads baseURL from configManager
   * - Concats path and delegates to navigateTo()
   *
   * WHEN TO USE:
   * - For all app routes relative to the configured baseURL
   *
   * @param path - Relative path (default "/")
   * @returns this
   *
   * @example
   * await this.goto('/dashboard');
   */
  async goto(path = "/"): Promise<this> {
    const fullUrl = `${configManager.getBaseURL()}${path}`;
    console.log(` Goto → ${fullUrl}`);
    return this.navigateTo(fullUrl);
  }

  /**
   * reload - Refresh current page
   *
   * HOW IT WORKS:
   * - Calls page.reload() with domcontentloaded
   *
   * WHEN TO USE:
   * - To refresh data or recover from transient errors
   *
   * @returns this
   */
  async reload(): Promise<this> {
    console.log(" Reload Page");

    return ErrorHandler.handle<this>(
      async () => {
        await this.page.reload({ waitUntil: "domcontentloaded" });
        return this;
      },
      { context: "BasePage.reload" }
    );
  }

  /**
   * goBack - Browser back navigation
   *
   * HOW IT WORKS:
   * - Calls page.goBack() with domcontentloaded
   *
   * WHEN TO USE:
   * - To simulate browser back (history -1)
   *
   * @returns this
   */
  async goBack(): Promise<this> {
    console.log(" Go Back");

    return ErrorHandler.handle<this>(
      async () => {
        await this.page.goBack({ waitUntil: "domcontentloaded" });
        return this;
      },
      { context: "BasePage.goBack" }
    );
  }

  /**
   * goForward - Browser forward navigation
   *
   * HOW IT WORKS:
   * - Calls page.goForward() with domcontentloaded
   *
   * WHEN TO USE:
   * - For scenarios verifying browser forward functionality
   *
   * @returns this
   */
  async goForward(): Promise<this> {
    console.log(" Go Forward");

    return ErrorHandler.handle<this>(
      async () => {
        await this.page.goForward({ waitUntil: "domcontentloaded" });
        return this;
      },
      { context: "BasePage.goForward" }
    );
  }

  // ========================================================================
  //  🧱 ELEMENT ACTIONS
  // ========================================================================

  /**
   * click - Click on element with retry and logging
   *
   * HOW IT WORKS:
   * - Normalizes selector to Locator
   * - Delegates to ElementUtils.click with global timeout
   * - Passes label to ElementUtils for nice logs
   *
   * WHEN TO USE:
   * - For all standard click interactions
   *
   * @example
   * await this.click('#submit');
   * await this.click(this.loginButton);
   */
  async click(
    selector: string | Locator,
    options?: {
      force?: boolean;
      label?: string;
      retryOptions?: RetryOptions;
    }
  ): Promise<this> {
    const name = this.getElementName(selector, options?.label);
    console.log(` Click → ${name}`);

    return ErrorHandler.handle<this>(
      async () => {
        await ElementUtils.click(this.getLocator(selector), {
          timeout: Global_Timeout.action,
          ...options,
          label: name,
        });
        return this;
      },
      { context: `BasePage.click (${name})` }
    );
  }

  /**
   * doubleClick - Double-click an element
   *
   * HOW IT WORKS:
   * - Calls locator.dblclick() with action timeout
   *
   * WHEN TO USE:
   * - Grid/file table row open actions, etc.
   */
  async doubleClick(selector: string | Locator): Promise<this> {
    const name = this.getElementName(selector);
    console.log(`Double Click → ${name}`);

    return ErrorHandler.handle<this>(
      async () => {
        await this.getLocator(selector).dblclick({
          timeout: Global_Timeout.action,
        });
        return this;
      },
      { context: `BasePage.doubleClick (${name})` }
    );
  }

  /**
   * rightClick - Context-click an element
   *
   * HOW IT WORKS:
   * - Calls locator.click({ button: 'right' })
   *
   * WHEN TO USE:
   * - Context menus, right-click actions
   */
  async rightClick(selector: string | Locator): Promise<this> {
    const name = this.getElementName(selector);
    console.log(` (Right) Click → ${name}`);

    return ErrorHandler.handle<this>(
      async () => {
        await this.getLocator(selector).click({
          button: "right",
          timeout: Global_Timeout.action,
        });
        return this;
      },
      { context: `BasePage.rightClick (${name})` }
    );
  }

  /**
   * fill - Clear & fill input field
   *
   * HOW IT WORKS:
   * - Delegates to ElementUtils.fill with retries
   *
   * WHEN TO USE:
   * - For standard form inputs where fast value set is enough
   */
  async fill(
    selector: string | Locator,
    text: string,
    options?: {
      label?: string;
      retryOptions?: RetryOptions;
    }
  ): Promise<this> {
    const name = this.getElementName(selector, options?.label);
    console.log(` Fill → ${name} | Value: ${text}`);

    return ErrorHandler.handle<this>(
      async () => {
        await ElementUtils.fill(this.getLocator(selector), text, {
          timeout: Global_Timeout.action,
          ...options,
          label: name,
        });
        return this;
      },
      { context: `BasePage.fill (${name})` }
    );
  }

  /**
   * type - Type text (character-by-character)
   *
   * HOW IT WORKS:
   * - Delegates to ElementUtils.type with optional delay
   *
   * WHEN TO USE:
   * - Autocomplete, live-search, reactive fields
   */
  async type(
    selector: string | Locator,
    text: string,
    delay?: number,
    options?: {
      label?: string;
      retryOptions?: RetryOptions;
    }
  ): Promise<this> {
    const name = this.getElementName(selector, options?.label);
    console.log(
      ` Type → ${name} | Value: ${text} | Delay: ${delay ?? 0}ms`
    );

    return ErrorHandler.handle<this>(
      async () => {
        await ElementUtils.type(this.getLocator(selector), text, {
          timeout: Global_Timeout.action,
          delay,
          ...options,
          label: name,
        });
        return this;
      },
      { context: `BasePage.type (${name})` }
    );
  }

  /**
   * clear - Clear input value
   *
   * HOW IT WORKS:
   * - Delegates to ElementUtils.clear
   *
   * WHEN TO USE:
   * - Before retyping or resetting filters
   */
  async clear(selector: string | Locator): Promise<this> {
    const name = this.getElementName(selector);
    console.log(` Clear → ${name}`);

    return ErrorHandler.handle<this>(
      async () => {
        await ElementUtils.clear(this.getLocator(selector));
        return this;
      },
      { context: `BasePage.clear (${name})` }
    );
  }

  /**
   * selectOption - Select option(s) from <select>
   *
   * HOW IT WORKS:
   * - Calls locator.selectOption(value)
   *
   * WHEN TO USE:
   * - Native <select> dropdowns
   */
  async selectOption(
    selector: string | Locator,
    value: string | string[]
  ): Promise<this> {
    const name = this.getElementName(selector);
    console.log(` Select Option → ${name} | Value: ${JSON.stringify(value)}`);

    return ErrorHandler.handle<this>(
      async () => {
        await this.getLocator(selector).selectOption(value, {
          timeout: Global_Timeout.action,
        });
        return this;
      },
      { context: `BasePage.selectOption (${name})` }
    );
  }

  /**
   * check - Check checkbox/radio
   *
   * HOW IT WORKS:
   * - Calls locator.check()
   *
   * WHEN TO USE:
   * - Checkbox or radio-based selections
   */
  async check(selector: string | Locator): Promise<this> {
    const name = this.getElementName(selector);
    console.log(` Check → ${name}`);

    return ErrorHandler.handle<this>(
      async () => {
        await this.getLocator(selector).check({
          timeout: Global_Timeout.action,
        });
        return this;
      },
      { context: `BasePage.check (${name})` }
    );
  }

  /**
   * uncheck - Uncheck checkbox
   *
   * HOW IT WORKS:
   * - Calls locator.uncheck()
   *
   * WHEN TO USE:
   * - When unselecting a checked checkbox
   */
  async uncheck(selector: string | Locator): Promise<this> {
    const name = this.getElementName(selector);
    console.log(` Uncheck → ${name}`);

    return ErrorHandler.handle<this>(
      async () => {
        await this.getLocator(selector).uncheck({
          timeout: Global_Timeout.action,
        });
        return this;
      },
      { context: `BasePage.uncheck (${name})` }
    );
  }

  /**
   * hover - Hover over element
   *
   * HOW IT WORKS:
   * - Calls locator.hover()
   *
   * WHEN TO USE:
   * - Menus/tooltips that appear on hover
   */
  async hover(selector: string | Locator): Promise<this> {
    const name = this.getElementName(selector);
    console.log(` Hover → ${name}`);

    return ErrorHandler.handle<this>(
      async () => {
        await this.getLocator(selector).hover({
          timeout: Global_Timeout.action,
        });
        return this;
      },
      { context: `BasePage.hover (${name})` }
    );
  }

  /**
   * focus - Focus element
   *
   * HOW IT WORKS:
   * - Calls locator.focus()
   *
   * WHEN TO USE:
   * - Before typing or triggering focus events
   */
  async focus(selector: string | Locator): Promise<this> {
    const name = this.getElementName(selector);
    console.log(` Focus → ${name}`);

    return ErrorHandler.handle<this>(
      async () => {
        await this.getLocator(selector).focus({
          timeout: Global_Timeout.action,
        });
        return this;
      },
      { context: `BasePage.focus (${name})` }
    );
  }

  /**
   * press - Press keyboard key on element
   *
   * HOW IT WORKS:
   * - Calls locator.press(key)
   *
   * WHEN TO USE:
   * - For Enter/Tab/Escape shortcuts on fields
   */
  async press(selector: string | Locator, key: string): Promise<this> {
    const name = this.getElementName(selector);
    console.log(` Press → ${name} | Key: ${key}`);

    return ErrorHandler.handle<this>(
      async () => {
        await this.getLocator(selector).press(key, {
          timeout: Global_Timeout.action,
        });
        return this;
      },
      { context: `BasePage.press (${name})` }
    );
  }

  // ========================================================================
  //  ⏳ WAIT METHODS
  // ========================================================================

  /**
   * waitForElementIsVisible - Wait until element is visible
   *
   * HOW IT WORKS:
   * - Delegates to WaitUtils.waitForElementIsVisible
   *
   * WHEN TO USE:
   * - Before interacting with elements that load async
   */
  async waitForElementIsVisible(
    selector: string | Locator,
    timeout?: number
  ): Promise<this> {
    const name = this.getElementName(selector);
    const waitTime = timeout || Global_Timeout.wait;

    console.log(` Wait For Visible → ${name} (Timeout: ${waitTime}ms)`);

    return ErrorHandler.handle<this>(
      async () => {
        await WaitUtils.waitForElementIsVisible(
          this.getLocator(selector),
          waitTime
        );
        return this;
      },
      { context: `BasePage.waitForElementIsVisible (${name})` }
    );
  }

  /**
   * waitForElementToDisappear - Wait until element is hidden or removed
   *
   * HOW IT WORKS:
   * - Delegates to WaitUtils.waitForElementToDisappear
   *
   * WHEN TO USE:
   * - Spinners, loaders, transient modals, etc.
   */
  async waitForElementToDisappear(
    selector: string | Locator,
    timeout?: number
  ): Promise<this> {
    const name = this.getElementName(selector);
    const waitTime = timeout || Global_Timeout.wait;

    console.log(` Wait For Disappear → ${name} (Timeout: ${waitTime}ms)`);

    return ErrorHandler.handle<this>(
      async () => {
        await WaitUtils.waitForElementToDisappear(
          this.getLocator(selector),
          waitTime
        );
        return this;
      },
      { context: `BasePage.waitForElementToDisappear (${name})` }
    );
  }

  /**
   * waitForElementEnabled - Wait until element becomes enabled
   *
   * HOW IT WORKS:
   * - Uses expect(locator).toBeEnabled()
   *
   * WHEN TO USE:
   * - Buttons disabled until form is valid
   */
  async waitForElementEnabled(selector: string | Locator): Promise<this> {
    const name = this.getElementName(selector);
    console.log(`🔓 Wait For Enabled → ${name}`);

    return ErrorHandler.handle<this>(
      async () => {
        await expect(this.getLocator(selector)).toBeEnabled({
          timeout: Global_Timeout.wait,
        });
        return this;
      },
      { context: `BasePage.waitForElementEnabled (${name})` }
    );
  }

  /**
   * waitForURL - Wait for URL match
   *
   * HOW IT WORKS:
   * - Uses page.waitForURL(url)
   *
   * WHEN TO USE:
   * - After navigation or login redirects
   */
  async waitForURL(url: string | RegExp): Promise<this> {
    console.log(` Wait For URL → ${url}`);

    return ErrorHandler.handle<this>(
      async () => {
        await this.page.waitForURL(url, {
          timeout: Global_Timeout.navigation,
        });
        return this;
      },
      { context: `BasePage.waitForURL (${url})` }
    );
  }

  /**
   * waitForLoadState - Wait for a given load state
   *
   * HOW IT WORKS:
   * - Uses page.waitForLoadState(state)
   *
   * WHEN TO USE:
   * - After navigation or heavy async operations
   */
  async waitForLoadState(
    state: "load" | "domcontentloaded" | "networkidle" = "load"
  ): Promise<this> {
    console.log(` Wait For LoadState → ${state}`);

    return ErrorHandler.handle<this>(
      async () => {
        await this.page.waitForLoadState(state, {
          timeout: Global_Timeout.navigation,
        });
        return this;
      },
      { context: `BasePage.waitForLoadState (${state})` }
    );
  }

  /**
   * waitForTextOnPage - Wait until given text appears
   *
   * HOW IT WORKS:
   * - Uses expect(page.getByText(text)).toBeVisible()
   *
   * WHEN TO USE:
   * - For toasts, notifications, status messages
   */
  async waitForTextOnPage(
    text: string | RegExp,
    timeout?: number
  ): Promise<this> {
    const waitTime = timeout || Global_Timeout.wait;

    console.log(`🔎 Wait For Text → ${text} (Timeout: ${waitTime}ms)`);

    return ErrorHandler.handle<this>(
      async () => {
        await expect(this.page.getByText(text)).toBeVisible({
          timeout: waitTime,
        });
        return this;
      },
      { context: `BasePage.waitForTextOnPage (${text})` }
    );
  }

  /**
   * waitForTextDisappear - Wait until text disappears
   *
   * HOW IT WORKS:
   * - Uses expect(page.getByText(text)).not.toBeVisible()
   *
   * WHEN TO USE:
   * - For "Loading..." type messages
   */
  async waitForTextDisappear(
    text: string | RegExp,
    timeout?: number
  ): Promise<this> {
    const waitTime = timeout || Global_Timeout.wait;

    console.log(
      `Wait For Text Disappear → ${text} (Timeout: ${waitTime}ms)`
    );

    return ErrorHandler.handle<this>(
      async () => {
        await expect(this.page.getByText(text)).not.toBeVisible({
          timeout: waitTime,
        });
        return this;
      },
      { context: `BasePage.waitForTextDisappear (${text})` }
    );
  }

  // ========================================================================
  //  📌 ASSERTIONS
  // ========================================================================

  /**
   * assertElementVisible - Assert element is visible
   */
  async assertElementVisible(selector: string | Locator): Promise<this> {
    const name = this.getElementName(selector);
    console.log(` Assert Visible → ${name}`);

    return ErrorHandler.handle<this>(
      async () => {
        await expect(this.getLocator(selector)).toBeVisible({
          timeout: Global_Timeout.wait,
        });
        return this;
      },
      { context: `BasePage.assertElementVisible (${name})` }
    );
  }

  /**
   * assertElementHidden - Assert element is hidden
   */
  async assertElementHidden(selector: string | Locator): Promise<this> {
    const name = this.getElementName(selector);
    console.log(` Assert Hidden → ${name}`);

    return ErrorHandler.handle<this>(
      async () => {
        await expect(this.getLocator(selector)).toBeHidden({
          timeout: Global_Timeout.wait,
        });
        return this;
      },
      { context: `BasePage.assertElementHidden (${name})` }
    );
  }

  /**
   * assertElementEnabled - Assert element is enabled
   */
  async assertElementEnabled(selector: string | Locator): Promise<this> {
    const name = this.getElementName(selector);
    console.log(` Assert Enabled → ${name}`);

    return ErrorHandler.handle<this>(
      async () => {
        await expect(this.getLocator(selector)).toBeEnabled({
          timeout: Global_Timeout.wait,
        });
        return this;
      },
      { context: `BasePage.assertElementEnabled (${name})` }
    );
  }

  /**
   * assertElementDisabled - Assert element is disabled
   */
  async assertElementDisabled(selector: string | Locator): Promise<this> {
    const name = this.getElementName(selector);
    console.log(` Assert Disabled → ${name}`);

    return ErrorHandler.handle<this>(
      async () => {
        await expect(this.getLocator(selector)).toBeDisabled({
          timeout: Global_Timeout.wait,
        });
        return this;
      },
      { context: `BasePage.assertElementDisabled (${name})` }
    );
  }

  /**
   * assertText - Assert text content on element
   */
  async assertText(
    selector: string | Locator,
    text: string | RegExp
  ): Promise<this> {
    const name = this.getElementName(selector);
    console.log(` Assert Text → ${name} == ${text}`);

    return ErrorHandler.handle<this>(
      async () => {
        await expect(this.getLocator(selector)).toHaveText(text, {
          timeout: Global_Timeout.wait,
        });
        return this;
      },
      { context: `BasePage.assertText (${name})` }
    );
  }

  /**
   * assertValue - Assert input value
   */
  async assertValue(
    selector: string | Locator,
    value: string | RegExp
  ): Promise<this> {
    const name = this.getElementName(selector);
    console.log(` Assert Value → ${name} == ${value}`);

    return ErrorHandler.handle<this>(
      async () => {
        await expect(this.getLocator(selector)).toHaveValue(value, {
          timeout: Global_Timeout.wait,
        });
        return this;
      },
      { context: `BasePage.assertValue (${name})` }
    );
  }

  /**
   * assertURL - Assert page URL matches expected
   */
  async assertURL(url: string | RegExp): Promise<this> {
    console.log(` Assert URL → ${url}`);

    return ErrorHandler.handle<this>(
      async () => {
        await expect(this.page).toHaveURL(url, {
          timeout: Global_Timeout.wait,
        });
        return this;
      },
      { context: `BasePage.assertURL (${url})` }
    );
  }

  /**
   * assertTitle - Assert page title
   */
  async assertTitle(title: string | RegExp): Promise<this> {
    console.log(` Assert Title → ${title}`);

    return ErrorHandler.handle<this>(
      async () => {
        await expect(this.page).toHaveTitle(title, {
          timeout: Global_Timeout.wait,
        });
        return this;
      },
      { context: `BasePage.assertTitle (${title})` }
    );
  }

  /**
   * assertElementCount - Assert number of matched elements
   */
  async assertElementCount(
    selector: string | Locator,
    count: number
  ): Promise<this> {
    const name = this.getElementName(selector);
    console.log(`🔢 Assert Count → ${name} = ${count}`);

    return ErrorHandler.handle<this>(
      async () => {
        await expect(this.getLocator(selector)).toHaveCount(count, {
          timeout: Global_Timeout.wait,
        });
        return this;
      },
      { context: `BasePage.assertElementCount (${name})` }
    );
  }

  // ========================================================================
  //  🔍 QUERY METHODS (Non-asserting)
  // ========================================================================

  /**
   * isVisible - Immediate visibility check (does not wait)
   */
  async isVisible(selector: string | Locator): Promise<boolean> {
    const name = this.getElementName(selector);
    console.log(`👁️ isVisible → ${name}`);

    return ErrorHandler.handle<boolean>(
      async () => {
        return await this.getLocator(selector).isVisible();
      },
      { context: `BasePage.isVisible (${name})` }
    );
  }

  /**
   * isEnabled - Check if element is enabled
   */
  async isEnabled(selector: string | Locator): Promise<boolean> {
    const name = this.getElementName(selector);
    console.log(`🔓 isEnabled → ${name}`);

    return ErrorHandler.handle<boolean>(
      async () => {
        return await this.getLocator(selector).isEnabled();
      },
      { context: `BasePage.isEnabled (${name})` }
    );
  }

  /**
   * isChecked - Check if checkbox/radio is checked
   */
  async isChecked(selector: string | Locator): Promise<boolean> {
    const name = this.getElementName(selector);
    console.log(`☑️ isChecked → ${name}`);

    return ErrorHandler.handle<boolean>(
      async () => {
        return await this.getLocator(selector).isChecked();
      },
      { context: `BasePage.isChecked (${name})` }
    );
  }

  /**
   * getText - Get textContent of element
   */
  async getText(selector: string | Locator): Promise<string> {
    const name = this.getElementName(selector);
    console.log(`📄 getText → ${name}`);

    return ErrorHandler.handle<string>(
      async () => {
        return (await this.getLocator(selector).textContent())?.trim() || "";
      },
      { context: `BasePage.getText (${name})` }
    );
  }

  /**
   * getInputValue - Get input/textarea value
   */
  async getInputValue(selector: string | Locator): Promise<string> {
    const name = this.getElementName(selector);
    console.log(`🔤 getInputValue → ${name}`);

    return ErrorHandler.handle<string>(
      async () => {
        return await this.getLocator(selector).inputValue();
      },
      { context: `BasePage.getInputValue (${name})` }
    );
  }

  /**
   * getAttribute - Read attribute from element
   */
  async getAttribute(
    selector: string | Locator,
    attribute: string
  ): Promise<string | null> {
    const name = this.getElementName(selector);
    console.log(`🧬 getAttribute → ${name}[${attribute}]`);

    return ErrorHandler.handle<string | null>(
      async () => {
        return await this.getLocator(selector).getAttribute(attribute);
      },
      { context: `BasePage.getAttribute (${name})` }
    );
  }

  /**
   * getElementCount - Get count of matched elements
   */
  async getElementCount(selector: string | Locator): Promise<number> {
    const name = this.getElementName(selector);
    console.log(`🔢 getElementCount → ${name}`);

    return ErrorHandler.handle<number>(
      async () => {
        return await this.getLocator(selector).count();
      },
      { context: `BasePage.getElementCount (${name})` }
    );
  }

  // ========================================================================
  //  💬 DIALOG HANDLING
  // ========================================================================

  /**
   * acceptDialog - Accept the next JavaScript dialog
   *
   * HOW IT WORKS:
   * - Registers one-time listener and accepts on appearance
   */
  async acceptDialog(promptText?: string): Promise<this> {
    console.log(`✅ Preparing To Accept Next Dialog`);

    this.page.once("dialog", (dialog) => {
      console.log(`📥 Dialog Appeared → Accept`);
      dialog.accept(promptText);
    });

    return this;
  }

  /**
   * dismissDialog - Dismiss the next JavaScript dialog
   *
   * HOW IT WORKS:
   * - Registers one-time listener and dismisses on appearance
   */
  async dismissDialog(): Promise<this> {
    console.log(`❌ Preparing To Dismiss Next Dialog`);

    this.page.once("dialog", (dialog) => {
      console.log(`📥 Dialog Appeared → Dismiss`);
      dialog.dismiss();
    });

    return this;
  }

  // ========================================================================
  //  🧩 IFRAME HANDLING
  // ========================================================================

  /**
   * switchToFrame - Switch context to iframe
   *
   * HOW IT WORKS:
   * - Normalizes iframe locator
   * - Calls contentFrame() and returns frame as Page-like object
   */
  async switchToFrame(selector: string | Locator): Promise<Page> {
    const name = this.getElementName(selector);
    console.log(`🧩 Switch To Frame → ${name}`);

    return ErrorHandler.handle<Page>(
      async () => {
        const frameElement = this.getLocator(selector);
        const frame = await frameElement.contentFrame();
        if (!frame) throw new Error(`Frame not found: ${name}`);
        return frame as unknown as Page;
      },
      { context: `BasePage.switchToFrame (${name})` }
    );
  }

  // ========================================================================
  //  📜 SCROLL METHODS
  // ========================================================================

  /**
   * scrollToElement - Scroll element into view
   */
  async scrollToElement(selector: string | Locator): Promise<this> {
    const name = this.getElementName(selector);
    console.log(`🎯 Scroll To Element → ${name}`);

    return ErrorHandler.handle<this>(
      async () => {
        await this.getLocator(selector).scrollIntoViewIfNeeded({
          timeout: 5000,
        });
        return this;
      },
      { context: `BasePage.scrollToElement (${name})` }
    );
  }

  /**
   * scrollToTop - Scroll to page top
   */
  async scrollToTop(): Promise<this> {
    console.log(`⬆️ Scroll To Top`);

    return ErrorHandler.handle<this>(
      async () => {
        await this.page.evaluate(() => {
          window.scrollTo(0, 0);
        });
        return this;
      },
      { context: "BasePage.scrollToTop" }
    );
  }

  /**
   * scrollToBottom - Scroll to bottom of page
   */
  async scrollToBottom(): Promise<this> {
    console.log(`⬇️ Scroll To Bottom`);

    return ErrorHandler.handle<this>(
      async () => {
        await this.page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight);
        });
        return this;
      },
      { context: "BasePage.scrollToBottom" }
    );
  }

  /**
   * scrollBy - Scroll by X/Y offset
   */
  async scrollBy(x: number, y: number): Promise<this> {
    console.log(`↕️ Scroll By → x=${x}, y=${y}`);

    return ErrorHandler.handle<this>(
      async () => {
        await this.page.evaluate(
          ({ scrollX, scrollY }) => {
            window.scrollBy(scrollX, scrollY);
          },
          { scrollX: x, scrollY: y }
        );
        return this;
      },
      { context: "BasePage.scrollBy" }
    );
  }

  // ========================================================================
  //  📸 SCREENSHOTS
  // ========================================================================

  /**
   * takeScreenshot - Full page screenshot
   */
  async takeScreenshot(name = "screenshot"): Promise<void> {
    const fileName = `${name}_${Date.now()}.png`;
    console.log(`📸 Full Screenshot → ${fileName}`);

    return ErrorHandler.handle<void>(
      async () => {
        await this.page.screenshot({
          path: `test-results/screenshots/${fileName}`,
          fullPage: true,
        });
      },
      { context: `BasePage.takeScreenshot (${fileName})` }
    );
  }

  /**
   * takeElementScreenshot - Screenshot of a specific element
   */
  async takeElementScreenshot(
    selector: string | Locator,
    name = "element"
  ): Promise<void> {
    const elemName = this.getElementName(selector);
    const fileName = `${name}_${Date.now()}.png`;

    console.log(`🎯 Element Screenshot → ${elemName} → ${fileName}`);

    return ErrorHandler.handle<void>(
      async () => {
        await this.getLocator(selector).screenshot({
          path: `test-results/screenshots/${fileName}`,
        });
      },
      { context: `BasePage.takeElementScreenshot (${elemName})` }
    );
  }

  // ========================================================================
  //  🔧 LOW-LEVEL UTILITIES
  // ========================================================================

  /**
   * getCurrentURL - Get current URL
   */
  getCurrentURL(): string {
    const url = this.page.url();
    console.log(`🌍 getCurrentURL → ${url}`);
    return url;
  }

  /**
   * getTitle - Get current page title
   */
  async getTitle(): Promise<string> {
    const title = await this.page.title();
    console.log(`🏷️ getTitle → ${title}`);
    return title;
  }

  /**
   * getPage - Return underlying Playwright Page instance
   */
  getPage(): Page {
    console.log(`📄 getPage → Playwright.Page returned`);
    return this.page;
  }

  /**
   * pause - Hard wait (use sparingly)
   *
   * HOW IT WORKS:
   * - Uses page.waitForTimeout(ms)
   *
   * WHEN TO USE:
   * - Debugging or non-deterministic transitions
   */
  async pause(milliseconds?: number): Promise<this> {
    const ms = milliseconds || 1000;
    console.log(`⏸️ pause → ${ms}ms`);

    await this.page.waitForTimeout(ms);
    return this;
  }
  // ============================================================================
//  RUNTIME STORE HELPERS (Enterprise Level)
//  These helper methods store values from UI elements into runtime variables.
//  Works exactly like Testsigma → “Store text/value/attribute into variable”.
// ============================================================================

/**
 * storeTextContent()
 * ----------------------------------------------------------------------------
 * HOW IT WORKS:
 *  1. Converts selector into a Playwright Locator (CSS/XPath supported)
 *  2. Reads the element’s textContent()
 *  3. Removes extra spaces using trim()
 *  4. Stores the text into Runtime Store under the provided key
 *
 * WHEN TO USE:
 *  - To store labels, button names, hotel names, city names, etc.
 *  - To compare before → after values across pages
 *  - To store dynamic UI text for later validation
 *
 * EXAMPLE:
 *  await this.storeTextContent(this.hotelName, "HOTEL");
 *  // Later:
 *  console.log($("HOTEL"));   // → prints the hotel name
 */
async storeTextContent(selector: Locator | string, key: string): Promise<void> {
    const loc = this.getLocator(selector);
    const value = (await loc.textContent())?.trim() || "";
    Runtime.set(key, value);
}


/**
 * storeInputValue()
 * ----------------------------------------------------------------------------
 * HOW IT WORKS:
 *  1. Converts the selector to a Locator
 *  2. Fetches the value using inputValue() (works for <input> & <textarea>)
 *  3. Trims the value and stores it into runtime
 *  4. If inputValue() fails (non-input element), stores an empty string
 *
 * WHEN TO USE:
 *  - For input fields like search boxes, city inputs, OTP boxes, form fields
 *  - When you need to validate a typed value later in the test
 *
 * EXAMPLE:
 *  await this.storeInputValue(this.cityInput, "CITY");
 *  console.log($("CITY"));  // → "Goa"
 */
async storeInputValue(selector: Locator | string, key: string): Promise<void> {
    const loc = this.getLocator(selector);
    let value = "";

    try {
        value = (await loc.inputValue())?.trim();
    } catch {
        value = "";
    }

    Runtime.set(key, value);
}


/**
 * storeAttributeValue()
 * ----------------------------------------------------------------------------
 * HOW IT WORKS:
 *  1. Converts selector into a locator
 *  2. Reads an attribute value using locator.getAttribute(attrName)
 *  3. Trims the value and stores it in runtime under provided key
 *
 * WHEN TO USE:
 *  - For storing IDs, aria-labels, data-* attributes, href, src, role, title
 *  - For capturing metadata used later for validation or dynamic actions
 *
 * EXAMPLE:
 *  await this.storeAttributeValue(this.hotelCard, "data-id", "HOTEL_ID");
 *  console.log($("HOTEL_ID"));  // → something like "HTL1234"
 */
async storeAttributeValue(
    selector: Locator | string,
    attribute: string,
    key: string
): Promise<void> {
    const loc = this.getLocator(selector);
    const value = (await loc.getAttribute(attribute))?.trim() || "";
    Runtime.set(key, value);
}

}
