# E2E Testing for AieraChatInternal

This directory contains end-to-end testing tools for the AieraChatInternal module using Puppeteer.

## Quick Start

1. **Start the development server:**
   ```bash
   npm start
   ```

2. **Run basic search tests:**
   ```bash
   npm run test:e2e
   ```

3. **Run tests in headless mode:**
   ```bash
   npm run test:e2e:headless
   ```

## Available Test Files

### `chat-search-test.ts`
Main test suite for search functionality including:
- Basic chat interaction
- Search interface testing  
- Search result navigation
- Screenshot capture for verification

### `simple-search-test.ts`
Simplified search test focusing on core functionality:
- Sends test message to create searchable content
- Opens search interface
- Types search terms and verifies results
- Takes screenshots for manual verification

### `debug-demo.ts`
Debug utility for exploring the demo page structure:
- Analyzes available input elements
- Takes screenshots at different stages
- Helps understand the DOM structure for test development

## Usage Examples

```bash
# Run the main test suite
npm run test:e2e

# Run a specific test file
npm run ts tests/e2e/simple-search-test.ts

# Run debug analysis
npm run ts tests/e2e/debug-demo.ts
```

## Screenshots

Test screenshots are automatically saved to `tests/e2e/screenshots/` for visual verification of search functionality.

## Linting

The test files have been cleaned up to pass ESLint validation:
- All errors have been resolved
- Warnings for test-appropriate patterns (like non-null assertions) are acceptable
- Use `npm run lint:tests` to check test file linting status