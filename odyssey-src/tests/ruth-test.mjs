// 5편 「사사들과 함께」 1부(1~4장) 처음부터 끝까지 자동 플레이 — 로컬 http(8768)
import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11', '--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/favicon|404/.test(m.text())) errors.push(m.text()); });
page.on('response', r => { if (r.status() >= 400 && !/favicon/.test(r.url())) errors.push('HTTP ' + r.status() + ' ' + r.url()); });
const w = ms => new Promise(r => setTimeout(r, ms)); const E = (f, ...a) => page.evaluate(f, ...a);
async function closeModals(){ for (let k = 0; k < 6; k++){ const n = await page.$$eval('.modal:not(.hidden) .close', b => b.length); if (!n) break; await E(() => document.querySelector('.modal:not(.hidden) .close').click()); await w(600); } }
async function stepDialog(){ for (let k = 0; k < 120; k++){ const o = await E(() => ({ open: !!window.__debug.dlg, ch: document.querySelectorAll('#dlg-choices button').length })); if (!o.open) break; if (o.ch) await E(() => document.querySelector('#dlg-choices button').click()); else await E(() => document.getElementById('dlg-next').click()); await w(80); } await w(500); }
const st = () => E(() => { const D = window.__debug, q = D.curStep(); return `${D.cur} ${q ? q.id : 'none'} @${D.zone}`; });
async function goNear(id){ await E(id => { const d = window.__debug, m = d.markers.find(x => x.data.id === id && !x.hidden); if (!m) throw new Error('no marker ' + id + ' in ' + d.zone); const p = m.mesh.position; d.player.position.set(p.x - 0.9, 0, p.z + 0.7); }, id); await w(900); }
const act = async () => { await E(() => document.getElementById('interact-btn').click()); await w(500); };
const mg = () => E(() => document.getElementById('mg-act').click());
const finish = async () => { await w(400); await stepDialog(); await closeModals(); await w(700); await closeModals(); };
async function exitTo(id, zone){ await E(id => { const d = window.__debug, m = d.markers.find(x => x.data.id === id && !x.hidden); if (!m) throw new Error('no exit ' + id + ' in ' + d.zone); d.travelTo(m.data); }, id);
  await page.waitForFunction(z => window.__debug.zone === z && !window.__debug.pendingNPC, { timeout: 120000 }, zone); await w(2500); await closeModals(); }
async function talk(id){ await goNear(id); await act(); await finish(); console.log('  ·', id, '→', await st()); }
async function orderAll(n){ for (let i = 0; i < n; i++){ await E(i => document.querySelector(`[data-od="${i}"]`).click(), i); await w(120); } await mg(); }

