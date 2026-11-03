// 7편 4부(12~16장) 자동 플레이 — 3부를 마친 저장본에서 시작. 로컬 http(8768). 실제 입력으로 게임을 끝까지 하고, 끝난 뒤 받침대까지 본다
import puppeteer from 'puppeteer-core';
const OUT = 'E:/temp/claude-work/saul7/';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11', '--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/favicon|404/.test(m.text())) errors.push(m.text()); });
page.on('response', r => { if (r.status() >= 400 && !/favicon/.test(r.url())) errors.push('HTTP ' + r.status() + ' ' + r.url()); });
const w = ms => new Promise(r => setTimeout(r, ms)); const E = (f, ...a) => page.evaluate(f, ...a);
async function closeModals(){ if (await E(() => !document.getElementById('ch-fx').classList.contains('hidden'))){ await E(() => document.getElementById('ch-fx').click()); await w(700); } for (let k = 0; k < 6; k++){ const n = await page.$$eval('.modal:not(.hidden) button', bs => { const b = bs.find(x => x.offsetParent); if (b){ b.click(); return 1; } return 0; }).catch(() => 0); if (!n) break; await w(300); } }
async function stepDialog(){ for (let k = 0; k < 500; k++){ const o = await E(() => ({ open: !!window.__debug.dlg, ch: document.querySelectorAll('#dlg-choices button').length })); if (!o.open) break; if (o.ch) await E(() => document.querySelector('#dlg-choices button').click()); else await E(() => document.getElementById('dlg-next') ? document.getElementById('dlg-next').click() : document.getElementById('dialog').click()); await w(40); } }
const st = () => E(() => { const D = window.__debug, q = D.curStep(); return `${D.cur} ${q ? q.id : 'none'} @${D.zone}`; });
async function goNear(id){ await E(id => { const d = window.__debug, m = d.markers.find(x => x.data.id === id && !x.hidden); if (!m) throw new Error('no marker ' + id + ' in ' + d.zone); const p = m.mesh.position; d.player.position.set(p.x - 0.9, 0, p.z + 0.7); }, id); await w(500); }
const act = async () => { await E(() => document.getElementById('interact-btn').click()); await w(500); };
const mg = () => E(() => document.getElementById('mg-act').click());
const finish = async () => { await w(400); await stepDialog(); await closeModals(); await w(700); await closeModals(); };
async function warp(zone){ await E((z, sp) => window.__debug.travelTo({ id: 'warp', to: z, spawn: sp }), zone, { judah: [36, 0], gibeah: [-36, 20], philistia: [36, 0], jezreel: [0, 36], moab: [34, 0], alpha: [5.5, -4.5] }[zone]);
  await page.waitForFunction(z => window.__debug.zone === z && !window.__debug.pendingNPC, { timeout: 120000 }, zone); await w(2500); await closeModals(); }
async function talk(id){ await goNear(id); await act(); await finish(); console.log('  ·', id, '→', await st()); }
async function startGame(id){ await goNear(id); await act(); await stepDialog(); await w(500); }
const endGame = async n => { await mg(); await finish(); console.log('  ' + n, await st()); };
const chEnd = async label => { await w(1500); await closeModals(); console.log(label, '→', await st()); };
const shot = n => page.screenshot({ path: `${OUT}_t4_${n}.png` });
const badge = k => E(k => window.__debug.ST.badges.includes(k), k);
const click = sel => E(s => document.querySelector(s).click(), sel);
const pd = sel => E(s => { const el = document.querySelector(s); if (!el) return false; el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true })); return true; }, sel);

