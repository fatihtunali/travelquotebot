const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const workspaceDir = 'C:/Users/fatih/Desktop/Travel Quote Bot/workspace';
const outputDir = 'C:/Users/fatih/Desktop/Travel Quote Bot/workspace/slides-png';

async function convertSlidesToPng() {
    // Create output directory
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const browser = await chromium.launch();
    const context = await browser.newContext({
        viewport: { width: 960, height: 540 } // 16:9 ratio
    });

    for (let i = 1; i <= 11; i++) {
        const htmlPath = path.join(workspaceDir, `slide${i}.html`);
        const pngPath = path.join(outputDir, `slide-${String(i).padStart(2, '0')}.png`);

        if (fs.existsSync(htmlPath)) {
            const page = await context.newPage();
            await page.goto(`file://${htmlPath}`);
            await page.screenshot({ path: pngPath, fullPage: true });
            await page.close();
            console.log(`Created: slide-${String(i).padStart(2, '0')}.png`);
        } else {
            console.log(`Skipped: slide${i}.html not found`);
        }
    }

    await browser.close();
    console.log(`\nAll slides saved to: ${outputDir}`);
}

convertSlidesToPng().catch(console.error);
