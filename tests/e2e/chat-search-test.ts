/**
 * Standalone test script for AieraChatInternal search functionality
 * This can be run independently without MCP server
 */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import puppeteer, { Browser, Page, ElementHandle } from 'puppeteer';
import { join } from 'path';

interface TestResult {
    name: string;
    passed: boolean;
    error?: string;
    details?: unknown;
}

class ChatSearchTester {
    private browser: Browser | null = null;
    private page: Page | null = null;
    private baseUrl = 'http://localhost:8000';

    constructor(baseUrl?: string) {
        if (baseUrl) {
            this.baseUrl = baseUrl;
        }
    }

    async setup(options: { headless?: boolean } = {}) {
        console.log('🚀 Starting browser...');

        this.browser = await puppeteer.launch({
            headless: options.headless ?? false,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            defaultViewport: { width: 1200, height: 800 },
        });

        this.page = await this.browser.newPage();

        // Set up console logging
        this.page.on('console', (msg) => {
            console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
        });

        console.log('✅ Browser setup complete');
    }

    async navigateToDemo() {
        if (!this.page) throw new Error('Browser not initialized');

        const url = `${this.baseUrl}/demo/AieraChatInternal.html`;
        console.log(`🌐 Navigating to ${url}`);

        await this.page.goto(url, { waitUntil: 'networkidle2' });

        // Wait for iframe to load
        await this.page.waitForSelector('#aiera', { timeout: 30000 });

        // Wait for the iframe content to be ready
        await this.page.waitForFunction(
            () => {
                const iframe = document.querySelector('#aiera') as HTMLIFrameElement;
                return iframe && iframe.contentDocument && iframe.contentDocument.readyState === 'complete';
            },
            { timeout: 30000 }
        );

        console.log('✅ Demo page loaded');
    }

    async waitForChatReady() {
        if (!this.page) throw new Error('Browser not initialized');

        console.log('⏳ Waiting for chat to be ready...');

        // First check if there's a username input that needs to be filled
        const usernameInput = await this.page.$('#usernameInput');
        if (usernameInput) {
            console.log('📝 Setting up demo username...');
            await this.page.type('#usernameInput', 'test-user');
            await this.page.keyboard.press('Enter');
            await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait for chat to initialize
        }

        // Wait for iframe to appear
        await this.page.waitForSelector('#aiera', { timeout: 20000 });

        const iframe = await this.page.$('#aiera');
        if (!iframe) throw new Error('Chat iframe not found');

        const frame = await iframe.contentFrame();
        if (!frame) throw new Error('Could not access iframe content');

        // Wait for the message input to be available
        await frame.waitForSelector('p[contenteditable="true"].chatPrompt', { timeout: 10000 });

        console.log('✅ Chat is ready');
    }

    async sendMessage(message: string, waitForResponse = true): Promise<string> {
        if (!this.page) throw new Error('Browser not initialized');

        console.log(`📝 Sending message: "${message}"`);

        const iframe = await this.page.$('#aiera');
        const frame = await iframe!.contentFrame();

        // Find and use the input field
        const inputSelector = 'p[contenteditable="true"].chatPrompt';
        await frame!.waitForSelector(inputSelector, { timeout: 5000 });

        // Clear any existing text and type the message
        await frame!.click(inputSelector);

        // For contenteditable elements, select all and delete
        await this.page.keyboard.down('Control');
        await this.page.keyboard.press('a');
        await this.page.keyboard.up('Control');
        await this.page.keyboard.press('Delete');

        // Type the message
        await frame!.type(inputSelector, message);

        // Submit the message
        await this.page.keyboard.press('Enter');

        let responseText = '';
        if (waitForResponse) {
            console.log('⏳ Waiting for response...');

            // Wait for response to appear
            await frame!.waitForFunction(
                () => {
                    const messages = document.querySelectorAll(
                        '[data-testid="message-response"], .message-response, .response'
                    );
                    return messages.length > 0;
                },
                { timeout: 30000 }
            );

            // Get the response text
            responseText = await frame!.evaluate(() => {
                const messages = document.querySelectorAll(
                    '[data-testid="message-response"], .message-response, .response'
                );
                const lastMessage = messages[messages.length - 1];
                return lastMessage ? lastMessage.textContent || '' : '';
            });

            console.log(`✅ Response received: "${responseText.slice(0, 100)}..."`);
        }

        return responseText;
    }

