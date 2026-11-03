import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
const page = await browser.newPage(); await page.setViewport({ width: 900, height: 500 });
const errs = []; page.on('pageerror', e => errs.push(e.message.slice(0,100)));
await page.goto('http://localhost:8766/odyssey/index.html?reset&notype&notut&body=boy', { waitUntil: 'domcontentloaded' });
await page.waitForFunction('window.__ready === true', { timeout: 100000 }); await new Promise(r => setTimeout(r, 5000));
console.log('zone', await page.evaluate(() => window.__debug.zone), 'errors', errs.length, errs.slice(0,2));
await browser.close();
