import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 520, height: 520 });
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
const w = ms => new Promise(r => setTimeout(r, ms)); const out = [];
for (const [body, hair] of [['boy', 'boy-default'], ['girl', 'girl-long']]){
  await page.goto(`file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notut&body=${body}&hair=${hair}`);
  await page.waitForFunction('window.__ready === true', { timeout: 150000 });
  await page.evaluate(() => document.querySelectorAll('body > div').forEach(d => { if (d.id !== 'canvas-wrap') d.style.display = 'none'; }));
  for (const [i, yaw] of [[0, 0], [1, Math.PI / 2], [2, Math.PI]]){
    await page.evaluate(yaw => { const D = window.__debug; D.player.position.set(0, 0, 20); D.setHeading(0); D.setCam(yaw, 0.12); D.setZoom(0.45); }, yaw);
    await w(1400); const f = `E:/temp/claude-work/tmpglb/hair-${body}-${i}.png`; await page.screenshot({ path: f }); out.push(f);
  }
  // 걷는 중(고개·몸 흔들림에도 머리가 붙어 있는지)
  await page.keyboard.down('w'); await w(900); await page.screenshot({ path: `E:/temp/claude-work/tmpglb/hair-${body}-3.png` }); await page.keyboard.up('w');
}
console.log('errors', errors.length ? errors.join('\n') : 'none');
await browser.close();
