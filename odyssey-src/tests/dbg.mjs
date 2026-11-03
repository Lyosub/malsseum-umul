import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 520, height: 780 });
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?close');
await page.waitForFunction('window.__ready === true', { timeout: 60000 });
await page.evaluate(()=>window.__debug.player.position.set(-3,0,30)); await new Promise(r=>setTimeout(r,2500)); console.log(await page.evaluate(()=>JSON.stringify({s:location.search,has:document.documentElement.outerHTML.includes('const CLOSE'),c:window.__debug.camera.position})));
await browser.close();
