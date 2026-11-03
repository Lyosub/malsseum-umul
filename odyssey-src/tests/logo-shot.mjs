import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const page = await browser.newPage(); await page.setViewport({ width: 390, height: 700 });
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html', { waitUntil: 'domcontentloaded' });
await new Promise(r=>setTimeout(r,60));
await page.screenshot({ path: 'E:/temp/claude-work/exodus-game/stage1/loading.png' });
await browser.close();
