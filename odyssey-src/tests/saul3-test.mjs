// 7편 3부(8~11장) 자동 플레이 — 2부를 마친 저장본에서 시작. 로컬 http(8768). 실제 입력(pointerdown·click)으로 게임을 끝까지 한다
import puppeteer from 'puppeteer-core';
const OUT = 'E:/temp/claude-work/saul7/';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11', '--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/favicon|404/.test(m.text())) errors.push(m.text()); });
page.on('response', r => { if (r.status() >= 400 && !/favicon/.test(r.url())) errors.push('HTTP ' + r.status() + ' ' + r.url()); });
const w = ms => new Promise(r => setTimeout(r, ms)); const E = (f, ...a) => page.evaluate(f, ...a);
async function closeModals(){ if (await E(() => !document.getElementById('ch-fx').classList.contains('hidden'))){ await E(() => document.getElementById('ch-fx').click()); await w(700); } for (let k = 0; k < 6; k++){ const n = await page.$$eval('.modal:not(.hidden) button', bs => { const b = bs.find(x => x.offsetParent); if (b){ b.click(); return 1; } return 0; }).catch(() => 0); if (!n) break; await w(300); } }
async function stepDialog(){ for (let k = 0; k < 400; k++){ const o = await E(() => ({ open: !!window.__debug.dlg, ch: document.querySelectorAll('#dlg-choices button').length })); if (!o.open) break; if (o.ch) await E(() => document.querySelector('#dlg-choices button').click()); else await E(() => document.getElementById('dlg-next') ? document.getElementById('dlg-next').click() : document.getElementById('dialog').click()); await w(40); } }
const st = () => E(() => { const D = window.__debug, q = D.curStep(); return `${D.cur} ${q ? q.id : 'none'} @${D.zone}`; });
async function goNear(id){ await E(id => { const d = window.__debug, m = d.markers.find(x => x.data.id === id && !x.hidden); if (!m) throw new Error('no marker ' + id + ' in ' + d.zone); const p = m.mesh.position; d.player.position.set(p.x - 0.9, 0, p.z + 0.7); }, id); await w(500); }
const act = async () => { await E(() => document.getElementById('interact-btn').click()); await w(500); };
const mg = () => E(() => document.getElementById('mg-act').click());
const finish = async () => { await w(400); await stepDialog(); await closeModals(); await w(700); await closeModals(); };
async function warp(zone){ await E((z, sp) => window.__debug.travelTo({ id: 'warp', to: z, spawn: sp }), zone, { shiloh: [-34, 0], bethlehem: [0, 36], gibeah: [-36, 20], philistia: [36, 0] }[zone]);
  await page.waitForFunction(z => window.__debug.zone === z && !window.__debug.pendingNPC, { timeout: 120000 }, zone); await w(2500); await closeModals(); }
async function talk(id){ await goNear(id); await act(); await finish(); console.log('  ·', id, '→', await st()); }
async function startGame(id){ await goNear(id); await act(); await stepDialog(); await w(500); }
const endGame = async n => { await mg(); await finish(); console.log('  ' + n, await st()); };
const chEnd = async label => { await w(1500); await closeModals(); console.log(label, '→', await st()); };
const shot = n => page.screenshot({ path: `${OUT}_t3_${n}.png` });
const pd = sel => E(s => { const el = document.querySelector(s); if (!el) return false; el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true })); return true; }, sel);
const badge = k => E(k => window.__debug.ST.badges.includes(k), k);

