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
const vis = ids => E(ids => ids.map(id => { const m = window.__debug.markers.find(x => x.data.id === id); return id + ':' + (m ? !m.hidden : 'none'); }).join(' '), ids);
const chEnd = async n => { await finish(); await w(1500); console.log(`${n}장 끝:`, await page.$eval('#clear-title', e => e.textContent), '|', await st()); await closeModals(); await w(1500); };
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&ch=10&body=boy&zone=alpha&devscroll');
await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await w(1500);
await E(() => { const S = window.__debug.ST; S.cleared = true; S.sp = S.sp || {}; S.sp.sinai2 = { ch: 9, step: 5, cleared: true, rumor: [] }; });
console.log('두루마리 문 3편 잠김 풀림:', await E(() => { window.__debug.openScrollGate(); return !!document.querySelector('[data-scroll="wild3"]'); })); await closeModals();
await E(() => window.__debug.enterScroll('wild3')); await page.waitForFunction(() => window.__debug.zone === 'kadesh' && !window.__debug.pendingNPC, { timeout: 150000 }); await w(3000);
console.log('펼침', await st(), '| 성막', await E(() => window.__debug.tabStage), '| 걸을 수 있음:', JSON.stringify(await E(() => [[13.4,-15],[-31,-7],[2,12],[4,18],[-31,20],[33,26],[0,4],[3.5,1],[18.5,-10],[-28.5,3],[-25.5,6.5]].map(([x,z]) => x+','+z+':'+window.__debug.reachable(x,z)))));
await E(() => { const D = window.__debug; D.player.position.set(22, 0, -2); D.setCam(-2.3, 0.35); D.setZoom(1.9); }); await w(1500); await page.screenshot({ path: dir + 'k-overview.png' });
// 1장
await goNear('moses'); await act(); await stepDialog(); console.log('1-1', await st());
await goNear('moses'); await act(); await stepDialog(); await w(300);
for (let k = 0; k < 8; k++){ const up = await E(() => document.querySelector('#mg-area').innerText.includes('떠올랐')); await E(u => document.querySelector(`[data-mc="${u ? 'up' : 'rest'}"]`).click(), up); await w(80); }
await mg(); await finish(); console.log('1-2', await st());
await goNear('kd_door'); await act(); await chEnd(1);
// 2장
await goNear('kd_edge'); await act(); await stepDialog(); console.log('2-1', await st());
await goNear('kd_crowd'); await act(); await stepDialog(); console.log('2-2', await st());
await goNear('moses'); await act(); await stepDialog(); await w(300);
for (let i = 0; i < 7; i++){ await E(i => document.querySelector(`[data-el="${i}"]`).click(), i); await w(40); }
await mg(); await finish(); console.log('2-3', await st());
await goNear('kd_door'); await act(); await stepDialog(); console.log('2-4', await st());
await goNear('kd_quail'); await act(); await stepDialog(); await w(1500); await page.screenshot({ path: dir + 'k-quail.png' }); await chEnd(2);
// 3장
await goNear('aaron'); await act(); await stepDialog(); console.log('3-1', await st());
await goNear('kd_door'); await act(); await stepDialog(); await w(1500); console.log('3-2', await st(), await vis(['kd_miriam', 'kd_miriam_out']));
await goNear('moses'); await act(); await stepDialog(); console.log('3-3', await st());
await E(() => { const D = window.__debug; D.player.position.set(-26, 0, 17); D.setCam(-0.8, 0.3); D.setZoom(1.3); }); await w(1500); await page.screenshot({ path: dir + 'k-miriam.png' });
await goNear('kd_outside'); await act(); await w(300); for (let i = 0; i < 8; i++){ await mg(); await w(80); } await chEnd(3);
// 4장
await goNear('moses'); await act(); await stepDialog(); console.log('4-1', await st());
await goNear('kd_eshcol'); await act(); await stepDialog(); await w(300);
for (let t = 0; t < 400; t++){ const s = await E(() => { const b = document.querySelector('#mg-act'); const bar = document.querySelector('#mg-area div[style*="rotate"]'); const m = bar && bar.style.transform.match(/rotate\((-?\d+)deg/); return { done: !b.disabled, ang: m ? +m[1] : 0 }; }); if (s.done) break; if (Math.abs(s.ang) > 4) await E(a => document.querySelector(`[data-gp="${a > 0 ? 1 : -1}"]`).click(), s.ang); await w(90); }
await mg(); await finish(); console.log('4-2', await st());
await goNear('kd_meet'); await act(); await chEnd(4);
// 5장
await goNear('kd_caleb'); await act(); await stepDialog(); console.log('5-1', await st());
await goNear('kd_meet'); await act(); await stepDialog(); await w(300);
await E(() => document.querySelector('[data-sd="fear"]').click()); await w(100); await E(() => document.querySelector('[data-sd="faith"]').click()); await w(100);
await mg(); await finish(); console.log('5-2', await st());
await goNear('kd_joshua'); await act(); await stepDialog(); console.log('5-3', await st());
await goNear('moses'); await act(); await chEnd(5);
console.log('배지', await E(() => window.__debug.ST.badges.filter(b => ['grape_carry', 'with_caleb'].includes(b)).join(',')), '| 구절', await E(() => ['nu10-36', 'nu11-17', 'nu12-3', 'nu13-27', 'nu14-9'].filter(v => window.__debug.ST.verses.includes(v)).join(',')), '| 진행', JSON.stringify(await E(() => window.__debug.ST.sp.wild3)));
// 시내 산으로 돌아가 동쪽 출구 확인
await E(() => window.__debug.travelTo({ id: 'test', to: 'sinai', spawn: [35, 6] })); await page.waitForFunction(() => window.__debug.zone === 'sinai', { timeout: 90000 }); await w(3000);
console.log('시내 산 가데스 출구', await vis(['to-kadesh']), '| 걸을 수 있음', await E(() => window.__debug.reachable(39.5, 6)));
console.log('errors', errors.length ? errors.slice(0, 8) : 'none'); await browser.close();
