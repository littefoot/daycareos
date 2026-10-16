import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const TARGET_URL = 'https://allchildcaresolutions.com/';
const OUTPUT_DIR = path.resolve('C:/Projects/allchildcaresolutions/brand');
const ASSETS_DIR = path.join(OUTPUT_DIR, 'assets');

fs.mkdirSync(ASSETS_DIR, { recursive: true });

async function run() {
  console.log(`[Playwright Ingestion] Launching headless browser for ${TARGET_URL}...`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  const downloadedAssets = [];

  // Listen to responses for images
  page.on('response', async (response) => {
    try {
      const url = response.url();
      const contentType = response.headers()['content-type'] || '';
      if (
        (contentType.startsWith('image/') || url.match(/\.(png|jpg|jpeg|svg|webp|ico)(\?.*)?$/i)) &&
        url.includes('allchildcaresolutions.com')
      ) {
        const buffer = await response.body().catch(() => null);
        if (buffer && buffer.length > 500) {
          const parsedUrl = new URL(url);
          const filename = path.basename(parsedUrl.pathname) || `asset_${Date.now()}.png`;
          const savePath = path.join(ASSETS_DIR, filename);
          fs.writeFileSync(savePath, buffer);
          downloadedAssets.push({ filename, url, size: buffer.length });
          console.log(`  [SAVED] ${filename} (${buffer.length} bytes)`);
        }
      }
    } catch (err) {
      // Ignore stream read errors
    }
  });

  console.log(`Navigating to ${TARGET_URL}...`);
  await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Extract page DOM styles, tokens, colors, typography
  const brandData = await page.evaluate(() => {
    const getStyle = (el) => window.getComputedStyle(el);
    const bodyStyle = getStyle(document.body);

    // Find all logo candidates
    const logoImgs = Array.from(document.querySelectorAll('img[src*="logo" i], img[alt*="logo" i], header img, nav img, .logo img'));
    const logoSources = logoImgs.map(img => img.src);

    // Colors
    const primaryNav = document.querySelector('header, nav, .elementor-element-2b3641d5');
    const headerBg = primaryNav ? getStyle(primaryNav).backgroundColor : '';

    const heroHeading = document.querySelector('h1, .elementor-heading-title');
    const heroTitle = heroHeading ? heroHeading.innerText.trim() : '';

    const ctaButton = document.querySelector('a.elementor-button, button, a[href*="contact"], a[href*="register"]');
    let buttonBg = '';
    let buttonColor = '';
    let buttonRadius = '';
    if (ctaButton) {
      const bs = getStyle(ctaButton);
      buttonBg = bs.backgroundColor;
      buttonColor = bs.color;
      buttonRadius = bs.borderRadius;
    }

    return {
      title: document.title,
      logoSources,
      headerBg,
      heroTitle,
      buttonBg,
      buttonColor,
      buttonRadius,
      fontFamily: bodyStyle.fontFamily
    };
  });

  console.log('\n--- Brand Ingestion Complete ---');
  console.log('Brand Data:', brandData);
  console.log(`Total Assets Captured: ${downloadedAssets.length}`);

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'brand_metadata.json'),
    JSON.stringify({ brandData, downloadedAssets }, null, 2)
  );

  await browser.close();
}

run().catch(console.error);
