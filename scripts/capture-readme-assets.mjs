import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.argv[2] || 'http://localhost:4173';
const outDir = path.resolve('docs', 'screenshots');
const framesDir = path.join(outDir, 'frames');
const screenshotLogin = process.env.SCREENSHOT_LOGIN || '';
const screenshotPassword = process.env.SCREENSHOT_PASSWORD || '';

if (!screenshotLogin || !screenshotPassword) {
  throw new Error(
    'Defina SCREENSHOT_LOGIN e SCREENSHOT_PASSWORD antes de executar o script de captura.'
  );
}

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(framesDir, { recursive: true });

async function waitForPageTitle(page, title) {
  await page.waitForSelector(`h1:has-text("${title}")`, { timeout: 15000 });
  await page.waitForTimeout(600);
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

await page.goto(baseUrl, { waitUntil: 'networkidle' });

await page.fill('input[type="text"]', screenshotLogin);
await page.fill('input[type="password"]', screenshotPassword);
await page.click('button:has-text("Entrar")');

await waitForPageTitle(page, 'Dashboard');
await page.screenshot({ path: path.join(outDir, 'dashboard-real.png'), fullPage: true });
await page.screenshot({ path: path.join(framesDir, 'frame-01.png'), fullPage: true });

await page.click('button:has-text("Clientes")');
await waitForPageTitle(page, 'Clientes');
await page.screenshot({ path: path.join(outDir, 'clientes-real.png'), fullPage: true });
await page.screenshot({ path: path.join(framesDir, 'frame-02.png'), fullPage: true });

await page.click('button:has-text("Calendário")');
await waitForPageTitle(page, 'Calendário Jurídico');
await page.screenshot({ path: path.join(outDir, 'calendario-real.png'), fullPage: true });
await page.screenshot({ path: path.join(framesDir, 'frame-03.png'), fullPage: true });

await page.click('button:has-text("Dashboard")');
await waitForPageTitle(page, 'Dashboard');
await page.screenshot({ path: path.join(framesDir, 'frame-04.png'), fullPage: true });

await browser.close();
console.log('Screenshots reais gerados em docs/screenshots');
