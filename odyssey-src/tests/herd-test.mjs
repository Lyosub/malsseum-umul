import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390 });
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?notype&zone=egypt&body=boy');
await page.waitForFunction('window.__ready === true', { timeout: 150000 }); const w = ms => new Promise(r => setTimeout(r, ms));
await page.evaluate(() => { const D = window.__debug; D.player.position.set(-6, 0, 24); D.setCam(-0.9, 0.35); D.setZoom(1.0); }); await w(1500);
let minCamel = 99, maxLamb = 0;
for (let i = 0; i < 40; i++){
  const r = await page.evaluate(() => window.__debug.herd.map(a => [a.name, Math.hypot(a.o.position.x + 12, a.o.position.z - 19)]));
  for (const [n, d] of r){ if (n === 'camel') minCamel = Math.min(minCamel, d); else maxLamb = Math.max(maxLamb, d); }
  if (i === 10 || i === 11) await page.screenshot({ path: `E:/temp/claude-work/tmpglb/herd-${i}.png` });
  await w(500);
}
console.log('낙타 최소 거리', minCamel.toFixed(2), '(담 ~3.6~4.3 바깥이어야) | 양 최대 거리', maxLamb.toFixed(2), '(담 안쪽 ~2.8 이하)');
console.log('errors', errors.length ? errors.join('\n') : 'none');
await browser.close();
