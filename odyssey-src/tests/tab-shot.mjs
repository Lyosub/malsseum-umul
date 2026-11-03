import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const errors = []; page.on('pageerror', e => errors.push(e.message));
const w = ms => new Promise(r => setTimeout(r, ms)); const dir = 'E:/temp/claude-work/tmpglb/';
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&ch=10&body=boy&zone=sinai');
await page.waitForFunction('window.__ready === true', { timeout: 150000 });
await page.waitForFunction('!window.__debug.pendingNPC', { timeout: 90000 });
const E = (f, ...a) => page.evaluate(f, ...a);
await E(() => { const D = window.__debug; D.ST.cleared = true; }); 
await E(() => window.__debug.travelTo({ to: 'sinai', spawn: [16, -4] })); await page.waitForFunction(() => window.__debug.zone === 'sinai' && !window.__debug.pendingNPC, { timeout: 90000 }); await w(3000);
console.log('stage', await E(() => window.__debug.tabStage), 'glory', await E(() => window.__debug.gloryOn), 'ark', await E(() => window.__debug.arkOn));
for (const [n, x, z, yaw, pitch, zoom] of [['tabA', 17, -15, Math.PI / 2, 0.25, 2.8], ['tabB', 4, -3, 0.2, 0.45, 3.2], ['tabC', 17, -9, 2.2, 0.3, 2.6]]){
  await E(([x, z, yaw, pitch, zoom]) => { const D = window.__debug; D.player.position.set(x, 0, z); D.setCam(yaw, pitch); D.setZoom(zoom); }, [x, z, yaw, pitch, zoom]); await w(1800);
  await page.screenshot({ path: dir + n + '.png' }); }
console.log('errors', errors.length ? errors : 'none'); await browser.close();
