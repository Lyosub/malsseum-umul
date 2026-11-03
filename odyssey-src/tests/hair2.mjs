import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390 });
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?notut&body=boy&hair=boy-default');
await page.waitForFunction('window.__ready === true', { timeout: 150000 }); const w = ms => new Promise(r => setTimeout(r, ms));
await page.evaluate(() => document.querySelectorAll('body > div').forEach(d => { if (d.id !== 'canvas-wrap') d.style.display = 'none'; }));
const shots = [];
for (const [i, yaw, pitch] of [[0, 0.3, 0.75], [1, 1.2, 0.2], [2, 2.6, 0.15], [3, Math.PI, 0.1]]){
  await page.evaluate((yaw, pitch) => { const D = window.__debug; D.player.position.set(0, 0, 20); D.setHeading(0); D.setCam(yaw, pitch); D.setZoom(0.6); }, yaw, pitch);
  await w(1300); await page.screenshot({ path: `E:/temp/claude-work/tmpglb/h2-${i}.png`, clip: { x: 300, y: 40, width: 244, height: 200 } });
}
console.log(await page.evaluate(() => window.__debug.hair), JSON.stringify(await page.evaluate(() => window.__debug.headBox)));
await browser.close();
