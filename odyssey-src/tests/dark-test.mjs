import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const errors = []; page.on('pageerror', e => errors.push(e.message));
const w = ms => new Promise(r => setTimeout(r, ms)); const dir = 'E:/temp/claude-work/tmpglb/';
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&ch=2&body=boy'); await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await page.waitForFunction('!window.__debug.pendingNPC', { timeout: 90000 });
// 바로 c2s22(흑암 길 찾기) 단계로
await page.evaluate(() => { const D = window.__debug; while (D.curStep() && D.curStep().id !== 'c2s22') D.advance(); D.player.position.set(25.5, 0, -10); D.setCam(-Math.PI / 2, 0.35); });
await w(5000);
console.log('단계', await page.evaluate(() => window.__debug.curStep().id), '어둠', (await page.evaluate(() => window.__debug.darkK)).toFixed(2), '| 지도', await page.$eval('#minimap', e => getComputedStyle(e).opacity), '| 나침반', await page.$eval('#compass', e => getComputedStyle(e).opacity));
await page.screenshot({ path: dir + 'dark-view.png' });
// 길이 있는지: 정문 → 고센(0,0)
console.log('길 찾기:', await page.evaluate(() => { const p = window.__debug.findPath(25.5, -10, 2, 0); return p ? p.length + '칸' : '없음'; }));
// 경로 따라 실제로 걷기(키보드 대신 방향 설정 + W)
const t0 = Date.now();
await page.keyboard.down('w');
while (Date.now() - t0 < 40000){
  const st = await page.evaluate(() => { const D = window.__debug, P = D.player.position, path = D.findPath(P.x, P.z, 2, 0); if (path && path.length > 1){ const [x, z] = path[Math.min(2, path.length - 1)]; const h = Math.atan2(x - P.x, -(z - P.z)); D.setCam(-h, 0.35); } return D.curStep() ? D.curStep().id : 'done'; });
  if (st !== 'c2s22') break; await w(250);
}
await page.keyboard.up('w');
console.log('걸어서:', ((Date.now() - t0) / 1000).toFixed(1) + '초', '→', await page.evaluate(() => (window.__debug.curStep() || {}).id), '| x', await page.evaluate(() => window.__debug.player.position.x.toFixed(1)), '| dlg', await page.evaluate(() => !!window.__debug.dlg));
console.log('errors', errors.length ? errors.join('\n') : 'none'); await browser.close();
