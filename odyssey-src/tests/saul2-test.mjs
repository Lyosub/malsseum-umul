// 7편 2부(5~7장) 자동 플레이 — 1부를 마친 저장본에서 시작. 로컬 http(8768). EARLY=1이면 이레를 기다리지 않고 번제 버튼을 누른다
import puppeteer from 'puppeteer-core';
const EARLY = !!process.env.EARLY;
const OUT = 'E:/temp/claude-work/saul7/';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11', '--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/favicon|404/.test(m.text())) errors.push(m.text()); });
page.on('response', r => { if (r.status() >= 400 && !/favicon/.test(r.url())) errors.push('HTTP ' + r.status() + ' ' + r.url()); });
const w = ms => new Promise(r => setTimeout(r, ms)); const E = (f, ...a) => page.evaluate(f, ...a);
async function closeModals(){ if (await E(() => !document.getElementById('ch-fx').classList.contains('hidden'))){ await E(() => document.getElementById('ch-fx').click()); await w(700); } for (let k = 0; k < 6; k++){ const n = await page.$$eval('.modal:not(.hidden) button', bs => { const b = bs.find(x => x.offsetParent); if (b){ b.click(); return 1; } return 0; }).catch(() => 0); if (!n) break; await w(300); } }
async function stepDialog(){ for (let k = 0; k < 220; k++){ const o = await E(() => ({ open: !!window.__debug.dlg, ch: document.querySelectorAll('#dlg-choices button').length })); if (!o.open) break; if (o.ch) await E(() => document.querySelector('#dlg-choices button').click()); else await E(() => document.getElementById('dlg-next') ? document.getElementById('dlg-next').click() : document.getElementById('dialog').click()); await w(45); } }
const st = () => E(() => { const D = window.__debug, q = D.curStep(); return `${D.cur} ${q ? q.id : 'none'} @${D.zone}`; });
async function goNear(id){ await E(id => { const d = window.__debug, m = d.markers.find(x => x.data.id === id && !x.hidden); if (!m) throw new Error('no marker ' + id + ' in ' + d.zone); const p = m.mesh.position; d.player.position.set(p.x - 0.9, 0, p.z + 0.7); }, id); await w(500); }
const act = async () => { await E(() => document.getElementById('interact-btn').click()); await w(500); };
const mg = () => E(() => document.getElementById('mg-act').click());
const finish = async () => { await w(400); await stepDialog(); await closeModals(); await w(700); await closeModals(); };
async function exitTo(id, zone){ await E(id => { const d = window.__debug, m = d.markers.find(x => x.data.id === id && !x.hidden); if (!m) throw new Error('no exit ' + id + ' in ' + d.zone); d.travelTo(m.data); }, id);
  await page.waitForFunction(z => window.__debug.zone === z && !window.__debug.pendingNPC, { timeout: 120000 }, zone); await w(2500); await closeModals(); }
async function talk(id){ await goNear(id); await act(); await finish(); console.log('  ·', id, '→', await st()); }
const chEnd = async label => { await w(1500); await closeModals(); console.log(label, '→', await st()); };
const shot = n => page.screenshot({ path: `${OUT}_t2_${n}.png` });

await page.goto('http://localhost:8768/odyssey/index.html?reset&notype&notut&body=boy&devscroll&shopmock', { waitUntil: 'domcontentloaded' });
await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await w(1500);
await E(() => { const D = window.__debug; D.ST.cleared = true; D.ST.sp.wild3 = { ch: 15, step: 9, cleared: true }; D.ST.sp.joshua = { ch: 12, step: 6, cleared: true }; D.ST.sp.judges = { ch: 11, step: 4, cleared: true }; D.ST.sp.ruth = { ch: 8, step: 3, cleared: true }; D.ST.sp.saul = { ch: 3, step: 3, cleared: true }; D.saveST && D.saveST(); });
await E(() => window.__debug.enterScroll('saul')); await w(4000); await closeModals();
console.log('1부 마친 저장본에서 펼침', await st(), await E(() => JSON.stringify(window.__debug.ST.sp.saul)));
// 1부를 끝낸 학생이 다음 장으로 넘어가는지
if ((await E(() => !window.__debug.curStep()))){ await E(() => { const b = [...document.querySelectorAll('button')].find(x => x.offsetParent && /다음 장|다음/.test(x.textContent)); if (b) b.click(); }); await w(1500); await closeModals(); console.log('  다음 장 버튼 뒤', await st()); }
await page.waitForFunction(() => window.__debug.curStep && window.__debug.curStep(), { timeout: 60000 });
if (await E(() => window.__debug.zone !== 'gilgal')) await page.waitForFunction(() => window.__debug.zone === 'gilgal', { timeout: 120000 }).catch(() => {});
await w(2500); await closeModals(); console.log('5장 시작', await st());
// 5장
await shot('gilgal13');
await talk('sl_mich');
await goNear('sl_altar13'); await act(); await stepDialog(); await w(500); await shot('wait');
if (EARLY){ await E(() => document.querySelector('[data-wt]').click()); await w(300); }
else await page.waitForFunction(() => !document.getElementById('mg-act').disabled, { timeout: 125000 });
await shot('wait_end'); await mg(); await finish(); console.log('  이레', await st(), '| 배지', await E(() => window.__debug.ST.badges.includes('seven_days')));
await exitTo('to-gibeon', 'gibeon'); await exitTo('to-gibeah', 'gibeah'); await shot('gibeah5');
await talk('sl_smith'); await chEnd('5장 끝');
// 6장
await w(1500); await shot('pass'); await talk('sl_pass'); await talk('sl_jonathan');
await goNear('sl_jonathan'); await act(); await stepDialog(); await w(500); await shot('climb');
for (let k = 0; k < 6; k++){ await E(() => document.querySelector('[data-cb]').click()); await w(100); if (k === 2) await shot('climb_mid'); await E(() => document.querySelector('[data-cf]').click()); await w(100); }
await mg(); await finish(); console.log('  오름', await st(), '| 배지', await E(() => window.__debug.ST.badges.includes('climbed_two')));
await shot('dust14');
await talk('sl_saul14'); await talk('sl_honey'); await shot('honey'); await talk('sl_saul14'); await chEnd('6장 끝');
// 7장
await talk('sl_samuel15'); await talk('sl_night');
await exitTo('to-gibeon-g', 'gibeon'); await exitTo('to-gilgal4', 'gilgal'); await shot('gilgal15');
await talk('sl_saul15g');
await goNear('sl_camp15'); await act(); await stepDialog(); await w(500); await shot('sound');
for (let i = 0; i < 16; i++){ const fin = await E(i => { const b = document.querySelector(`[data-sd="${i}"]`); if (!b) return true; b.click(); return !document.getElementById('mg-act').disabled; }, i); if (i === 5) await shot('sound_mid'); await w(80); if (fin) break; }
await mg(); await finish(); console.log('  소리', await st());
await goNear('sl_samuel15g'); await act(); await stepDialog(); await w(500); await shot('obey');
for (let i = 0; i < 5; i++){ await E(i => document.querySelector(`[data-od="${i}"]`).click(), i); await w(120); } await mg(); await finish(); await chEnd('7장 끝');
await shot('end');
console.log('7편', await E(() => JSON.stringify(window.__debug.ST.sp.saul)));
console.log('구절', await E(() => ['1sa13-14', '1sa14-6', '1sa15-22'].filter(v => window.__debug.ST.verses.includes(v)).length), '/ 3');
console.log('오류', errors.length, errors.slice(0, 8));
await browser.close();
