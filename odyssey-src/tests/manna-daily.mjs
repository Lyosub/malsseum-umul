import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390 });
const errors = []; page.on('pageerror', e => errors.push(e.message));
const w = ms => new Promise(r => setTimeout(r, ms));
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&ch=5&body=boy'); await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await w(1000);
await page.evaluate(() => { const D = window.__debug; D.ST.step = D.STORY.length; D.ST.cleared = true; D.ST.manna = 3; D.ST.mannaDay = '2026-09-20'; });
await page.evaluate(() => { const D = window.__debug; D.travelTo({ id: 'x', to: 'wild', spawn: [-35, 2] }); });
await page.waitForFunction('window.__debug.zone === "wild"', { timeout: 120000 }); await w(2500);
console.log('오늘 들판 만나:', await page.evaluate(() => window.__debug.mannaFlakes.length), '| 상한 만나 뒤 보유:', await page.evaluate(() => window.__debug.ST.manna));
for (let k = 0; k < 3; k++){ await page.evaluate(() => { const D = window.__debug, f = D.mannaFlakes[0]; if (f) D.player.position.set(f.userData.x, 0, f.userData.z); }); await w(500); }
console.log('3개 주운 뒤 보유:', await page.evaluate(() => window.__debug.ST.manna), '| 남은 만나', await page.evaluate(() => window.__debug.mannaFlakes.length), '|', await page.$eval('#quest-toast', e => e.textContent));
console.log('errors', errors.length ? errors.join(' / ') : 'none'); await browser.close();
