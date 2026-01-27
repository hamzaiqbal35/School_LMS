/**
 * Launch a browser instance suitable for the current environment.
 * @returns {Promise<import('puppeteer').Browser>}
 */
const getBrowser = async () => {
    let browser;

    if (process.env.NODE_ENV === 'production') {
        const puppeteerCore = require('puppeteer-core');
        const chromium = require('@sparticuz/chromium');

        // Production: Use @sparticuz/chromium with puppeteer-core
        // This is optimized for serverless/container environments
        try {
            console.log('Launching Production Browser (@sparticuz/chromium)...');
            browser = await puppeteerCore.launch({
                args: chromium.args,
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath(),
                headless: chromium.headless,
                ignoreHTTPSErrors: true,
            });
        } catch (error) {
            console.error('Failed to launch production browser:', error);
            throw error;
        }
    } else {
        const puppeteer = require('puppeteer');

        // Development: Use standard local puppeteer
        try {
            console.log('Launching Local Browser (Puppeteer)...');
            browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        } catch (error) {
            console.error('Failed to launch local browser:', error);
            throw error;
        }
    }

    return browser;
};

module.exports = { getBrowser };
