import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390 });
const errors = []; page.on('pageerror', e => errors.push(e.message));
const w = ms => new Promise(r => setTimeout(r, ms));
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&ch=8&body=boy'); await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await w(1500);
console.log('시작 마을', await page.evaluate(() => window.__debug.zone), '😊 보임', await page.$eval('#btn-emo', e => getComputedStyle(e).display), '🐾 보임', await page.$eval('#btn-pet', e => getComputedStyle(e).display));
if (await page.evaluate(() => window.__debug.zone !== 'sinai')){ await page.evaluate(() => window.__debug.travelTo({ id: 'x', to: 'sinai', spawn: [-34, 6] })); await page.waitForFunction('window.__debug.zone === "sinai"', { timeout: 120000 }); await w(2000); }
await page.evaluate(() => { const D = window.__debug; D.ST.step = D.STORY.findIndex(q => q.id === 'c8s6'); D.spawnTasks ? 0 : 0; });
await page.evaluate(() => { const D = window.__debug; D.advance(); }); await w(300);
await page.evaluate(() => { const D = window.__debug; D.ST.step = D.STORY.findIndex(q => q.id === 'c8s5'); }); 
await page.evaluate(() => { const D = window.__debug; D.player.position.set(0, 0, -6); D.setCam(0, 0.02); D.setZoom(2.2); }); await w(500);
await page.evaluate(() => { window.__debug.travelTo({ id: 'x', to: 'sinai', spawn: [0, -6] }); }); await page.waitForFunction('window.__debug.zone === "sinai"', { timeout: 120000 }); await w(4000);
await page.evaluate(() => { const D = window.__debug; D.player.position.set(0, 0, -8); D.setCam(0, 0.1); D.setZoom(2.6); }); await w(2500);
await page.screenshot({ path: 'E:/temp/claude-work/tmpglb/c8-storm2.png' });
console.log('errors', errors.length ? errors.join(' / ') : 'none'); await browser.close();
