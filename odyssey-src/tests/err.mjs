import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390 });
page.on('pageerror', e => console.log('ERR', e.message)); page.on('console', m => { if (m.type() === 'error') console.log('CERR', m.text()); });
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&ch=4&body=boy'); await new Promise(r => setTimeout(r, 15000));
await browser.close();
