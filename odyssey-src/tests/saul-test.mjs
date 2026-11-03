// 7편 「사울과 다윗」 1부(1~4장) 처음부터 끝까지 자동 플레이 — 로컬 http(8768)
import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11', '--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/favicon|404/.test(m.text())) errors.push(m.text()); });
page.on('response', r => { if (r.status() >= 400 && !/favicon/.test(r.url())) errors.push('HTTP ' + r.status() + ' ' + r.url()); });
const w = ms => new Promise(r => setTimeout(r, ms)); const E = (f, ...a) => page.evaluate(f, ...a);
async function closeModals(){ if (await E(() => !document.getElementById('ch-fx').classList.contains('hidden'))){ await E(() => document.getElementById('ch-fx').click()); await w(700); } for (let k = 0; k < 6; k++){ const n = await page.$$eval('.modal:not(.hidden) .close', b => b.length); if (!n) break; await E(() => document.querySelector('.modal:not(.hidden) .close').click()); await w(600); } }
async function stepDialog(){ for (let k = 0; k < 160; k++){ const o = await E(() => ({ open: !!window.__debug.dlg, ch: document.querySelectorAll('#dlg-choices button').length })); if (!o.open) break; if (o.ch) await E(() => document.querySelector('#dlg-choices button').click()); else await E(() => document.getElementById('dlg-next').click()); await w(80); } await w(500); }
const st = () => E(() => { const D = window.__debug, q = D.curStep(); return `${D.cur} ${q ? q.id : 'none'} @${D.zone}`; });
async function goNear(id){ await E(id => { const d = window.__debug, m = d.markers.find(x => x.data.id === id && !x.hidden); if (!m) throw new Error('no marker ' + id + ' in ' + d.zone); const p = m.mesh.position; d.player.position.set(p.x - 0.9, 0, p.z + 0.7); }, id); await w(900); }
const act = async () => { await E(() => document.getElementById('interact-btn').click()); await w(500); };
const mg = () => E(() => document.getElementById('mg-act').click());
const finish = async () => { await w(400); await stepDialog(); await closeModals(); await w(700); await closeModals(); };
async function exitTo(id, zone){ await E(id => { const d = window.__debug, m = d.markers.find(x => x.data.id === id && !x.hidden); if (!m) throw new Error('no exit ' + id + ' in ' + d.zone); d.travelTo(m.data); }, id);
  await page.waitForFunction(z => window.__debug.zone === z && !window.__debug.pendingNPC, { timeout: 120000 }, zone); await w(2500); await closeModals(); }
async function talk(id){ await goNear(id); await act(); await finish(); console.log('  ·', id, '→', await st()); }
async function orderAll(n){ for (let i = 0; i < n; i++){ await E(i => document.querySelector(`[data-od="${i}"]`).click(), i); await w(120); } await mg(); }
const chEnd = async label => { await w(1500); await closeModals(); console.log(label, '→', await st()); };