await page.goto('http://localhost:8768/odyssey/index.html?reset&notype&notut&body=boy&devscroll&shopmock', { waitUntil: 'domcontentloaded' });
await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await w(1500);
await E(() => { const D = window.__debug; D.ST.cleared = true; D.ST.sp.wild3 = { ch: 15, step: 9, cleared: true }; D.ST.sp.joshua = { ch: 12, step: 6, cleared: true }; D.ST.sp.judges = { ch: 11, step: 4, cleared: true }; D.ST.sp.ruth = { ch: 8, step: 3, cleared: true }; D.ST.sp.saul = { ch: 6, step: 5, cleared: true }; D.saveST && D.saveST(); });
await E(() => window.__debug.enterScroll('saul')); await w(4000); await closeModals();
console.log('2부 마친 저장본에서 펼침', await st(), await E(() => JSON.stringify(window.__debug.ST.sp.saul)));
if ((await E(() => !window.__debug.curStep()))){ await E(() => { const b = [...document.querySelectorAll('button')].find(x => x.offsetParent && /다음 장|다음/.test(x.textContent)); if (b) b.click(); }); await w(1500); await closeModals(); console.log('  다음 장 버튼 뒤', await st()); }
await page.waitForFunction(() => window.__debug.curStep && window.__debug.curStep(), { timeout: 60000 });
console.log('8장 시작', await st());
// 8장
if (await E(() => window.__debug.zone !== 'shiloh')) await warp('shiloh');
await shot('ramah'); await talk('sl_horn16');
await warp('bethlehem'); await shot('bethlehem'); await talk('sl_elders16');
await startGame('sl_jesse'); await shot('sons');
for (let i = 0; i < 7; i++){ await E(i => document.querySelector(i % 2 ? '[data-sn="0"]' : '[data-sn="1"]').click(), i); await w(120); if (i === 0) await shot('sons_mid'); }
await shot('sons_end'); await endGame('아들들');
await shot('field'); await talk('sl_david_f'); await talk('sl_samuel_b'); await chEnd('8장 끝');
console.log('  족보 다윗', await E(() => window.__debug.ST.geneal.includes('다윗')));
// 9장
await startGame('sl_flock'); await shot('flock');
for (let k = 0; k < 200; k++){ const fin = await E(() => { if (!document.getElementById('mg-act').disabled) return true; const b = [...document.querySelectorAll('[data-fk]')].find(x => x.textContent !== '🐑'); if (b) b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true })); return false; }); if (fin) break; await w(120); if (k === 12) await shot('flock_mid'); }
await endGame('양 떼');
await warp('gibeah'); await shot('saul16'); await talk('sl_saul16');
await startGame('sl_david_harp'); await w(1200); await shot('harp');
await E(() => { window.__hp = setInterval(() => { for (const el of document.querySelectorAll('[data-hn]')){ if (el.style.display === 'none' || el.textContent === '✨') continue; const dt = +el.dataset.dt; if (dt <= 60 && dt > -200){ el.parentElement.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true })); } } }, 25); });
await page.waitForFunction(() => !document.getElementById('mg-act').disabled, { timeout: 60000 }); await E(() => clearInterval(window.__hp)); await shot('harp_end');
console.log('  수금 배지', await badge('harp_song')); await endGame('수금'); await chEnd('9장 끝');
// 10장
await warp('philistia'); await shot('elah'); await talk('sl_elah');
await warp('bethlehem'); await talk('sl_jesse17');
await warp('philistia'); await talk('sl_eliab'); await talk('sl_saul17');
await startGame('sl_saul17'); await shot('armor');
for (let i = 0; i < 4; i++){ await E(i => document.querySelector(`[data-ar="${i}"]`).click(), i); await w(80); }
await shot('armor_walk'); for (let i = 0; i < 3; i++){ await E(() => document.querySelector('[data-aw]').click()); await w(80); }
for (let i = 0; i < 4; i++){ await E(i => document.querySelector(`[data-ar="${i}"]`).click(), i); await w(80); }
await endGame('갑옷');
await startGame('sl_brook'); await shot('stones');
for (let i = 0; i < 5; i++){ await E(() => document.querySelector('[data-sm="1"]').click()); await w(80); }
await endGame('돌'); console.log('  돌 배지', await badge('five_stones'));
await shot('valley'); await talk('sl_david_v');
await startGame('sl_david_v'); await w(600); await shot('sling');
await pd('[data-sl]'); await w(100);
await E(() => { window.__sl = setInterval(() => { const d = document.querySelector('[data-sdot]'); if (d && Math.abs(+d.dataset.p) < 0.06) document.querySelector('[data-sl]').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true })); }, 30); });
await page.waitForFunction(() => !document.getElementById('mg-act').disabled, { timeout: 20000 }); await E(() => clearInterval(window.__sl)); await shot('sling_end');
await mg(); await w(400);
await stepDialog(); await shot('fallen'); await closeModals(); await w(700); await closeModals(); await chEnd('10장 끝');
// 11장
if (await E(() => window.__debug.zone !== 'gibeah')) await warp('gibeah');
await shot('gibeah11'); await talk('sl_jon18'); await talk('sl_women');
await startGame('sl_saul18'); await shot('spear');
for (let k = 0; k < 120; k++){ const fin = await E(() => { if (!document.getElementById('mg-act').disabled) return true; const bs = [...document.querySelectorAll('[data-sp]')]; const off = bs.findIndex(b => b.style.opacity === '0.4'); (off === 0 ? bs[1] : bs[0]).dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true })); return false; }); if (fin) break; await w(700); if (k === 2) await shot('spear_mid'); }
await endGame('창'); await talk('sl_jon19'); await shot('window'); await talk('sl_window'); await shot('ezel'); await talk('sl_jon20'); await shot('table'); await talk('sl_table');
await startGame('sl_ezel'); await shot('arrow');
await E(() => document.querySelector('[data-aw2]').click()); await w(200); await shot('arrow_sig');
await E(() => document.querySelector('[data-ch="1"]').click()); await w(5400); await shot('arrow_hide');
await E(() => document.querySelector('[data-up]').click()); await w(200);
console.log('  화살'); await mg(); await finish(); await chEnd('11장 끝');
await shot('end');
console.log('화살 배지', await badge('arrow_beyond'));
console.log('7편', await E(() => JSON.stringify(window.__debug.ST.sp.saul)));
console.log('구절', await E(() => ['1sa16-7', '1sa16-23', '1sa17-45', '1sa17-47', '1sa18-3', '1sa20-42'].filter(v => window.__debug.ST.verses.includes(v)).length), '/ 6');
console.log('오류', errors.length, errors.slice(0, 8));
await browser.close();
