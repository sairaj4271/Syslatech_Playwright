# 🚀 Quick Start Commands

## Installation
```powershell
cd "C:\Makemytrip_playWrightAutomation\makeMyTrip-playwright-tests"
npm install
npx playwright install
```

## Run Tests

### All Tests (All Browsers)
```powershell
npm test
```

### Single Browser
```powershell
npm run test:chrome      # Chromium only
npm run test:firefox     # Firefox only
npm run test:webkit      # Safari only
```

### Display Modes
```powershell
npm run test:headed      # Watch browser while running
npm run test:debug       # Interactive debug mode
npm run test:parallel    # 4 workers in parallel
```

### Specific Test
```powershell
npx playwright test -g "Search One Way Flight"
npx playwright test src/tests/home.spec.ts
```

## Reports & Debugging

### View HTML Report
```powershell
npm run test:report
```

### Record New Test
```powershell
npx playwright codegen https://www.makemytrip.com
```

### Show Trace (from failed tests)
```powershell
npx playwright show-trace trace.zip
```

---

## 📊 Framework Stats

| Metric | Count |
|--------|-------|
| **Total Tests** | 75 (25 per browser) |
| **Test Files** | 3 |
| **Page Objects** | 4 |
| **Utility Functions** | 30+ |
| **Browsers** | 3 (Chrome, Firefox, Safari) |
| **Parallel Workers** | 4 |

## 📁 Important Directories

| Directory | Purpose |
|-----------|---------|
| `src/pages/` | Page Object Models |
| `src/tests/` | Test specifications |
| `src/utils/` | Utilities & helpers |
| `playwright-report/` | HTML test reports |
| `test-results/` | JUnit & JSON reports |
| `logs/` | Test execution logs |
| `screenshots/` | Failed test screenshots |

## 📚 Documentation

- `README.md` - Quick start guide
- `GUIDE.md` - Comprehensive advanced guide
- `SETUP_SUMMARY.md` - Complete feature inventory

---

**Framework:** Advanced Playwright + POM + TypeScript  
**Status:** ✅ Ready to Use  
**Version:** 2.0.0
