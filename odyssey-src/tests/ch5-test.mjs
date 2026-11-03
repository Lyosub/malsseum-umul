import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
const w = ms => new Promise(r => setTimeout(r, ms)); const dir = 'E:/temp/claude-work/tmpglb/';
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&ch=5&body=boy');
await page.waitForFunction('window.__ready === true', { timeout: 150000 });
await page.waitForFunction('!window.__debug.pendingNPC', { timeout: 90000 });
const step = () => page.evaluate(() => { const q = window.__debug.curStep(); return q ? q.id : 'CLEARED'; });
const obj = () => page.$eval('#quest-list', e => e.textContent.replace(/\s+/g, ' ').trim());
const log = async l => console.log(l.padEnd(16), '→', await step(), '|', (await obj()).slice(0, 60));
async function goNear(id){ await page.evaluate(id => { const d = window.__debug, m = d.markers.find(x => x.data.id === id && !x.hidden); if (!m) throw new Error('no marker ' + id); const p = m.mesh.position; d.player.position.set(p.x + 1.2, 0, p.z + 1.0); }, id); await w(900); }
async function closeModals(){ for (let k = 0; k < 6; k++){ const n = await page.$$eval('.modal:not(.hidden) .close', b => b.length); if (!n) break; await page.evaluate(() => document.querySelector('.modal:not(.hidden) .close').click()); await w(500); } }
async function stepDialog(pick = 0){ for (let k = 0; k < 90; k++){ const st = await page.evaluate(() => ({ open: !!window.__debug.dlg, ch: document.querySelectorAll('#dlg-choices button').length })); if (!st.open) break; if (st.ch) await page.evaluate(p => { const b = document.querySelectorAll('#dlg-choices button'); b[Math.min(p, b.length - 1)].click(); }, pick); else await page.evaluate(() => document.getElementById('dlg-next').click()); await w(90); } await w(1200); await closeModals(); await w(300); await closeModals(); }
async function talk(pick){ await page.evaluate(() => document.getElementById('interact-btn').click()); await w(300); await stepDialog(pick); }

const pick = async (sel) => page.evaluate(() => 0);
await log('시작');
await page.evaluate(() => { const D = window.__debug; const m = D.markers.find(x => x.data.id === 'to-wild'); if (!m) throw new Error('no to-wild in ' + D.zone); D.travelTo(m.data); });
await page.waitForFunction('window.__debug.zone === "wild"', { timeout: 120000 }); await page.waitForFunction('!window.__debug.pendingNPC', { timeout: 90000 }); await w(1500);
await log('c5s1 광야 도착');
await page.evaluate(() => { const D = window.__debug; D.player.position.set(-22, 0, -8); D.setCam(0, 0.45); D.setZoom(1.5); }); await w(1500);
await page.screenshot({ path: dir + 'c5-mara-bitter.png' });
await page.evaluate(() => window.__debug.player.position.set(-21, 0, 2.5)); await w(1500); await stepDialog(); await log('c5s2 마라');
for (const id of ['wd_thirsty1', 'wd_thirsty2']){ await goNear(id); await talk(); }
await log('c5s3 목마른 백성');
await goNear('moses'); await talk(); await log('c5s4 모세');
await goNear('mara_tree'); await talk(); await w(3000); await log('c5s5 나무');
await page.evaluate(() => { const D = window.__debug; D.player.position.set(-22, 0, -8); D.setCam(0, 0.45); D.setZoom(1.5); }); await w(1200);
await page.screenshot({ path: dir + 'c5-mara-sweet.png' });
await page.evaluate(() => window.__debug.player.position.set(4, 0, -10)); await w(1500); await stepDialog(); await log('c5s6 엘림');
await page.evaluate(() => { const D = window.__debug; D.player.position.set(4, 0, -6); D.setCam(0, 0.5); D.setZoom(1.8); }); await w(1200);
await page.screenshot({ path: dir + 'c5-elim.png' });
for (const id of ['wd_hungry1', 'wd_hungry2']){ await goNear(id); await talk(); }
await log('c5s7 배고픈 백성');
await goNear('moses'); await talk(); await log('c5s8 약속');
await goNear('quail_spot'); await talk(); await w(2500); await log('c5s9 메추라기');
await page.evaluate(() => { const D = window.__debug; D.player.position.set(22, 0, -12); D.setCam(Math.PI, 0.45); D.setZoom(1.6); }); await w(1500);
await page.screenshot({ path: dir + 'c5-quail.png' });
async function gatherAll(){ for (let k = 0; k < 14; k++){ const left = await page.evaluate(() => { const D = window.__debug, q = D.curStep(); return q && q.manna ? 1 : 0; }); if (!left) break;
  await page.evaluate(() => { const D = window.__debug, P = D.player.position; const f = D.mannaFlakes && D.mannaFlakes[0]; if (f) P.set(f.userData.x, 0, f.userData.z); }); await w(500); if (await page.evaluate(() => !!window.__debug.dlg)) await stepDialog(); } }
await gatherAll(); await log('c5s10 만나 한 오멜');
await goNear('wd_greedy'); await talk(0); await log('c5s11 남긴 만나');
await gatherAll(); await log('c5s12 갑절');
await goNear('field_empty'); await talk(); await log('c5s13 안식일');
await goNear('aaron'); await talk(); await w(800);
console.log('완료 화면:', await page.$eval('#clear-title', e => e.textContent));
await closeModals();
console.log('구절:', await page.evaluate(() => window.__debug.ST.verses.filter(v => /ex1[56]/.test(v)).join(',')), '| 배지', await page.evaluate(() => window.__debug.ST.badges.join(',')), '| 칭호', await page.evaluate(() => window.__debug.myTitle()));
console.log('errors', errors.length ? errors.join(' / ') : 'none');
await browser.close();
