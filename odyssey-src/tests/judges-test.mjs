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

await page.goto('http://localhost:8768/odyssey/index.html?reset&notype&notut&body=boy&devscroll&shopmock', { waitUntil: 'domcontentloaded' });
await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await w(1500);
await E(() => { window.__debug.ST.cleared = true; window.__debug.ST.sp.joshua = { ch: 12, step: 6, cleared: true }; });
await E(() => window.__debug.enterScroll('judges')); await page.waitForFunction(() => window.__debug.zone === 'gilgal' && !window.__debug.pendingNPC, { timeout: 120000 }); await w(2500); await closeModals();
console.log('펼침', await st());
// 1장
await talk('jg_angel'); await talk('jg_bochim'); await talk('jg_camp');
await goNear('jg_camp'); await act(); await stepDialog(); await w(300); await orderAll(5); await finish(); await w(1500); await closeModals();
console.log('1장 끝 →', await st(), '| 배지', await E(() => window.__debug.ST.badges.includes('cycle_remember')));
// 2장
await exitTo('to-hebron', 'hebron'); console.log('  헤브론', await st());
await talk('jg_caleb'); await talk('jg_achsah'); await talk('jg_upper'); await talk('jg_lower'); await talk('jg_cushan'); await talk('jg_othniel'); await w(1500); await closeModals();
console.log('2장 끝 →', await st());
// 3장
await exitTo('to-gilgal5', 'gilgal');
await talk('jg_palms'); await talk('jg_ehud'); await talk('jg_quarry'); await talk('jg_palace'); await talk('jg_horn');
await goNear('jg_ford'); await act(); await stepDialog(); await w(300);
for (let k = 0; k < 10; k++){ await E(() => { const b = [...document.querySelectorAll('[data-fd]')].find(b => b.textContent.includes('🏃')); b && b.click(); }); await w(150); }
await mg(); await finish(); console.log('  나루', await st());
await talk('jg_shamgar'); await w(1500); await closeModals();
console.log('3장 끝 →', await st());
// 4장
await exitTo('to-shiloh', 'shiloh'); await talk('jg_deborah'); await talk('jg_barak');
await exitTo('to-jezreel', 'jezreel'); console.log('  이스르엘', await st());
await talk('jg_tabor');
await goNear('jg_deborah_t'); await act(); await stepDialog(); await w(300);
await page.waitForFunction(() => /일어나라!/.test(document.getElementById('mg-area').innerText), { timeout: 8000 });
await E(() => document.querySelector('[data-tb="go"]').click()); await w(200);
for (let k = 0; k < 7; k++){ await E(() => { const b = [...document.querySelectorAll('[data-tb]')].find(b => b.textContent.includes('마른 길')); b && b.click(); }); await w(150); }
await mg(); await finish(); console.log('  다볼', await st(), '| 배지', await E(() => window.__debug.ST.badges.includes('kishon')));
await page.screenshot({ path: 'E:/temp/claude-work/_props/jg-kishon.jpg', type: 'jpeg', quality: 70 });
await talk('jg_jael'); await talk('jg_song'); await w(1500); await closeModals();
// 5장
await talk('jg_midian'); await talk('jg_gideon'); await talk('jg_rock'); await talk('jg_baal'); await talk('jg_town'); await talk('jg_horn2');
await goNear('jg_floor'); await act(); await stepDialog(); await w(300);
await E(() => [...document.querySelectorAll('[data-fl]')].find(b => b.textContent.startsWith('양털에만')).click()); await w(150);
for (let k = 0; k < 5; k++){ await E(() => document.querySelector('[data-fl="sq"]').click()); await w(100); }
await E(() => [...document.querySelectorAll('[data-fl]')].find(b => b.textContent.startsWith('양털만 마르고')).click()); await w(150);
await mg(); await finish(); await w(1500); await closeModals(); console.log('5장 끝 →', await st(), '| 배지', await E(() => window.__debug.ST.badges.includes('fleece_twice')));
// 6장
await talk('jg_harod');
await goNear('jg_harod'); await act(); await stepDialog(); await w(300);
for (let k = 0; k < 12; k++){ await E(() => { const t = document.getElementById('mg-area').innerText; const go = t.includes('핥아요'); document.querySelector(`[data-lp="${go ? 'go' : 'home'}"]`).click(); }); await w(100); }
await mg(); await finish(); console.log('  물 가', await st());
await talk('jg_night'); await talk('jg_dream');
await goNear('jg_gideon5'); await act(); await stepDialog(); await w(300);
for (let b = 0; b < 3; b++) for (let k = 0; k < 4; k++){ await E(k => document.querySelector(`[data-tc="${k}"]`).click(), k); await w(100); }
await mg(); await finish(); console.log('  횃불', await st(), '| 배지', await E(() => window.__debug.ST.badges.includes('jar_torch')));
await page.screenshot({ path: 'E:/temp/claude-work/_props/jg-rout.jpg', type: 'jpeg', quality: 70 });
await talk('jg_after'); await w(1500); await closeModals(); console.log('6장 끝 →', await st());
// 7장 — 실로 · 길갈을 지나 모압 평지(길르앗)로
await exitTo('to-shiloh-j', 'shiloh'); await exitTo('to-gilgal6', 'gilgal'); await exitTo('to-moab4', 'moab'); console.log('  길르앗', await st());
await talk('jg_minor1'); await talk('jg_again'); await talk('jg_miz'); await talk('jg_jephthah');
await goNear('jg_jephthah'); await act(); await stepDialog(); await w(300); await orderAll(7); await finish(); console.log('  암몬 왕', await st());
await talk('jg_vow'); await talk('jg_house'); await talk('jg_ford2'); await talk('jg_minor2'); await w(1500); await closeModals();
console.log('7장 끝 →', await st());
await page.screenshot({ path: 'E:/temp/claude-work/_props/jg-gilead.jpg', type: 'jpeg', quality: 70 });
// 8장 — 길갈 · 기브온을 지나 블레셋 평지로
await exitTo('to-gilgal', 'gilgal'); await exitTo('to-gibeon', 'gibeon'); await exitTo('to-philistia', 'philistia'); console.log('  블레셋 평지', await st());
await talk('jg_zorah'); await talk('jg_mwife'); await talk('jg_manoah');
await goNear('jg_manoah'); await act(); await stepDialog(); await w(300);
for (let k = 0; k < 7; k++){ await E(() => { const t = document.getElementById('mg-area').innerText; const yes = /포도주와 독주|부정한 것|삭도|포도나무의 소산/.test(t); document.querySelector(`[data-nz="${yes ? 'yes' : 'no'}"]`).click(); }); await w(100); }
await mg(); await finish(); console.log('  나실인', await st());
await talk('jg_altar13'); await talk('jg_mahaneh'); await w(1500); await closeModals(); console.log('8장 끝 →', await st());
// 9장
await talk('jg_samson'); await talk('jg_vineyard'); await talk('jg_honey');
await goNear('jg_feast'); await act(); await stepDialog(); await w(300);
for (const k of ['🦁', '🍯', '🦁', '🍯']){ await E(k => document.querySelector(`[data-rd="${k}"]`).click(), k); await w(120); }
await mg(); await finish(); console.log('  수수께끼', await st(), '| 배지', await E(() => window.__debug.ST.badges.includes('riddle')));
await talk('jg_fields'); await talk('jg_etam'); await talk('jg_lehi'); await talk('jg_spring'); await w(1500); await closeModals(); console.log('9장 끝 →', await st());
// 10장
await talk('jg_gaza'); await talk('jg_lords');
await goNear('jg_delilah'); await act(); await stepDialog(); await w(300); await orderAll(3); await finish(); console.log('  세 번', await st());
await talk('jg_mill'); await talk('jg_temple');
await goNear('jg_temple'); await act(); await stepDialog(); await w(300);
await E(() => { const b = document.querySelector('[data-pr]'); const r = b.getBoundingClientRect(); b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: r.x + 5, clientY: r.y + 5 })); });
await w(4200); await E(() => window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))); await w(200);
await mg(); await finish(); await w(1500); await closeModals(); console.log('10장 끝 →', await st(), '| 배지', await E(() => window.__debug.ST.badges.includes('last_prayer')));
await page.screenshot({ path: 'E:/temp/claude-work/_props/jg-temple.jpg', type: 'jpeg', quality: 70 });
// 11장 — 기브온 · 길갈을 지나 실로로
await exitTo('to-gibeon-p', 'gibeon'); await exitTo('to-gilgal4', 'gilgal'); await exitTo('to-shiloh', 'shiloh');
await talk('jg_micah'); await talk('jg_levite'); await talk('jg_danspy'); await talk('jg_door');
await goNear('jg_micah'); await act(); await stepDialog(); await w(300); await orderAll(7); await finish(); await w(1500); await closeModals(); console.log('11장 끝 →', await st());
// 12장 — 길갈을 지나 기브온 마을로
await exitTo('to-gilgal6', 'gilgal'); await exitTo('to-gibeon', 'gibeon');
await talk('jg_mizpah20'); await talk('jg_bethel'); await talk('jg_smoke'); await talk('jg_weep');
await goNear('jg_end'); await act(); await stepDialog(); await w(300); await orderAll(12); await finish(); await w(2500); await closeModals();
console.log('12장 끝 →', await st(), '| 5편 완료', await E(() => { const p = window.__debug.ST.sp.judges; return JSON.stringify(p && { ch: p.ch, cleared: p.cleared }); }), '| 배지', await E(() => window.__debug.ST.badges.includes('twelve_judges')));
await page.screenshot({ path: 'E:/temp/claude-work/_props/jg-end.jpg', type: 'jpeg', quality: 70 });
console.log('끝 →', await st(), '| 사사 조각', await E(() => window.__debug.ST.judges12 ? window.__debug.ST.judges12.join(',') : JSON.stringify(Object.keys(window.__debug))));
console.log('구절', await E(() => ['jdg2-10', 'jdg2-16', 'jdg3-9', 'jdg3-15', 'jdg4-14', 'jdg5-31', 'jdg6-12', 'jdg6-16', 'jdg7-2', 'jdg7-20', 'jdg8-23', 'jdg10-16', 'jdg13-5', 'jdg14-14', 'jdg15-18', 'jdg16-28', 'jdg17-6', 'jdg21-25'].filter(v => window.__debug.ST.verses.includes(v)).join(',')));
console.log('오류', errors.length, errors.slice(0, 6));
await browser.close();