await page.goto('http://localhost:8768/odyssey/index.html?reset&notype&notut&body=boy&devscroll&shopmock', { waitUntil: 'domcontentloaded' });
await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await w(1500);
await E(() => { const D = window.__debug; D.ST.cleared = true; D.ST.sp.wild3 = { ch: 15, step: 9, cleared: true }; D.ST.sp.joshua = { ch: 12, step: 6, cleared: true }; D.ST.sp.judges = { ch: 11, step: 4, cleared: true }; D.ST.sp.ruth = { ch: 8, step: 3, cleared: true }; D.ST.sp.saul = { ch: 10, step: 8, cleared: true }; D.saveST && D.saveST(); });
await E(() => window.__debug.enterScroll('saul')); await w(4000); await closeModals();
console.log('3부 마친 저장본에서 펼침', await st(), await E(() => JSON.stringify(window.__debug.ST.sp.saul)));
if ((await E(() => !window.__debug.curStep()))){ await E(() => { const b = [...document.querySelectorAll('button')].find(x => x.offsetParent && /다음 장|다음/.test(x.textContent)); if (b) b.click(); }); await w(1500); await closeModals(); console.log('  다음 장 버튼 뒤', await st()); }
await page.waitForFunction(() => window.__debug.curStep && window.__debug.curStep(), { timeout: 60000 });
console.log('12장 시작', await st());
// 12장
if (await E(() => window.__debug.zone !== 'gibeah')) await warp('gibeah');
await shot('nob'); await talk('sl_ahimelech');
await warp('judah'); await shot('judah'); await startGame('sl_adullam'); await shot('gather');
for (let k = 0; k < 30; k++){ const fin = await E(() => { if (!document.getElementById('mg-act').disabled) return true; const b = document.querySelector('[data-gf="1"]'); b && b.click(); return false; }); if (fin) break; await w(60); }
await shot('gather_end'); await endGame('굴');
await talk('sl_hereth'); await talk('sl_keilah'); await shot('ziph'); await talk('sl_jon23');
await startGame('sl_maon'); await shot('maon');
await E(() => { window.__mn = setInterval(() => { const d = document.querySelector('[data-md]'); if (!d) return; if (+d.dataset.md <= 2){ const me = +d.dataset.me, sl = +d.dataset.sl, fw = (me - sl + 8) % 8; const b = document.querySelector(`[data-mv="${fw <= 4 ? 1 : -1}"]`); b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true })); } }, 200); });
await page.waitForFunction(() => !document.getElementById('mg-act').disabled, { timeout: 60000 }); await E(() => clearInterval(window.__mn)); await shot('maon_end');
await endGame('마온'); await chEnd('12장 끝');
// 13장
await startGame('sl_cave'); await shot('cloak');
for (let k = 0; k < 60; k++){ if (await E(() => !!document.querySelector('[data-cc]'))) break; await pd('[data-ch]'); await w(1100); if (k === 1) await shot('cloak_mid'); await E(() => window.dispatchEvent(new PointerEvent('pointerup'))); await w(1400); }
await shot('cloak_cut'); await click('[data-cc]'); await w(100); await endGame('겉옷');
await talk('sl_saul24'); await shot('camp'); await talk('sl_hachilah');
await startGame('sl_abishai'); await shot('sneak');
const path = [[2,0],[2,1],[2,2],[3,2],[3,3],[3,4],[2,4],[1,4],[1,5]];
for (const [r, c] of path){ await click(`[data-sk="${r},${c}"]`); await w(60); }
await shot('sneak_ab'); await click('[data-kn]'); await w(60); await shot('sneak_take'); await click('[data-tk="0"]'); await w(40); await click('[data-tk="1"]'); await w(60);
for (const [r, c] of [[1,4],[2,4],[3,4],[3,3],[3,2],[2,2],[2,1],[2,0],[3,0]]){ await click(`[data-sk="${r},${c}"]`); await w(60); }
await shot('sneak_end'); await endGame('진영'); console.log('  창과 물병 배지', await badge('spear_jug'));
await talk('sl_far26'); await chEnd('13장 끝');
// 14장
await talk('sl_david25'); await shot('carmel'); await talk('sl_nabal');
await startGame('sl_abigail'); await shot('gifts');
for (let i = 0; i < 6; i++){ await click('[data-gift="0"]'); await w(60); }
await shot('gifts_end'); await endGame('예물'); console.log('  떡 배지', await badge('bread_200'));
await talk('sl_david_m'); await talk('sl_home25'); await chEnd('14장 끝');
// 15장
await warp('philistia'); await shot('gath'); await talk('sl_gath27'); await talk('sl_aphek'); await talk('sl_ziklag'); await shot('ziklag'); await talk('sl_abiathar'); await talk('sl_besor');
await startGame('sl_egyptian'); await shot('feed'); for (let i = 0; i < 4; i++){ await click(`[data-fd="${i}"]`); await w(60); } await endGame('애굽 사람');
await shot('prints'); await talk('sl_amalek30'); await shot('amalek');
await startGame('sl_david_s'); await shot('share');
for (const [i, n] of [[0, 3], [1, 2], [2, 4]]) for (let k = 0; k < n; k++){ await click(`[data-mv2="0,${i}"]`); await w(40); }
await shot('share_mid'); await click('[data-eq]'); await w(100); await endGame('분배'); console.log('  분배 배지', await badge('share_alike')); await chEnd('15장 끝');
// 16장
await warp('jezreel'); await shot('spring'); await talk('sl_camp28');
await goNear('sl_gilboa'); await act(); await w(400); await stepDialog(); await w(2000); await shot('gilboa'); await closeModals(); await w(700); await closeModals(); console.log('  · 길보아 →', await st());
await startGame('sl_way'); await shot('way');
for (let i = 0; i < 5; i++){ await click(`[data-od="${i}"]`); await w(60); }
await shot('way_end'); await endGame('사울의 길');
await warp('moab'); await shot('jabesh'); await startGame('sl_jabesh_men'); await shot('run');
const run = async () => { for (let i = 0; i < 22; i++){ await pd(`[data-ft="${i % 2}"]`); await w(25); } };
await run(); await shot('run_wall'); await click('[data-wall]'); await w(80); await run(); await shot('run_end');
await mg(); await w(500); await stepDialog(); await w(1800); await closeModals(); await w(1000); await shot('end_a'); await closeModals();
console.log('16장 끝 →', await st(), await E(() => JSON.stringify(window.__debug.ST.sp.saul)));
console.log('구절', await E(() => ['1sa22-2', '1sa23-16', '1sa24-6', '1sa26-23', '1sa25-32', '1sa30-6', '1sa30-24', '1ch10-13', '1ch10-14', '1sa31-13'].filter(v => window.__debug.ST.verses.includes(v)).length), '/ 10');
await w(1500); await closeModals();
if (await E(() => window.__debug.zone !== 'alpha')) await warp('alpha');
await w(2500); await E(() => { const d = window.__debug; d.player.position.set(14, 0, 3); }); await w(1200); await shot('pedestal');
console.log('오류', errors.length, errors.slice(0, 8));
await browser.close();
