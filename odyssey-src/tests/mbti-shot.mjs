import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
const p = await b.newPage(); await p.setViewport({ width: 390, height: 1400, isMobile: true });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('file:///E:/서브 브레인/Projects/mbti-gift-finder/guides/first-home-alone-gift.html'); await new Promise(r => setTimeout(r, 1200));
console.log(await p.evaluate(() => [document.title, document.querySelectorAll('.related-cards a').length, document.documentElement.scrollWidth]));
await p.screenshot({ path: 'E:/temp/claude-work/tmpglb/mbti-guide.png' }); console.log('errors', errs); await b.close();
