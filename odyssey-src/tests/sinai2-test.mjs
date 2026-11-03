import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
const w = ms => new Promise(r => setTimeout(r, ms)); const E = (f, ...a) => page.evaluate(f, ...a); const dir = 'E:/temp/claude-work/tmpglb/';
async function closeModals(){ for (let k = 0; k < 6; k++){ const n = await page.$$eval('.modal:not(.hidden) .close', b => b.length); if (!n) break; await E(() => document.querySelector('.modal:not(.hidden) .close').click()); await w(600); } }
async function stepDialog(){ for (let k = 0; k < 90; k++){ const o = await E(() => ({ open: !!window.__debug.dlg, ch: document.querySelectorAll('#dlg-choices button').length })); if (!o.open) break; if (o.ch) await E(() => document.querySelector('#dlg-choices button').click()); else await E(() => document.getElementById('dlg-next').click()); await w(90); } await w(500); }
const st = () => E(() => { const D = window.__debug, q = D.curStep(); return `${D.cur} ${q ? q.id : 'none'}`; });
async function goNear(id){ await E(id => { const d = window.__debug, m = d.markers.find(x => x.data.id === id && !x.hidden); if (!m) throw new Error('no marker ' + id); const p = m.mesh.position; d.player.position.set(p.x - 0.9, 0, p.z + 0.7); }, id); await w(900); }
const act = async () => { await E(() => document.getElementById('interact-btn').click()); await w(500); };
const mg = () => E(() => document.getElementById('mg-act').click());
const finish = async () => { await w(400); await stepDialog(); await closeModals(); await w(700); await closeModals(); };
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&ch=10&body=boy&zone=alpha&devscroll');
await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await w(1500);
await E(() => { const S = window.__debug.ST; S.cleared = true; });
await E(() => window.__debug.enterScroll('sinai2')); await page.waitForFunction(() => window.__debug.zone === 'sinai' && !window.__debug.pendingNPC, { timeout: 120000 }); await w(2500);
console.log('펼침', await st(), '| 걸을 수 있음: 문', await E(() => window.__debug.reachable(13.4, -15)), '제단', await E(() => window.__debug.reachable(8.5, -15)), '모세자리', await E(() => window.__debug.reachable(15, -13.2)));
// 1장
await goNear('moses'); await act(); await stepDialog(); console.log('1-1', await st());
await goNear('moses'); await act(); await w(300);
const pick = await E(() => [...document.querySelectorAll('[data-pk]')].findIndex(b => b.textContent.includes('흠 없는 숫양')));
await E(i => document.querySelectorAll('[data-pk]')[i].click(), pick); await w(200); await mg(); await finish(); console.log('1-2', await st());
await goNear('lv_door'); await act(); await finish(); await w(1500); await closeModals(); console.log('1장 끝 →', await st());
// 2장
await goNear('aaron'); await act(); await stepDialog(); console.log('2-1', await st());
await goNear('aaron'); await act(); await w(300);
const ans = { '레 1:3': '번제', '레 2:1': '소제', '레 3:1': '화목제', '레 4:28': '속죄제', '레 5:15': '속건제' };
for (let k = 0; k < 5; k++){ const t = await E(() => document.querySelector('#mg-area').innerText); const key = Object.keys(ans).find(r => t.includes(r)); await E(kd => document.querySelector(`[data-kd="${kd}"]`).click(), ans[key]); await w(800); }
await mg(); await finish(); console.log('2-2', await st());
await goNear('moses'); await act(); await finish(); await w(1500); await closeModals(); console.log('2장 끝 →', await st());
// 3장
console.log('제사장들 보임', await E(() => ['lv_nadab', 'lv_abihu', 'lv_eleazar', 'lv_ithamar'].map(id => { const m = window.__debug.markers.find(x => x.data.id === id); return m ? !m.hidden : 'none'; }).join(',')));
await goNear('moses'); await act(); await stepDialog(); console.log('3-1', await st());
await goNear('aaron'); await act(); await stepDialog(); await w(300);
const ORDER = ['속옷', '띠', '겉옷', '에봇', '에봇의 장식 띠', '흉패', '관', '금 패'];
for (const o of ORDER){ await E(o => [...document.querySelectorAll('[data-rb]')].find(b => b.textContent === o).click(), o); await w(80); }
await mg(); await finish(); console.log('3-2', await st());
await goNear('lv_door'); await act(); await stepDialog(); await w(300); for (let i = 0; i < 8; i++){ await mg(); await w(80); } await finish(); await w(1500); await closeModals(); console.log('3장 끝 →', await st());
// 4장
await E(() => { const D = window.__debug; D.player.position.set(12, 0, -10); D.setCam(-2.2, 0.3); D.setZoom(1.7); }); await w(1200); await page.screenshot({ path: dir + 'sinai2-door.png' });
await goNear('moses'); await act(); await stepDialog(); console.log('4-1', await st());
await goNear('aaron'); await act(); await stepDialog(); console.log('4-2', await st());
await goNear('lv_altar'); await act(); await stepDialog(); await w(1500); await page.screenshot({ path: dir + 'sinai2-fire.png' }); await mg(); await finish(); await w(1500);
console.log('4장 끝:', await page.$eval('#clear-title', e => e.textContent), '|', await st());
await closeModals(); await w(1500);
console.log('구절', await E(() => ['lv1-4', 'lv7-37', 'lv8-36', 'lv9-24'].filter(v => window.__debug.ST.verses.includes(v)).join(',')), '| 진행', JSON.stringify(await E(() => window.__debug.ST.sp.sinai2)), '| 지금', await E(() => window.__debug.cur));
console.log('errors', errors.length ? errors.slice(0, 6) : 'none'); await browser.close();
