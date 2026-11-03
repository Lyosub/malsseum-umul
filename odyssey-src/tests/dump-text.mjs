import puppeteer from 'puppeteer-core'; import fs from 'fs';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11'] });
const page = await browser.newPage();
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&body=boy&zone=alpha');
await page.waitForFunction('window.__ready === true', { timeout: 150000 });
fs.writeFileSync('E:/temp/claude-work/audit/text.json', await page.evaluate(() => window.__debug.dumpText()));
await browser.close(); console.log('ok');
