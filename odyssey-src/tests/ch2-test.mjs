// 2장 1부를 실제 조작으로 끝까지: 모세 → 나일 강가 바로(강이 피로) → 강가 파기 3곳 → 개구리 10마리 → 바로 → 완료
import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 480, height: 820, isMobile: true, hasTouch: true });
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
const w = ms => new Promise(r => setTimeout(r, ms)); const dir = 'E:/temp/claude-work/exodus-game/stage1/ch2/';
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&zone=egypt');
await page.waitForFunction('window.__ready === true', { timeout: 90000 });
await page.evaluate(() => window.__debug.startChapter(1)); await w(800);
const step = () => page.evaluate(() => { const q = window.__debug.curStep(); return q ? q.id : 'CLEARED'; });
const obj = () => page.$eval('#quest-list', e => e.textContent.replace(/\s+/g, ' ').trim());
const log = async l => console.log(l.padEnd(20), '→', await step(), '|', await obj());
async function goNear(id){ await page.evaluate(id => { const d = window.__debug, m = d.markers.find(x => x.data.id === id && !x.hidden); const p = m.mesh.position; d.player.position.set(p.x + 1.4, 0, p.z + 1.1); }, id); await w(800); }
async function closeModals(){ for (let k = 0; k < 6; k++){ const n = await page.$$eval('.modal:not(.hidden) .close', b => b.length); if (!n) break; await page.evaluate(() => document.querySelector('.modal:not(.hidden) .close').click()); await w(500); } }
async function stepDialog(){ for (let k = 0; k < 80; k++){ const st = await page.evaluate(() => ({ open: !!window.__debug.dlg, ch: document.querySelectorAll('#dlg-choices button').length })); if (!st.open) break; if (st.ch) await page.evaluate(() => document.querySelector('#dlg-choices button').click()); else await page.evaluate(() => document.getElementById('dlg-next').click()); await w(100); } await w(1200); await closeModals(); await w(300); await closeModals(); }
async function talk(){ await page.evaluate(() => document.getElementById('interact-btn').click()); await w(300); await stepDialog(); }
await log('시작');
await goNear('moses'); await talk(); await log('c2s1 모세');
const ph = await page.evaluate(() => { const p = window.__debug.markers.find(m => m.data.id === 'pharaoh').mesh.position; return [p.x.toFixed(1), p.z.toFixed(1)]; });
console.log('바로 위치(나일 강가여야):', ph);
await goNear('pharaoh');
await page.evaluate(() => document.getElementById('interact-btn').click()); await w(300);
for (let k = 0; k < 7; k++){ await page.evaluate(() => document.getElementById('dlg-next').click()); await w(120); }
await w(2600); await page.evaluate(() => { const d = window.__debug; d.setCam(1.4, 0.5); d.setZoom(1.3); }); await w(600);
await page.screenshot({ path: dir + '1-blood.png' });
await stepDialog(); await log('c2s2 나일 강가');
const digs = await page.evaluate(() => window.__debug.markers.filter(m => m.isDig).map(m => [m.mesh.position.x, m.mesh.position.z, m.wet]));
console.log('젖은 흙', digs.length, '곳, 물 나오는 곳', digs.filter(d => d[2]).length);
for (const [x, z] of digs){
  if (await step() !== 'c2s3') break;
  await page.evaluate((x, z) => window.__debug.player.position.set(x + 1.0, 0, z + 0.6), x, z); await w(600);
  await page.evaluate(() => document.getElementById('interact-btn').click()); await w(2400);
  if (await page.evaluate(() => !!window.__debug.dlg)){ await stepDialog(); }
}
await w(800); if (await page.evaluate(() => !!window.__debug.dlg)) await stepDialog();
await log('c2s3 강가 파기');
await w(600); await page.evaluate(() => { const d = window.__debug; d.player.position.set(-4, 0, 2); d.setCam(0.6, 0.6); d.setZoom(1.4); }); await w(1200);
await page.screenshot({ path: dir + '2-frogs.png' });
for (let r = 0; r < 4 && await step() === 'c2s4'; r++){
  const fs = await page.evaluate(() => window.__debug.frogs.filter(f => f.flee < 0).map(f => [f.x, f.z]));
  for (const [x, z] of fs){ await page.evaluate((x, z) => window.__debug.player.position.set(x + 1.2, 0, z), x, z); await w(350); }
  await w(1600); if (await page.evaluate(() => !!window.__debug.dlg)) await stepDialog();
}
await log('c2s4 개구리');
await goNear('pharaoh'); await talk(); await w(800);
console.log('완료 화면:', await page.$eval('#clear-title', e => e.textContent));
await closeModals(); await log('c2s5 바로');
console.log('구절:', await page.evaluate(() => window.__debug.ST.verses.join(',')), '| 퀴즈:', await page.evaluate(() => JSON.stringify(window.__debug.ST.quiz)));
console.log('errors', errors.length ? errors.join('\n') : 'none');
await browser.close();
