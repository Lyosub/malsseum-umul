import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390 });
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?notype&zone=egypt&body=boy');
await page.waitForFunction('window.__ready === true', { timeout: 150000 }); const w = ms => new Promise(r => setTimeout(r, ms));
await page.evaluate(() => document.querySelectorAll('body > div').forEach(d => { if (d.id !== 'canvas-wrap') d.style.display = 'none'; }));
// 낙타 하나를 계속 걷게: 목표를 멀리 줌
await page.evaluate(() => { const c = window.__debug.herd.find(a => a.name === 'camel'); c.ta = c.ang + 2.5; c.tr = 7.5; c.wait = 0; window.__cam = c; });
const shots = [];
for (let i = 0; i < 6; i++){
  await page.evaluate(() => { const c = window.__cam, D = window.__debug, p = c.o.position; D.player.position.set(p.x + Math.cos(c.ang) * 3.2, 0, p.z + Math.sin(c.ang) * 3.2); D.setCam(Math.atan2(Math.cos(c.ang), Math.sin(c.ang)) + 1.2, 0.12); D.setZoom(0.5); });
  await w(140); await page.screenshot({ path: `E:/temp/claude-work/tmpglb/gait-${i}.png` });
}
await browser.close();
