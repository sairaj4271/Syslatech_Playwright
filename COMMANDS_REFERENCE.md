# 📋 Quick Reference - NPM Commands & Framework Usage

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Run All Tests
```bash
npm run test
```

---

## 🧪 Test Execution Commands

### Environment-Specific Testing
```bash
# Development environment (headless: false, slowMo: 500ms, verbose logging)
npm run test:dev

# QA environment (headless: true, minimal slowMo)
npm run test:qa
```

### Test Suite Selection
```bash
# Run all tests
npm run test

# Run API tests only
npm run test:api

# Run UI tests only
npm run test:ui

# Run MakeMyTrip UI tests specifically
npm run test:mmt
```

### Browser-Specific Testing
```bash
# Chromium browser
npm run test:chrome

# Firefox browser
npm run test:firefox

# WebKit (Safari) browser
npm run test:webkit
```

### Execution Modes
```bash
# Run in headed mode (visible browser)
npm run test:headed

# Run in debug mode (Playwright Inspector)
npm run test:debug

# Run with parallel workers (4 workers)
npm run test:parallel
```

### Reporting
```bash
# View HTML test report
npm run test:report

# Record test codegen (record tests)
npm run test:codegen
```

---

## 📊 Available Test Suites

### UI Tests: Flight Search (`src/tests/ui/mmt/mmt-search.spec.ts`)
- ✅ Search flights successfully
- ✅ Retrieve flight details
- ✅ Retrieve multiple flight options
- ✅ Sort flights by price
- ✅ Filter flights by price range
- ✅ Handle search with no results
- ✅ Validate roundtrip search
- ✅ Select passenger count
- ✅ Select cabin class

### API Tests: Booking (`src/tests/api/booking-api-e2e.spec.ts`)
- ✅ Create new booking
- ✅ Retrieve booking information
- ✅ Update booking details
- ✅ Get booking status
- ✅ Retrieve list of bookings
- ✅ Initiate refund
- ✅ Handle booking cancellation
- ✅ Handle authentication
- ✅ Get user profile

---

## 💻 Example Test Commands

```bash
# Run all tests in Chrome
npm run test:chrome

# Run only MakeMyTrip UI tests in headed mode
ENVIRONMENT=dev npm run test:mmt -- --headed

# Run API tests in debug mode
npm run test:api -- --debug

# Run specific test file
npx playwright test src/tests/ui/mmt/mmt-search.spec.ts

# Run specific test by name
npx playwright test -g "should search for flights"
```

---

## 🔧 Configuration

### Available Environments
```javascript
// Development (dev)
ENVIRONMENT=dev npm run test

// QA (qa)
ENVIRONMENT=qa npm run test
```

### Browser Configuration
Edit `playwright.config.ts` to modify:
- Browser options (headless, slowMo, etc.)
- Timeout settings
- Viewport size
- Device emulation

### Environment Configuration
Edit files in `src/config/`:
- `env.dev.ts` - Development settings
- `env.qa.ts` - QA settings
- `env.index.ts` - ConfigManager logic

---

## 📂 Test Data Locations

### API Test Data
```
test-data/api/sample-payloads.json
├── valid_booking
├── multi_passenger_booking
├── hotel_booking
└── booking_with_refund
```

### UI Test Data
```
test-data/ui/mmt-search-data.json
├── search_flights
├── search_international
└── search_oneWay
```

---

## 🏗️ Framework Structure

### Utilities Available in Tests
```typescript
import { logger } from '@utils/logger';              // 6-level logging
import { WaitUtils } from '@utils/waitUtils';        // Retry strategies
import { ElementUtils } from '@utils/elementUtils';  // DOM interactions
import { ErrorHandler } from '@utils/errorHandler';  // Error handling
```

### Services Available in Tests
```typescript
import { authService } from '@services/authService';           // Auth operations
import { bookingService } from '@services/bookingService';     // Booking operations
```

### Page Objects Available in Tests
```typescript
import { HomePage } from '@pages/mmt/HomePage';
import { SearchResultsPage } from '@pages/mmt/SearchResultsPage';
```

### Using Custom Fixtures
```typescript
import { test, expect } from '@fixtures/testFixtures';

test('my test', async ({
  homePage,           // HomePage instance
  searchResultsPage,  // SearchResultsPage instance
  basePage,          // BasePage instance
  logger,            // Logger instance
  configManager,     // ConfigManager instance
  authService,       // AuthService instance
  bookingService     // BookingService instance
}) => {
  // All fixtures are pre-initialized
});
```

