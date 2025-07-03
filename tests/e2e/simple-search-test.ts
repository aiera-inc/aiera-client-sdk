/**
 * Simple focused test for search functionality
 */

import puppeteer from 'puppeteer';

async function testSearchFunctionality() {
    console.log('🚀 Starting search functionality test...');

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1200, height: 800 },
    });

    const page = await browser.newPage();

    try {
        // Navigate to demo
        console.log('🌐 Navigating to demo...');
        await page.goto('http://localhost:8000/demo/AieraChatInternal.html', { waitUntil: 'networkidle0' });

        // Setup username
        const usernameInput = await page.$('#usernameInput');
        if (usernameInput) {
            await page.type('#usernameInput', 'test-user');
            await page.keyboard.press('Enter');
            await new Promise((resolve) => setTimeout(resolve, 3000));
        }

        // Get iframe
        await page.waitForSelector('#aiera', { timeout: 10000 });
        const iframe = await page.$('#aiera');
        const frame = await iframe!.contentFrame();

        // Wait for chat to be ready
        await frame!.waitForSelector('p[contenteditable="true"].chatPrompt', { timeout: 10000 });
        console.log('✅ Chat is ready');

        // Send a simple message to create content
        console.log('📝 Sending test message...');
        await frame!.click('p[contenteditable="true"].chatPrompt');
        await page.keyboard.down('Control');
        await page.keyboard.press('a');
        await page.keyboard.up('Control');
        await page.keyboard.press('Delete');
        await frame!.type(
            'p[contenteditable="true"].chatPrompt',
            'Hello, I want to know about ASTS performance in the financial markets'
        );
        await page.keyboard.press('Enter');

        // Wait a bit for the message to appear
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Take screenshot before search
        await page.screenshot({ path: 'tests/e2e/screenshots/before-search.png', fullPage: true });

        // Now test the search functionality
        console.log('🔍 Testing search functionality...');

        // Look for search button (might be an icon)
        const searchButton = await frame!.$(
            'button[name="search"], .search-button, svg[class*="search"], [data-testid*="search"]'
        );
        if (searchButton) {
            console.log('🎯 Found search button, clicking...');
            await searchButton.click();
        } else {
            // Try looking for search icon by other means
            console.log('🔍 Looking for search interface...');
            const possibleSearchElements = await frame!.$$('button, .icon, svg');
            console.log(`Found ${possibleSearchElements.length} possible search elements`);

            // Try clicking elements that might be search
            for (const element of possibleSearchElements.slice(0, 5)) {
                try {
                    const text = await element.evaluate((el) => el.textContent || el.outerHTML);
                    if (text.toLowerCase().includes('search') || text.includes('MicroSearch')) {
                        console.log('🎯 Found potential search element, clicking...');
                        await element.click();
                        break;
                    }
                } catch (_e) {
                    // Continue if element is not accessible
                }
            }
        }

        // Wait for search interface to appear
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Look for search input
        const searchInput = await frame!.$('input[placeholder*="search" i], input[placeholder*="Search" i]');
        if (searchInput) {
            console.log('✅ Found search input');

            // Type search term "perform" (from the user's example)
            await searchInput.type('perform');

            // Wait for search results
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Take screenshot with search results
            await page.screenshot({ path: 'tests/e2e/screenshots/search-results.png', fullPage: true });

            // Look for search navigation buttons
            const nextButton = await frame!.$('button:has(.chevron), .chevron, [data-testid*="next"]');
            if (nextButton) {
                console.log('🎯 Found navigation button, testing navigation...');
                await nextButton.click();

                await new Promise((resolve) => setTimeout(resolve, 1000));

                // Take screenshot after navigation
                await page.screenshot({ path: 'tests/e2e/screenshots/search-navigation.png', fullPage: true });

                console.log('✅ Search navigation test completed');
            } else {
                console.log('⚠️ No navigation button found');
            }

            console.log('✅ Search functionality test completed successfully');
        } else {
            console.log('❌ Search input not found');
            await page.screenshot({ path: 'tests/e2e/screenshots/search-not-found.png', fullPage: true });
        }
    } catch (error) {
        console.error('❌ Test failed:', error);
        await page.screenshot({ path: 'tests/e2e/screenshots/error-state.png', fullPage: true });
    }

    console.log('🔍 Test completed. Screenshots saved. You can now manually verify the search functionality.');
    console.log('Keep browser open for inspection...');

    // Keep browser open for manual inspection
    await new Promise((_resolve) => {
        console.log('Press Ctrl+C to close browser and exit');
        process.on('SIGINT', () => {
            void browser.close().then(() => {
                process.exit(0);
            });
        });
    });
}

testSearchFunctionality().catch(console.error);
