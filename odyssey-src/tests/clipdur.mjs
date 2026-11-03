import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const page = await browser.newPage();
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?notype');
await page.waitForFunction('window.__ready === true', { timeout: 90000 });
console.log(await page.evaluate(() => Object.entries(window.__debug.actions()).map(([k, a]) => k + ':' + a.getClip().duration.toFixed(2)).join(' ')));
await browser.close();
