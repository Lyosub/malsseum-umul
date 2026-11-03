import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
const page = await browser.newPage(); const bad = new Set();
page.on('response', r => { if (r.status() >= 400) bad.add(r.status() + ' ' + r.url()); });
await page.goto('http://localhost:8765/dist/index.html?reset&notype&zone=alpha'); await page.waitForFunction('window.__ready === true', { timeout: 150000 });
await new Promise(r => setTimeout(r, 3000)); console.log([...bad].join('\n')); await browser.close();
