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
await E(() => { const S = window.__debug.ST; S.cleared = true; S.sp = S.sp || {}; S.sp.sinai2 = { ch: 4, step: 0, cleared: false, rumor: [] }; });
await E(() => window.__debug.enterScroll('sinai2')); await page.waitForFunction(() => window.__debug.zone === 'sinai' && !window.__debug.pendingNPC, { timeout: 120000 }); await w(2500);
console.log('펼침', await st(), await vis(['lv_nadab', 'lv_abihu', 'lv_eleazar']));
console.log('걸을 수 있음: 광야', await E(() => window.__debug.reachable(30, 4)), '밭', await E(() => window.__debug.reachable(24, 12)), '초막', await E(() => window.__debug.reachable(-6, 11)), '군기', await E(() => window.__debug.reachable(-3.5, 3.4)), '레위인', await E(() => window.__debug.reachable(17.5, -9.5)), '부정', await E(() => window.__debug.reachable(18, -12)));
// 5장
await goNear('lv_door'); await act(); await stepDialog(); console.log('5-1', await st());
await goNear('lv_altar'); await act(); await stepDialog(); await w(800); console.log('5-2', await st(), await vis(['lv_nadab', 'lv_abihu', 'lv_eleazar']));
await E(() => { const D = window.__debug; D.player.position.set(11, 0, -12); D.setCam(-2.4, 0.35); D.setZoom(1.4); }); await w(1200); await page.screenshot({ path: dir + 's2-censers.png' });
await goNear('moses'); await act(); await chEnd(5);
await E(() => window.__debug.refreshShow()); console.log("after refresh", await vis(["lv_nadab","lv_abihu"]), JSON.stringify(await E(() => window.__debug.ST.sp.sinai2)), await E(() => window.__debug.markers.filter(m => m.data.id === "lv_nadab").length)); await browser.close(); process.exit(0);
// 6장
await goNear('moses'); await act(); await stepDialog(); console.log('6-1', await st());
await goNear('lv_field'); await act(); await stepDialog(); await w(300);
await E(() => document.querySelector('[data-fd="0"]').click()); await w(100); console.log('모퉁이 누름 →', await E(() => document.querySelector('#mg-area').innerText.slice(-60)));
const keep = [0, 4, 20, 24, 7, 12, 18];
for (let i = 0; i < 25; i++) if (!keep.includes(i)){ await E(i => document.querySelector(`[data-fd="${i}"]`).click(), i); await w(30); }
await page.screenshot({ path: dir + 's2-field-mg.png' });
await mg(); await finish(); console.log('6-2', await st());
await goNear('aaron'); await act(); await chEnd(6);
// 7장
await goNear('aaron'); await act(); await stepDialog(); console.log('7-1', await st()); await w(6000);
await E(() => { const D = window.__debug; D.player.position.set(20, 0, -6); D.setCam(-2.0, 0.35); D.setZoom(1.6); }); await w(800); await page.screenshot({ path: dir + 's2-goat.png' });
await goNear('lv_fitman'); await act(); await stepDialog(); console.log('7-2', await st());
await goNear('moses'); await act(); await chEnd(7);
// 8장
await goNear('moses'); await act(); await stepDialog(); console.log('8-1', await st());
await goNear('moses'); await act(); await w(300);
const FEAST = ['유월절', '무교절', '첫 이삭 한 단', '새 소제', '나팔을 불어 기념할 날', '속죄일', '초막절'];
for (const f of FEAST){ await E(f => [...document.querySelectorAll('[data-cl]')].find(b => b.querySelector('b').textContent === f).click(), f); await w(80); }
await mg(); await finish(); console.log('8-2', await st());
await goNear('lv_booth'); await act(); await stepDialog(); console.log('8-3', await st());
await goNear('aaron'); await act(); await chEnd(8);
// 9장
await goNear('moses'); await act(); await stepDialog(); console.log('9-1', await st());
await goNear('lv_banner'); await act(); await stepDialog(); await w(300);
const DIR = { 유다: '동', 잇사갈: '동', 스불론: '동', 르우벤: '남', 시므온: '남', 갓: '남', 에브라임: '서', 므낫세: '서', 베냐민: '서', 단: '북', 아셀: '북', 납달리: '북' };
const first = await E(() => (document.querySelector('#mg-area').innerText.match(/🚩 (\S+) 지파/) || [])[1]);
const wrong = ['동', '서', '남', '북'].find(d => d !== DIR[first]);
await E(d => document.querySelector(`[data-cp="${d}"]`).click(), wrong); await w(100); console.log('틀림 힌트(' + first + ') →', await E(() => document.querySelector('#mg-area').innerText.split('\n').pop()));
for (let k = 0; k < 12; k++){ const t = await E(() => (document.querySelector('#mg-area').innerText.match(/🚩 (\S+) 지파/) || [])[1]); await E(d => document.querySelector(`[data-cp="${d}"]`).click(), DIR[t]); await w(60); }
await mg(); await finish(); console.log('9-2', await st(), '| 족보', await E(() => window.__debug.geneal.join(',')));
await E(() => { const D = window.__debug; D.player.position.set(28, 0, -2); D.setCam(-2.3, 0.45); D.setZoom(2.2); }); await w(1200); await page.screenshot({ path: dir + 's2-banners.png' });
await goNear('lv_levite'); await act(); await chEnd(9);
// 10장
await goNear('aaron'); await act(); await stepDialog(); console.log('10-1', await st());
await goNear('moses'); await act(); await stepDialog(); console.log('10-2', await st());
await goNear('lv_unclean'); await act(); await stepDialog(); console.log('10-3', await st());
await goNear('moses'); await act(); await stepDialog(); await w(300);
const TW = { '나팔 두 개': 0, '하나만': 1, '두 번째로 크게': 3, '크게 불어요': 2 };
for (let k = 0; k < 4; k++){ const t = await E(() => document.querySelector('[data-tp]').textContent); const key = Object.keys(TW).find(x => t.includes(x)); await E(i => document.querySelector(`[data-tw="${i}"]`).click(), TW[key]); await w(2100); }
await mg(); await finish(); console.log('10-4', await st());
await goNear('lv_door'); await act(); await stepDialog(); await w(1200); await page.screenshot({ path: dir + 's2-cloud.png' }); await chEnd(10);
console.log('구절', await E(() => ['lv10-3', 'lv19-18', 'lv16-30', 'lv23-2', 'lv25-10', 'nu2-2', 'nu6-24', 'nu9-18'].filter(v => window.__debug.ST.verses.includes(v)).join(',')), '| 진행', JSON.stringify(await E(() => window.__debug.ST.sp.sinai2)));
await E(() => window.__debug.enterScroll('moses')); await w(500);
await E(() => window.__debug.travelTo({ id: 'test', to: 'alpha', spawn: [6, -2] })); await page.waitForFunction(() => window.__debug.zone === 'alpha', { timeout: 60000 }); await w(4000);
console.log('전시관 물체', await E(() => window.__debug.exhibit));
await E(() => { const D = window.__debug; D.player.position.set(5, 0, -3); D.setCam(0.9, 0.3); D.setZoom(1.3); }); await w(1200); await page.screenshot({ path: dir + 's2-exhibit.png' });
await E(() => window.__debug.openExhibit()); await w(300); console.log('전시관 글', await E(() => document.getElementById('exhibit-body').innerText.slice(-160)));
console.log('errors', errors.length ? errors.slice(0, 6) : 'none'); await browser.close();
