const { execSync } = require('child_process');
const path = require('path');

console.log('Starting Render Build Script...');

try {
    // 1. Install NPM Dependencies
    console.log('Running npm install...');
    execSync('npm install', { stdio: 'inherit' });

    // 2. Install Chrome for Puppeteer
    console.log('Installing Chrome for Puppeteer...');
    // We explicitly install 'chrome' to ensure the cache is populated
    execSync('npx puppeteer browsers install chrome', { stdio: 'inherit' });

    console.log('Build script completed successfully.');
} catch (error) {
    console.error('Build script failed:', error);
    process.exit(1);
}
