const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const workspaceDir = 'C:/Users/fatih/Desktop/Travel Quote Bot/workspace';
const outputDir = 'C:/Users/fatih/Desktop/Travel Quote Bot/workspace/slides-png';
const combinedPath = 'C:/Users/fatih/Desktop/Travel Quote Bot/workspace/TravelQuoteBot-AllSlides.png';

// Grid settings
const cols = 3;
const rows = 4;
const slideWidth = 960;  // 720pt = 960px
const slideHeight = 540; // 405pt = 540px
const padding = 10;
const margin = 20;

async function convertAndCombine() {
    // Create output directory
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const browser = await chromium.launch();
    const context = await browser.newContext({
        viewport: { width: slideWidth, height: slideHeight }
    });

    const slidePaths = [];

    // Convert each slide to PNG
    for (let i = 1; i <= 11; i++) {
        const htmlPath = path.join(workspaceDir, `slide${i}.html`);
        const pngPath = path.join(outputDir, `slide-${String(i).padStart(2, '0')}.png`);

        if (fs.existsSync(htmlPath)) {
            const page = await context.newPage();
            await page.goto(`file://${htmlPath}`);
            await page.screenshot({ path: pngPath });
            await page.close();
            slidePaths.push(pngPath);
            console.log(`Converted: slide ${i}`);
        }
    }

    await browser.close();

    // Calculate combined image size
    const totalWidth = cols * slideWidth + (cols - 1) * padding + 2 * margin;
    const totalHeight = rows * slideHeight + (rows - 1) * padding + 2 * margin;

    // Create composite array for sharp
    const composites = [];
    for (let i = 0; i < slidePaths.length; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;
        const x = margin + col * (slideWidth + padding);
        const y = margin + row * (slideHeight + padding);

        composites.push({
            input: slidePaths[i],
            left: x,
            top: y
        });
    }

    // Create combined image with white background
    await sharp({
        create: {
            width: totalWidth,
            height: totalHeight,
            channels: 3,
            background: { r: 255, g: 255, b: 255 }
        }
    })
    .composite(composites)
    .png()
    .toFile(combinedPath);

    console.log(`\nCombined image saved to: ${combinedPath}`);
    console.log(`Size: ${totalWidth} x ${totalHeight} pixels`);
}

convertAndCombine().catch(console.error);
