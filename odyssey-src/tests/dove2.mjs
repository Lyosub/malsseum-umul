import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390 });
page.on('dialog', d => d.accept());
const w = ms => new Promise(r => setTimeout(r, ms));
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&shopmock&body=girl'); await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await w(1500);
await page.evaluate(() => document.getElementById('btn-shop').click()); await w(600);
await page.evaluate(() => document.querySelector('#shop-tabs button[data-c="pet"]').click()); await w(300);
await page.evaluate(() => document.querySelector('[data-buy="pet-dove"]').click()); await w(2500);
await page.evaluate(() => document.querySelector('#shop-modal .close').click()); await w(1500);
for (const t of [0, 1]){
  await page.evaluate(() => { const D = window.__debug, p = D.petPos3; D.startCine('test' + Math.random(), p[0], p[1] - 2, p[2], { r: 2.2, h: 1.9, dur: 4, spin: 0.3 }); }); await w(1500 + t * 120);
  await page.screenshot({ path: `E:/temp/claude-work/tmpglb/dove-close${t}.png` });
}
await browser.close();