    async openSearch(): Promise<boolean> {
        if (!this.page) throw new Error('Browser not initialized');

        console.log('🔍 Opening search interface...');

        const iframe = await this.page.$('#aiera');
        const frame = await iframe!.contentFrame();

        // Look for search button - try multiple selectors
        const searchSelectors = [
            'button[aria-label*="Search"]',
            '[data-testid="search-button"]',
            'button:has(svg[data-testid="MicroSearch"])',
            'button:has(.MicroSearch)',
            'svg[data-testid="MicroSearch"]',
            '.search-button',
            'button[title*="Search"]',
        ];

        let searchButton: ElementHandle<Element> | null = null;
        let foundSelector: string | null = null;
        for (const selector of searchSelectors) {
            try {
                await frame!.waitForSelector(selector, { timeout: 2000 });
                searchButton = await frame!.$(selector);
                if (searchButton) {
                    console.log(`Found search button with selector: ${selector}`);
                    foundSelector = selector;
                    break;
                }
            } catch (e) {
                // Continue trying other selectors
            }
        }

        if (!searchButton || !foundSelector) {
            throw new Error('Search button not found');
        }

        await frame!.click(foundSelector);

        // Wait for search input to appear
        await frame!.waitForSelector('input[placeholder*="Search"]', { timeout: 5000 });

        console.log('✅ Search interface opened');
        return true;
    }

    async performSearch(searchTerm: string): Promise<{ currentMatch: number; totalMatches: number }> {
        if (!this.page) throw new Error('Browser not initialized');

        console.log(`🔍 Searching for: "${searchTerm}"`);

        const iframe = await this.page.$('#aiera');
        const frame = await iframe!.contentFrame();

        // Clear existing search and type new term
        const searchInput = await frame!.waitForSelector('input[placeholder*="Search"]', { timeout: 5000 });
        await searchInput!.click();
        await this.page.keyboard.down('Control');
        await this.page.keyboard.press('a');
        await this.page.keyboard.up('Control');
        await frame!.type('input[placeholder*="Search"]', searchTerm);

        // Wait for search results to be processed
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Get search results count
        const resultsText = await frame!.evaluate(() => {
            const resultsElement = document.querySelector('.font-mono, .search-results, .results-count');
            return resultsElement ? resultsElement.textContent || '' : '';
        });

        console.log(`Search results display: "${resultsText}"`);

        const matches = resultsText.match(/(\d+)\s*\/\s*(\d+)/);
        const currentMatch = matches ? parseInt(matches[1] || '0') : 0;
        const totalMatches = matches ? parseInt(matches[2] || '0') : 0;

        console.log(`✅ Found ${totalMatches} matches, currently at match ${currentMatch}`);

        return { currentMatch, totalMatches };
    }

