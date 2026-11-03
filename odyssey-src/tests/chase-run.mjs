import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
const w = ms => new Promise(r => setTimeout(r, ms)); const dir = 'E:/temp/claude-work/tmpglb/';
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&ch=4&body=boy');
await page.waitForFunction('window.__ready === true', { timeout: 150000 });
await page.waitForFunction('!window.__debug.pendingNPC', { timeout: 90000 });
const step = () => page.evaluate(() => { const q = window.__debug.curStep(); return q ? q.id : 'CLEARED'; });
const obj = () => page.$eval('#quest-list', e => e.textContent.replace(/\s+/g, ' ').trim());
const log = async l => console.log(l.padEnd(16), '→', await step(), '|', (await obj()).slice(0, 60));
async function goNear(id){ await page.evaluate(id => { const d = window.__debug, m = d.markers.find(x => x.data.id === id && !x.hidden); if (!m) throw new Error('no marker ' + id); const p = m.mesh.position; d.player.position.set(p.x + 1.2, 0, p.z + 1.0); }, id); await w(900); }
async function closeModals(){ for (let k = 0; k < 6; k++){ const n = await page.$$eval('.modal:not(.hidden) .close', b => b.length); if (!n) break; await page.evaluate(() => document.querySelector('.modal:not(.hidden) .close').click()); await w(500); } }
async function stepDialog(pick = 0){ for (let k = 0; k < 90; k++){ const st = await page.evaluate(() => ({ open: !!window.__debug.dlg, ch: document.querySelectorAll('#dlg-choices button').length })); if (!st.open) break; if (st.ch) await page.evaluate(p => { const b = document.querySelectorAll('#dlg-choices button'); b[Math.min(p, b.length - 1)].click(); }, pick); else await page.evaluate(() => document.getElementById('dlg-next').click()); await w(90); } await w(1200); await closeModals(); await w(300); await closeModals(); }
async function talk(pick){ await page.evaluate(() => document.getElementById('interact-btn').click()); await w(300); await stepDialog(pick); }
await log('시작');
await page.evaluate(() => { const D = window.__debug; D.travelTo(D.markers.find(m => m.data.id === 'to-redsea').data); });
await page.waitForFunction('window.__debug.zone === "redsea"', { timeout: 120000 }); await page.waitForFunction('!window.__debug.pendingNPC', { timeout: 90000 }); await w(1500);
await log('c4s1 홍해 도착');
await page.evaluate(() => { const D = window.__debug; D.player.position.set(-6, 0, 4); D.setCam(2.6, 0.3); D.setZoom(1.6); }); await w(1500);
await page.screenshot({ path: dir + 'c4-camp.png' });
await goNear('rs_builder'); await talk(); await log('c4s2 장막');
await goNear('lookout'); await talk(); await log('c4s3 언덕');
await page.evaluate(() => { const D = window.__debug; D.player.position.set(-27, 0, -12); D.setCam(1.57, 0.2); D.setZoom(1.3); }); await w(3500);
await page.screenshot({ path: dir + 'c4-army.png' });
for (const id of ['rs_old', 'rs_mom', 'rs_man']){ await goNear(id); await talk(); }
await log('c4s4 백성 3명');
await goNear('moses'); await talk(); await log('c4s5 모세');
await goNear('aaron'); await talk(); await log('c4s6 구름');
await page.evaluate(() => { const D = window.__debug; D.player.position.set(-20, 0, 2); D.setCam(1.57, 0.2); D.setZoom(1.4); }); await w(2500);
await page.screenshot({ path: dir + 'c4-cloud.png' });
await goNear('moses'); await talk(); await log('c4s7 바닷가');
await page.evaluate(() => { const D = window.__debug; D.player.position.set(15.4 - 1.2, 0, 0.6); }); await w(800);
await page.evaluate(() => [...document.querySelectorAll('.skill-list .skill-btn')].find(b => b.textContent.includes('지팡이')).click()); await w(2500);
await stepDialog(); await log('c4s8 지팡이');
await w(5000);
await page.evaluate(() => { const D = window.__debug; D.player.position.set(14.5, 0, 0); D.setCam(-Math.PI / 2, 0.3); }); await w(400);
let caught = 0, maxX = 0; const t0 = Date.now();
await page.keyboard.down('Shift'); await page.keyboard.down('w');
while (Date.now() - t0 < 30000){
  const st = await page.evaluate(() => { const D = window.__debug, P = D.player.position; D.setCam(-Math.PI / 2 + Math.max(-0.4, Math.min(0.4, P.z * 0.25)), 0.3); return { x: P.x, id: D.curStep() ? D.curStep().id : 'X', t: document.getElementById('quest-toast').textContent }; });
  if (st.x < maxX - 10){ caught++; maxX = st.x; }
  maxX = Math.max(maxX, st.x);
  if (st.id !== 'c4s9' || st.x > 51) break;
  await page.keyboard.press('Space'); await w(250);
}
await page.keyboard.up('w'); await page.keyboard.up('Shift');
console.log('달려서 건너기:', ((Date.now() - t0) / 1000).toFixed(1) + '초', '| 최대 x', maxX.toFixed(1), '| 따라잡힘', caught, '| 단계', await page.evaluate(() => window.__debug.curStep().id));
console.log('errors', errors.length ? errors.join(' / ') : 'none');
await browser.close();
