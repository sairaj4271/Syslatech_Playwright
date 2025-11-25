```
BasePage: HIGH-LEVEL PAGE ACTIONS ONLY ✅
==========================================

✅ 1. NAVIGATION
   - navigateTo(url)
   - goto(path)
   - goBack()
   - goForward()
   - reload()

✅ 2. PAGE INFORMATION
   - getPageURL()
   - getPageTitle()
   - getPageContent()
   - getPageSource()
   - isPageVisible()
   - waitForPageLoad(state)

✅ 3. LOCATOR RESOLVER
   - getLocator(selector)  → Converts CSS/XPath to Playwright Locators

✅ 4. TOP-LEVEL WRAPPERS FOR ACTIONS (delegate to ElementUtils)
   - click(selector) → ElementUtils.click(locator)
   - doubleClick(selector) → ElementUtils.doubleClick(locator)
   - rightClick(selector) → ElementUtils.rightClick(locator)
   - hover(selector) → ElementUtils.hoverOver(locator)
   - focus(selector)
   - blur(selector)
   - clickAndWait(selector, timeout)
   
   - fill(selector, text) → ElementUtils.fill(locator, text)
   - type(selector, text, delay) → ElementUtils.type(locator, text)
   - clear(selector) → ElementUtils.clear(locator)
   - pressKey(selector, key)
   
   - getText(selector) → ElementUtils.getText(locator)
   - getAttribute(selector, attribute) → ElementUtils.getAttribute(locator)
   - getPlaceholder(selector) → getAttribute(selector, 'placeholder')
   - getValue(selector) → getAttribute(selector, 'value')
   - getAllText(selector)
   
   - isVisible(selector) → ElementUtils.isVisible(locator)
   - isHidden(selector)
   - isEnabled(selector) → ElementUtils.isEnabled(locator)
   - isDisabled(selector)
   - exists(selector)
   - isChecked(selector)
   
   - selectDropdown(selector, value) → ElementUtils.selectOption(locator)
   - getSelectedDropdownValue(selector)
   - check(selector)
   - uncheck(selector)
   
   - uploadFile(selector, filePath) → ElementUtils.uploadFile(locator)

✅ 5. PAGE HELPERS
   - clickAll(selector) → Click all matching elements
   - getCount(selector) → Get element count
   - getVisibleCount(selector) → Count visible elements only
   - logElement(selector) → Log element debug info

✅ 6. WAITING (delegate to WaitUtils)
   - waitForElement(selector) → WaitUtils.waitForElement(locator)
   - waitForElementToDisappear(selector) → WaitUtils.waitForElementToDisappear(locator)
   - waitForText(selector, text) → Local check with utility
   - waitForCondition(fn, timeout) → Local polling
   - delay(ms) → Simple sleep

✅ 7. KEYBOARD/MOUSE
   - hotkey(key1, key2) → Press key combination
   - typeInPage(text) → Direct keyboard input

✅ 8. SCREENSHOT & DEBUGGING
   - takeScreenshot(name) → Save screenshot
   - logElement(selector) → Debug element properties

✅ 9. PAGE UTILITIES
   - closePage()
   - getPage() → Return Playwright Page object

================================================================================
ARCHITECTURE FLOW
================================================================================

TEST CODE
   ↓
BasePage.click("selector")
   ↓
ElementUtils.click(locator)  ← Low-level Playwright action
   ↓
Page element clicked

TEST CODE
   ↓
BasePage.waitForElement("selector")
   ↓
WaitUtils.waitForElement(locator)  ← Low-level Playwright wait
   ↓
Element visible or timeout

================================================================================
KEY PRINCIPLE
================================================================================

✅ BasePage: "What can I do on this page?"
   - Test-friendly API
   - Works with selectors (strings)
   - High-level operations
   
✅ ElementUtils: "How do I interact with an element?"
   - Low-level Playwright API
   - Works with Locators (objects)
   - Reusable element actions
   
✅ WaitUtils: "How do I wait for things?"
   - All waiting strategies
   - Load states, element visibility, conditions
   - Timeout handling

================================================================================
COMPILATION STATUS
================================================================================

✅ src/pages/basePage.ts - COMPILES (0 errors)
✅ src/tests/simple-home.spec.ts - COMPILES (0 errors)
✅ src/utils/elementUtils.ts - COMPILES (0 errors)
✅ src/utils/waitUtils.ts - COMPILES (0 errors)

================================================================================
USAGE EXAMPLE
================================================================================

// Test using BasePage
test('should fill search form', async ({ basePage }) => {
  await basePage.navigateTo('https://www.makemytrip.com');
  
  // High-level actions
  await basePage.fill('input[name="search"]', 'Delhi');
  await basePage.click('button[type="submit"]');
  
  // Wait for results
  await basePage.waitForElement('.flight-results');
  
  // Get data
  const flightCount = await basePage.getCount('.flight-card');
  const firstFlightText = await basePage.getText('.flight-card:first-child');
  
  // Debug
  await basePage.logElement('.flight-card:first-child');
  await basePage.takeScreenshot('flight-results');
});

================================================================================
ARCHITECTURE COMPLETE ✅
================================================================================

This clean architecture ensures:
✓ Single Responsibility Principle
✓ Easy to maintain and extend
✓ Tests are readable and focused
✓ Utils are reusable across page objects
✓ Clear separation of concerns
✓ Production-ready

Ready for test development! 🚀

# Playwright Automation Architecture: `ElementUtils` & `BasePage`

## ElementUtils

- **Layer:** Utility (Low-level)
- **Purpose:** Implements all reusable, atomic element actions.
- **Responsibilities:**
  - Directly interacts with Playwright `Locator` objects.
  - Implements logic for:
    - `click`, `doubleClick`, `rightClick`, `hoverOver`
    - `fill`, `type`, `clear`, `pressKey`
    - `getText`, `getAttribute`, `isVisible`, `isHidden`, `isEnabled`, `isDisabled`, `isChecked`, `exists`
    - `selectOption`, `uploadFile`, `getCount`, etc.
  - No page-specific or business logic.
- **Usage:** Called by `BasePage` wrappers to perform actual element operations.

---

## BasePage

- **Layer:** Page Object (High-level)
- **Purpose:** Provides high-level, page-agnostic wrappers for element actions.
- **Responsibilities:**
  - Exposes methods like `click(selector)`, `fill(selector, text)`, `waitForElement(selector)`, etc.
  - Each method is a thin wrapper that delegates to the corresponding `ElementUtils` or `WaitUtils` method.
  - No low-level element logic; only delegates and handles page-level context (e.g., resolving selectors, logging).
  - Can be extended by specific page objects for business flows.

---

## Example Flow

```typescript
// In a page object:
class HomePage extends BasePage {
  async searchFlight() {
    await this.fill('#from', 'Delhi'); // Delegates to ElementUtils.fill
    await this.click('#search');       // Delegates to ElementUtils.click
    await this.waitForElement('#results'); // Delegates to WaitUtils.waitForElement
  }
}
```

---

**Summary:**
- All logic for interacting with elements is in `ElementUtils`.
- `BasePage` only provides wrappers and delegates to utilities, ensuring strict separation of concerns and high reusability.