    async navigateSearchResults(
        direction: 'next' | 'previous'
    ): Promise<{ currentMatch: number; totalMatches: number }> {
        if (!this.page) throw new Error('Browser not initialized');

        console.log(`🔍 Navigating ${direction} in search results`);

        const iframe = await this.page.$('#aiera');
        const frame = await iframe!.contentFrame();

        // Find navigation buttons
        const nextButtonSelector = 'div:has(svg.w-2):not(:has(svg.rotate-180)), .search-next';
        const prevButtonSelector = 'div:has(svg.w-2.rotate-180), .search-prev';

        const buttonSelector = direction === 'next' ? nextButtonSelector : prevButtonSelector;

        try {
            await frame!.click(buttonSelector);
            await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (_e) {
            console.warn(`Could not find ${direction} button, trying alternative selectors`);

            // Try alternative approach - find chevron buttons
            const chevrons = await frame!.$$('svg.w-2');
            if (chevrons.length >= 2) {
                const targetChevron = direction === 'next' ? chevrons[0] : chevrons[1];
                if (targetChevron) {
                    await targetChevron.click();
                }
                await new Promise((resolve) => setTimeout(resolve, 500));
            }
        }

        // Get updated results
        const resultsText = await frame!.evaluate(() => {
            const resultsElement = document.querySelector('.font-mono, .search-results, .results-count');
            return resultsElement ? resultsElement.textContent || '' : '';
        });

        const matches = resultsText.match(/(\d+)\s*\/\s*(\d+)/);
        const currentMatch = matches ? parseInt(matches[1] || '0') : 0;
        const totalMatches = matches ? parseInt(matches[2] || '0') : 0;

        console.log(`✅ Navigated ${direction}: ${currentMatch}/${totalMatches}`);

        return { currentMatch, totalMatches };
    }

    async takeScreenshot(filename = `test-${Date.now()}.png`) {
        if (!this.page) throw new Error('Browser not initialized');

        const filepath = join(process.cwd(), 'tests', 'e2e', 'screenshots', filename) as `${string}.png`;
        await this.page.screenshot({ path: filepath, fullPage: true });

        console.log(`📸 Screenshot saved: ${filepath}`);
        return filepath;
    }

    async runBasicSearchTest(): Promise<TestResult[]> {
        const results: TestResult[] = [];

        try {
            // Test messages to send first
            const testMessages = [
                'Hello, can you help me understand financial markets?',
                'What are the key metrics for evaluating a company?',
                'How do earnings reports impact stock prices?',
            ];

            // Send test messages
            for (const message of testMessages) {
                await this.sendMessage(message, true);
                await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait between messages
            }

            // Test opening search
            try {
                await this.openSearch();
                results.push({ name: 'Open Search Interface', passed: true });
            } catch (error) {
                results.push({ name: 'Open Search Interface', passed: false, error: (error as Error).message });
                return results; // Can't continue without search
            }

            // Test search functionality
            const searchTerms = ['financial', 'company', 'earnings', 'help'];

            for (const term of searchTerms) {
                try {
                    const searchResult = await this.performSearch(term);
                    const passed = searchResult.totalMatches > 0;

                    results.push({
                        name: `Search for "${term}"`,
                        passed,
                        details: searchResult,
                    });

                    // Test navigation if there are multiple matches
                    if (searchResult.totalMatches > 1) {
                        try {
                            await this.navigateSearchResults('next');
                            await this.navigateSearchResults('previous');
                            results.push({ name: `Navigate search results for "${term}"`, passed: true });
                        } catch (error) {
                            results.push({
                                name: `Navigate search results for "${term}"`,
                                passed: false,
                                error: (error as Error).message,
                            });
                        }
                    }
                } catch (error) {
                    results.push({ name: `Search for "${term}"`, passed: false, error: (error as Error).message });
                }
            }
        } catch (error) {
            results.push({ name: 'Basic Search Test Setup', passed: false, error: (error as Error).message });
        }

        return results;
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
            console.log('🧹 Browser closed');
        }
    }
}

// Main execution function
async function runTests() {
    const tester = new ChatSearchTester();

    try {
        await tester.setup({ headless: false });
        await tester.navigateToDemo();
        await tester.waitForChatReady();

        console.log('\n🧪 Running basic search tests...\n');

        const results = await tester.runBasicSearchTest();

        // Take final screenshot
        await tester.takeScreenshot('final-test-state.png');

        // Print results
        console.log('\n📊 Test Results:');
        console.log('================');

        let passedCount = 0;
        const totalCount = results.length;

        for (const result of results) {
            const status = result.passed ? '✅ PASS' : '❌ FAIL';
            console.log(`${status} - ${result.name}`);

            if (result.details) {
                console.log(`    Details: ${JSON.stringify(result.details)}`);
            }

            if (result.error) {
                console.log(`    Error: ${result.error}`);
            }

            if (result.passed) passedCount++;
        }

        console.log(`\n📈 Summary: ${passedCount}/${totalCount} tests passed`);
    } catch (error) {
        console.error('❌ Test execution failed:', error);
    } finally {
        await tester.cleanup();
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    runTests().catch(console.error);
}

export { ChatSearchTester, TestResult };
