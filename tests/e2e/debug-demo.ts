/**
 * Simple debug script to see what's available on the demo page
 */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import puppeteer from 'puppeteer';

async function debugDemo() {
    console.log('🚀 Starting browser for debugging...');

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1200, height: 800 },
    });

    const page = await browser.newPage();

    // Navigate to demo
    console.log('🌐 Navigating to demo...');
    await page.goto('http://localhost:8000/demo/AieraChatInternal.html', { waitUntil: 'networkidle0' });

    // Take initial screenshot
    await page.screenshot({ path: 'tests/e2e/screenshots/demo-initial.png', fullPage: true });
    console.log('📸 Took initial screenshot');

    // Check for username input
    const usernameInput = await page.$('#usernameInput');
    if (usernameInput) {
        console.log('📝 Found username input, filling it...');
        await page.type('#usernameInput', 'test-user');
        await page.keyboard.press('Enter');
        await new Promise((resolve) => setTimeout(resolve, 5000));

        // Take screenshot after username
        await page.screenshot({ path: 'tests/e2e/screenshots/demo-after-username.png', fullPage: true });
        console.log('📸 Took screenshot after username');
    }

    // Look for iframe
    const iframe = await page.$('#aiera');
    if (iframe) {
        console.log('🎯 Found iframe');
        const frame = await iframe.contentFrame();
        if (frame) {
            console.log('✅ Can access iframe content');

            // Take screenshot of iframe content
            const iframeElement = await frame.$('body');
            if (iframeElement) {
                await iframeElement.screenshot({ path: 'tests/e2e/screenshots/iframe-content.png' });
                console.log('📸 Took iframe screenshot');
            }

            // List all input elements in iframe
            const inputs = await frame.$$eval('input, textarea, [contenteditable]', (elements) =>
                elements.map((el: Element) => {
                    const input = el as HTMLInputElement;
                    return {
                        tagName: el.tagName,
                        type: input.type || 'N/A',
                        placeholder: input.placeholder || 'N/A',
                        contentEditable: (el as any).contentEditable || 'N/A',
                        className: el.className || 'N/A',
                    };
                })
            );
            console.log('📝 Found input elements in iframe:', inputs);
        }
    } else {
        console.log('❌ No iframe found');
    }

    // List all input elements on main page
    const mainInputs = await page.$$eval('input, textarea, [contenteditable]', (elements) =>
        elements.map((el: Element) => {
            const input = el as HTMLInputElement;
            return {
                tagName: el.tagName,
                type: input.type || 'N/A',
                placeholder: input.placeholder || 'N/A',
                contentEditable: (el as any).contentEditable || 'N/A',
                className: el.className || 'N/A',
                id: input.id || 'N/A',
            };
        })
    );
    console.log('📝 Found input elements on main page:', mainInputs);

    console.log('🔍 Keeping browser open for manual inspection. Close browser to continue...');

    // Keep browser open for manual inspection
    // await new Promise(resolve => setTimeout(resolve, 60000));

    // Don't close automatically - let user inspect
    // await browser.close();
}

debugDemo().catch(console.error);
