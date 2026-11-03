import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('dialog', d => d.accept());
const w = ms => new Promise(r => setTimeout(r, ms)); const dir = 'E:/temp/claude-work/tmpglb/';
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&ch=8&body=boy&shopmock&zone=midian');
await page.waitForFunction('window.__ready === true', { timeout: 150000 });
await page.waitForFunction('!window.__debug.pendingNPC', { timeout: 90000 }); await w(1500);
const E = (f, ...a) => page.evaluate(f, ...a);
async function goNear(id){ await E(id => { const d = window.__debug, m = d.markers.find(x => x.data.id === id && !x.hidden); if (!m) throw new Error('no marker ' + id); const p = m.mesh.position; d.player.position.set(p.x + 0.9, 0, p.z + 0.7); }, id); await w(900); }
async function closeModals(){ for (let k = 0; k < 6; k++){ const n = await page.$$eval('.modal:not(.hidden) .close', b => b.length); if (!n) break; await E(() => document.querySelector('.modal:not(.hidden) .close').click()); await w(400); } }
async function stepDialog(pick = 0){ for (let k = 0; k < 90; k++){ const st = await E(() => ({ open: !!window.__debug.dlg, ch: document.querySelectorAll('#dlg-choices button').length })); if (!st.open) break; if (st.ch) await E(p => { const b = document.querySelectorAll('#dlg-choices button'); b[Math.min(p, b.length - 1)].click(); }, pick); else await E(() => document.getElementById('dlg-next').click()); await w(90); } await w(900); await closeModals(); }
const act = () => E(() => document.getElementById('interact-btn').click());
const st = id => E(id => window.__debug.sideState(id) || '-', id);
const tag = id => E(id => { const m = window.__debug.markers.find(x => x.data.id === id); return m && m.tag ? m.tag.userData.el.textContent : '?'; }, id);
const reach = id => E(id => { const d = window.__debug, m = d.markers.find(x => x.data.id === id); if (!m) return 'none'; const p = m.mesh.position; for (let a = 0; a < 8; a++) if (d.reachable(p.x + Math.cos(a) * 1.2, p.z + Math.sin(a) * 1.2)) return 'ok'; return 'NO'; }, id);
const travel = async (z, sp) => { await E(([z, sp]) => window.__debug.travelTo({ to: z, spawn: sp }), [z, sp]); await page.waitForFunction(z => window.__debug.zone === z && !window.__debug.pendingNPC, { timeout: 90000 }, z); await w(2500); };
// 1장
console.log('아론:', await tag('aaron'));
await goNear('aaron'); await act(); await w(500);
for (let k = 0; k < 2; k++){ await E(k => { const bs = [...document.querySelectorAll('[data-card]')].filter(b => !b.textContent.startsWith('▶')); bs[k].click(); }, k); await w(150); }
await E(() => document.getElementById('mg-act').click()); await w(500); await stepDialog(); console.log('1장:', await st('aaron_words'));
// 2·3장
await travel('egypt', [0, 16]);
console.log('기록판 닿음:', await reach('pharaoh_board'));
await goNear('pharaoh_board'); await act(); await w(500); await page.screenshot({ path: dir + 'side-board.png' });
for (let i = 0; i < 3; i++){ await E(i => document.querySelector(`[data-l="${i}"]`).click(), i); await w(100); await E(i => document.querySelector(`[data-r="${i}"]`).click(), i); await w(100); }
await E(() => document.getElementById('mg-act').click()); await w(500); await stepDialog(); console.log('2장:', await st('pharaoh_board'));
await goNear('hb_grandma'); await act(); await w(300); await stepDialog(); console.log('3장 시작:', await st('neighbor'));
for (const id of ['nb_bowl', 'nb_shoes', 'nb_staff']){ console.log(' ', id, await reach(id)); await goNear(id); await act(); await w(500); }
await goNear('hb_grandma'); await act(); await w(300); await stepDialog(); console.log('3장:', await st('neighbor'));
// 4장
await travel('redsea', [0, 16]);
await goNear('lookout'); await act(); await w(400); await E(() => document.querySelector('[data-slot="2"]').click()); await w(200); await E(() => document.getElementById('mg-act').click()); await w(400); await stepDialog(); console.log('4장:', await st('cloud_place'));
// 5장
await travel('wild', [0, 16]);
await goNear('wd_greedy'); await act(); await w(400); await page.screenshot({ path: dir + 'side-manna.png' });
for (const r of [1, 2]){ for (const [i, p] of [[0, 4], [1, 2], [2, 5]]) for (let k = 0; k < p * r; k++) await E(i => document.querySelector(`[data-add="${i}"]`).click(), i); await E(() => document.getElementById('mg-act').click()); await w(400); }
await stepDialog(); console.log('5장:', await st('manna_share'));
// 6장
await travel('rephidim', [0, 16]);
await goNear('rp_elder'); await act(); await w(300); await stepDialog(); console.log('6장 시작:', await st('water_give'));
await goNear('horeb_rock'); await act(); await w(300); await stepDialog();
for (const id of ['rp_elder', 'rp_angry1']){ await goNear(id); await act(); await w(300); await stepDialog(); }
console.log('6장:', await st('water_give'));
await goNear('rp_angry1'); await act(); await w(300); console.log('기억:', await page.$eval('#dlg-text', e => e.textContent).catch(() => '?')); await stepDialog();
// 7장
await travel('sinai', [0, 16]);
console.log('십부장 닿음:', await reach('captain10'), await tag('captain10'));
await goNear('captain10'); await act(); await w(400);
for (let k = 0; k < 3; k++){ await E(() => { const t = document.querySelector('#mg-area').textContent; const hard = /어려운/.test(t); document.querySelector(`[data-j="${hard ? 'hard' : 'small'}"]`).click(); }); await w(150); }
await E(() => document.getElementById('mg-act').click()); await w(400); await stepDialog(); console.log('7장:', await st('judges'));
console.log('배지:', await E(() => window.__debug.ST.badges.includes('side_all')), '| 재료', JSON.stringify(await E(() => window.__debug.mat)));
await E(() => document.getElementById('btn-hq').click()); await w(400); await page.screenshot({ path: dir + 'side-list.png' });
console.log('errors', errors.length ? errors.slice(0, 8) : 'none');
await browser.close();