await page.goto('http://localhost:8768/odyssey/index.html?reset&notype&notut&body=boy&devscroll&shopmock', { waitUntil: 'domcontentloaded' });
await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await w(1500);
await E(() => { const D = window.__debug; D.ST.cleared = true; D.ST.sp.wild3 = { ch: 15, step: 9, cleared: true }; D.ST.sp.joshua = { ch: 12, step: 6, cleared: true }; D.ST.sp.judges = { ch: 11, step: 4, cleared: true }; D.ST.sp.ruth = { ch: 8, step: 3, cleared: true }; });
await E(() => window.__debug.enterScroll('saul')); await page.waitForFunction(() => window.__debug.zone === 'shiloh' && !window.__debug.pendingNPC, { timeout: 120000 }); await w(2500); await closeModals();
console.log('펼침', await st());
// 1장
await talk('sl_ramah'); await talk('sl_elders'); await talk('sl_samuel8');
await goNear('sl_samuel8'); await act(); await stepDialog(); await w(300);
for (let k = 0; k < 20; k++){ const d = await E(() => { const b = [...document.querySelectorAll('[data-wy]')].find(b => !/맷돌|침상|겉옷/.test(b.textContent)); if (b){ b.click(); return 0; } return 1; }); if (d) break; await w(120); }
await mg(); await finish(); await chEnd('1장 끝');
// 2장
await exitTo('to-gilgal6', 'gilgal'); await exitTo('to-gibeon', 'gibeon'); await exitTo('to-gibeah', 'gibeah'); console.log('  기브아', await st());
await talk('sl_kish');
await goNear('sl_search'); await act(); await stepDialog(); await w(300);
for (let land = 0; land < 3; land++){ for (let k = 0; k < 5; k++){ await E(() => { const b = [...document.querySelectorAll('[data-sr]')].find(b => b.dataset.sr !== 'next' && b.textContent.includes('🌿')); b.click(); }); await w(120); } await E(() => document.querySelector('[data-sr="next"]').click()); await w(200); }
await mg(); await finish(); console.log('  찾기', await st(), '| 배지', await E(() => window.__debug.ST.badges.includes('lost_donkey')));
await talk('sl_girls'); await talk('sl_samuel_zuph'); await talk('sl_feast'); await talk('sl_edge');
await goNear('sl_edge'); await act(); await stepDialog(); await w(300); await orderAll(5); await finish();
await talk('sl_godhill'); await talk('sl_uncle');
await exitTo('to-gibeon-g', 'gibeon'); await talk('sl_samuel_miz');
await goNear('sl_bags'); await act(); await stepDialog(); await w(300);
await E(() => [...document.querySelectorAll('[data-bg]')].find(b => b.textContent.includes('🧑')).click()); await w(200);
await mg(); await finish(); await chEnd('2장 끝'); console.log('  배지', await E(() => window.__debug.ST.badges.includes('baggage')));
// 3장
await exitTo('to-gilgal4', 'gilgal'); await exitTo('to-moab4', 'moab'); await talk('sl_jabesh');
await exitTo('to-gilgal', 'gilgal'); await exitTo('to-gibeon', 'gibeon'); await exitTo('to-gibeah', 'gibeah'); await talk('sl_saul_field');
await exitTo('to-gibeon-g', 'gibeon'); await exitTo('to-gilgal4', 'gilgal'); await exitTo('to-moab4', 'moab');
await goNear('sl_dawn'); await act(); await stepDialog(); await w(300);
await page.waitForFunction(() => /🌅 새벽/.test(document.getElementById('mg-area').innerText), { timeout: 20000 }); await w(300);
for (let i = 0; i < 3; i++){ await E(i => document.querySelector(`[data-dw="${i}"]`).click(), i); await w(150); }
await mg(); await finish();
await exitTo('to-gilgal', 'gilgal'); await talk('sl_renew'); await chEnd('3장 끝');
// 4장
await talk('sl_samuel12');
await goNear('sl_samuel12'); await act(); await stepDialog(); await w(300); await orderAll(9); await finish();
await goNear('sl_wheat'); await act(); await stepDialog(); await w(300);
await E(() => { const b = document.querySelector('[data-th]'); const r = b.getBoundingClientRect(); b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: r.x + 5, clientY: r.y + 5 })); });
await w(5000); await E(() => window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))); await w(200); await mg(); await finish();
await talk('sl_samuel12'); await chEnd('4장 끝');
console.log('7편', await E(() => JSON.stringify(window.__debug.ST.sp.saul)));
console.log('구절', await E(() => ['1sa8-7', '1sa9-16', '1sa10-24', '1sa11-13', '1sa12-23', '1sa12-24'].filter(v => window.__debug.ST.verses.includes(v)).length), '/ 6');
await page.screenshot({ path: 'E:/temp/claude-work/saul7/_test_end.png' });
console.log('오류', errors.length, errors.slice(0, 8));
await browser.close();