async function follow(lo, hi){ for (let k = 0; k < 400; k++){ const r = await E(() => { const a = document.getElementById('mg-area'); if (!a.querySelector('[data-fw]')) return 'done'; const L = [...a.innerHTML.matchAll(/left:([0-9.]+)%/g)].map(m => +m[1]); return L.length >= 2 ? L[0] - L[1] : null; }); if (r === 'done') break; if (r !== null && r > (lo + hi) / 2) await E(() => document.querySelector('[data-fw]').click()); await w(120); } }
await page.goto('http://localhost:8768/odyssey/index.html?reset&notype&notut&body=boy&devscroll&shopmock', { waitUntil: 'domcontentloaded' });
await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await w(1500);
await E(() => { const D = window.__debug; D.ST.cleared = true; D.ST.sp.wild3 = { ch: 15, step: 9, cleared: true }; D.ST.sp.joshua = { ch: 12, step: 6, cleared: true }; D.ST.sp.judges = { ch: 11, step: 4, cleared: true }; });
await E(() => window.__debug.enterScroll('ruth')); await page.waitForFunction(() => window.__debug.zone === 'moab' && !window.__debug.pendingNPC, { timeout: 120000 }); await w(2500); await closeModals();
console.log('펼침', await st());
await talk('rt_moab'); await talk('rt_naomi'); await talk('rt_ruth');
await goNear('rt_naomi'); await act(); await stepDialog(); await w(300); await follow(2, 14); await mg(); await finish(); console.log('  걷기', await st(), '| 배지', await E(() => window.__debug.ST.badges.includes('walk_with')));
await exitTo('to-gilgal', 'gilgal'); await exitTo('to-hebron', 'hebron'); await exitTo('to-bethlehem', 'bethlehem'); console.log('  베들레헴', await st());
await talk('rt_arrive'); await w(1500); await closeModals(); console.log('1장 끝 →', await st());
await talk('rt_ruth2'); await talk('rt_boaz'); await talk('rt_boaz'); await talk('rt_meal');
await goNear('rt_field'); await act(); await stepDialog(); await w(300);
for (let k = 0; k < 120; k++){ const d = await E(() => { const b = [...document.querySelectorAll('[data-gl]')].find(b => b.textContent.includes('🌾')); if (b){ b.click(); return 0; } return document.querySelector('[data-gl]') ? 0 : 1; }); if (d) break; await w(90); }
await mg(); await finish(); await w(1500); await closeModals(); console.log('2장 끝 →', await st(), '| 배지', await E(() => window.__debug.ST.badges.includes('gleaner')));
await talk('rt_naomi3'); await goNear('rt_floor'); await act(); await stepDialog(); await w(300); await orderAll(5); await finish(); await talk('rt_naomi3'); await w(1500); await closeModals(); console.log('3장 끝 →', await st());
await talk('rt_gate'); await goNear('rt_gate'); await act(); await stepDialog(); await w(300);
for (let k = 0; k < 2; k++){ await E(() => document.querySelector('[data-sd="0"]').click()); await w(150); } await mg(); await finish();
await talk('rt_obed'); await talk('rt_obed'); await w(1500); await closeModals(); console.log('4장 끝 →', await st(), '| 족보', await E(() => window.__debug.geneal.filter(n => ['오벳', '이새'].includes(n)).join(',')));
await exitTo('to-hebron-b', 'hebron'); await exitTo('to-gilgal5', 'gilgal'); await exitTo('to-shiloh', 'shiloh');
await talk('sm_ramah');
await goNear('sm_vow'); await act(); await stepDialog(); await w(300);
await E(() => { const b = document.querySelector('[data-pr]'); const r = b.getBoundingClientRect(); b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: r.x + 5, clientY: r.y + 5 })); });
await w(4600); await E(() => window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))); await w(200); await mg(); await finish();
await talk('sm_ramah'); await talk('sm_eli'); await talk('sm_hannah'); await w(1500); await closeModals(); console.log('5장 끝 →', await st());
await talk('sm_sons'); await talk('sm_boy');
await goNear('sm_night'); await act(); await stepDialog(); await w(300);
for (let k = 0; k < 3; k++){ await page.waitForFunction(() => /"사무엘아"/.test(document.getElementById('mg-area').innerText), { timeout: 8000 }); await E(() => document.querySelector('[data-cl="run"]').click()); await w(200); }
await page.waitForFunction(() => /사무엘아 사무엘아/.test(document.getElementById('mg-area').innerText), { timeout: 8000 }); await E(() => document.querySelector('[data-cl="1"]').click()); await w(200);
await mg(); await finish(); await talk('sm_grow'); await w(1500); await closeModals(); console.log('6장 끝 →', await st(), '| 배지', await E(() => window.__debug.ST.badges.includes('speak_lord')));
await talk('sm_battle'); await talk('sm_battle'); await talk('sm_eli4'); await talk('sm_ichabod'); await w(1500); await closeModals(); console.log('7장 끝 →', await st());
await exitTo('to-gilgal6', 'gilgal'); await exitTo('to-gibeon', 'gibeon'); await exitTo('to-philistia', 'philistia');
await talk('sm_ashdod'); await talk('sm_cities'); await talk('sm_lords');
await goNear('sm_cart'); await act(); await stepDialog(); await w(300); await follow(8, 20); await mg(); await finish();
await talk('sm_shemesh'); await w(1500); await closeModals(); console.log('8장 끝 →', await st());
await exitTo('to-gibeon-p', 'gibeon');
await talk('sm_kirjath'); await talk('sm_samuel7'); await talk('sm_thunder');
await goNear('sm_stone'); await act(); await stepDialog(); await w(300); await orderAll(4); await finish(); await w(2500); await closeModals();
console.log('9장 끝 →', await st(), '| 6편', await E(() => JSON.stringify(window.__debug.ST.sp.ruth)), '| 배지', await E(() => window.__debug.ST.badges.includes('ebenezer')));
console.log('구절', await E(() => ['rut1-16', 'rut2-12', 'rut3-11', 'rut4-14', '1sa1-27', '1sa2-2', '1sa3-10', '1sa3-19', '1sa4-21', '1sa6-12', '1sa7-12'].filter(v => window.__debug.ST.verses.includes(v)).length));
console.log('오류', errors.length, errors.slice(0, 6));
await browser.close();
