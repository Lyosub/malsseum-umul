import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const errors = []; page.on('pageerror', e => errors.push(e.message));
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&body=boy'); await page.waitForFunction('window.__ready === true', { timeout: 150000 });
await page.evaluate(() => document.getElementById('btn-rank').click()); await new Promise(r => setTimeout(r, 600));
console.log(await page.$eval('#rank-modal', e => e.innerText.replace(/\s+/g, ' ')));
await page.screenshot({ path: 'E:/temp/claude-work/tmpglb/rank.png' });
console.log('errors', errors.length ? errors.join('\n') : 'none'); await browser.close();
