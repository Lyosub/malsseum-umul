import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 480, height: 820 });
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&ch=2');
await page.waitForFunction('window.__ready === true', { timeout: 150000 });
await page.evaluate(() => { const d = window.__debug; while (d.curStep() && d.curStep().id !== 'c2s5') d.advance(); });
const w = ms => new Promise(r => setTimeout(r, ms));
for (const [x, z, label] of [[20, 0, '마을'], [60, -40, '알현실 안']]){
  await page.evaluate((x, z) => window.__debug.player.position.set(x, 0, z), x, z); await w(800);
  console.log(label, '| 단계', await page.evaluate(() => window.__debug.curStep().id + ' ' + window.__debug.curStep().where), '| 나침반이 가리키는 문:', await page.evaluate(() => window.__debug.doorTarget));
}
console.log('바로 위치', await page.evaluate(() => { const m = window.__debug.markers.find(k => k.data.id === 'pharaoh'); return m.mesh.position.x.toFixed(1) + ',' + m.mesh.position.z.toFixed(1); }));
await browser.close();
