import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
page.on('dialog', d => d.accept());
const errors = []; page.on('pageerror', e => errors.push(e.message));
const w = ms => new Promise(r => setTimeout(r, ms)); const dir = 'E:/temp/claude-work/tmpglb/';
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&shopmock&body=girl'); await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await w(1500);
await page.evaluate(() => document.getElementById('tut-skip') && document.getElementById('tut-skip').click());
for (const pet of ['pet-dove', 'pet-puppy']){
  await page.evaluate(() => document.getElementById('btn-shop').click()); await w(600);
  await page.evaluate(() => document.querySelector('#shop-tabs button[data-c="pet"]').click()); await w(300);
  await page.evaluate(p => { const b = document.querySelector(`[data-buy="${p}"]`) || document.querySelector(`[data-eq="${p}"]`); b && b.click(); }, pet); await w(2500);
  await page.evaluate(() => document.querySelector('#shop-modal .close').click()); await w(300);
  await page.keyboard.down('w'); await w(1200); await page.keyboard.up('w'); await w(200);
  const a1 = await page.evaluate(() => window.__debug.petWings); await w(90); const a2 = await page.evaluate(() => window.__debug.petWings);
  console.log(pet, '| 날개 각도 두 번:', a1, a2);
  await page.evaluate(() => { const D = window.__debug; D.setZoom(0.9); D.setCam(D.camYaw + 0.9, 0.3); }); await w(900);
  await page.screenshot({ path: dir + pet + '.png' });
}
console.log('errors', errors.length ? errors.join('\n') : 'none'); await browser.close();