---

## 📊 Common Use Cases

### Case 1: Run development tests in headed mode
```bash
npm run test:dev -- --headed
```

### Case 2: Run specific browser tests
```bash
npm run test:firefox
npm run test:chrome
```

### Case 3: Run tests with specific environment
```bash
ENVIRONMENT=qa npm run test
ENVIRONMENT=dev npm run test
```

### Case 4: Run and view reports
```bash
npm run test && npm run test:report
```

### Case 5: Debug specific test
```bash
npx playwright test src/tests/ui/mmt/mmt-search.spec.ts --debug
```

### Case 6: Record new tests
```bash
npm run test:codegen
```

---

## 🎯 Debugging Tips

### Enable Debug Logging
```typescript
import { logger } from '@utils/logger';
logger.setLevel('debug');  // Enable debug logs
```

### Use Playwright Inspector
```bash
npm run test:debug
```

### Check Logs
```bash
# View generated logs
tail -f logs/*.log
```

### Screenshot on Failure
Tests automatically capture screenshots on failure in `test-results/screenshots/`

### Video Recording
Videos are retained on failure in `test-results/`

---

## 📈 Performance Tips

### Run Tests in Parallel
```bash
npm run test:parallel
```

### Run Specific Browser Only
```bash
npm run test:chrome
```

### Run Subset of Tests
```bash
npm run test:api        # API only
npm run test:ui         # UI only
npm run test:mmt        # MakeMyTrip only
```

---

## 🔍 Verification

### Verify Framework Setup
```bash
./verify-framework.sh    # On Linux/Mac
.\verify-framework.sh    # On Windows (if converted to PowerShell)
```

### Check All Files Created
```bash
# All framework files should exist
ls -la src/config/
ls -la src/utils/
ls -la src/api/
ls -la src/services/
ls -la src/pages/mmt/
ls -la src/fixtures/
ls -la src/tests/
ls -la test-data/
```

---

## 📝 Test Report Locations

After running tests, find reports at:
- **HTML Report**: `playwright-report/index.html`
- **JUnit XML**: `test-results/junit.xml`
- **JSON Results**: `test-results/results.json`
- **Screenshots**: `test-results/screenshots/`
- **Videos**: `test-results/`

---

## 🎓 Example Usage

### Example 1: Complete Test Scenario
```typescript
import { test, expect } from '@fixtures/testFixtures';

test('complete flight booking journey', async ({
  homePage,
  searchResultsPage,
  bookingService,
  logger
}) => {
  logger.info('Starting booking journey');
  
  // Search for flights
  await homePage.navigateToHome();
  await homePage.enterDepartureCity('Delhi');
  await homePage.enterDestinationCity('Mumbai');
  await homePage.searchFlights('Delhi', 'Mumbai');
  
  // Verify results
  const flights = await searchResultsPage.getAllFlights();
  expect(flights.length).toBeGreaterThan(0);
  
  // Create booking
  const booking = await bookingService.createNewBooking({
    flightId: flights[0].flightName,
    passengers: [{ firstName: 'Test', lastName: 'User' }],
    travelDate: '2024-03-15'
  });
  
  // Verify booking
  expect(booking.id).toBeTruthy();
  logger.info(`Booking created: ${booking.id}`);
});
```

### Example 2: API Testing
```typescript
test('complete booking workflow', async ({ bookingService, authService }) => {
  // Authenticate
  const token = await authService.login('user', 'pass');
  
  // Create booking
  const booking = await bookingService.createNewBooking({
    flightId: 'FL123',
    passengers: [{ firstName: 'John', lastName: 'Doe' }],
    travelDate: '2024-03-15'
  });
  
  // Verify status
  const status = await bookingService.getBookingStatus(booking.id);
  expect(status).toBe('confirmed');
  
  // Cancel booking
  await bookingService.cancelBooking(booking.id);
});
```

---

## 📚 Documentation Files

- **FINAL_STATUS.md** - Comprehensive project completion status
- **FRAMEWORK_COMPLETE.md** - Complete framework documentation
- **GUIDE.md** - Detailed framework guide
- **README.md** - Project overview
- **QUICKSTART.md** - Quick start guide
- **SETUP_SUMMARY.md** - Setup instructions

---

## ✅ Ready to Use!

All commands are configured and ready to execute. Framework is **100% complete** and production-ready!

Start testing:
```bash
npm run test:dev
```
