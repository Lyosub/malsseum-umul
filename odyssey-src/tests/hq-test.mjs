import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('dialog', d => d.accept());
const w = ms => new Promise(r => setTimeout(r, ms)); const dir = 'E:/temp/claude-work/tmpglb/';
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&ch=8&body=boy&shopmock&zone=alpha');
await page.waitForFunction('window.__ready === true', { timeout: 150000 });
await page.waitForFunction('!window.__debug.pendingNPC', { timeout: 90000 });
const E = (f, ...a) => page.evaluate(f, ...a);
async function goNear(id){ await page.evaluate(id => { const d = window.__debug, m = d.markers.find(x => x.data.id === id && !x.hidden); if (!m) throw new Error('no marker ' + id); const p = m.mesh.position; d.player.position.set(p.x + 1.0, 0, p.z + 0.8); }, id); await w(900); }
async function closeModals(){ for (let k = 0; k < 6; k++){ const n = await page.$$eval('.modal:not(.hidden) .close', b => b.length); if (!n) break; await page.evaluate(() => document.querySelector('.modal:not(.hidden) .close').click()); await w(400); } }
async function stepDialog(pick = 0){ for (let k = 0; k < 90; k++){ const st = await page.evaluate(() => ({ open: !!window.__debug.dlg, ch: document.querySelectorAll('#dlg-choices button').length })); if (!st.open) break; if (st.ch) await page.evaluate(p => { const b = document.querySelectorAll('#dlg-choices button'); b[Math.min(p, b.length - 1)].click(); }, pick); else await page.evaluate(() => document.getElementById('dlg-next').click()); await w(90); } await w(900); await closeModals(); }
async function talk(pick){ await page.evaluate(() => document.getElementById('interact-btn').click()); await w(300); await stepDialog(pick); }
const tag = id => E(id => { const m = window.__debug.markers.find(x => x.data.id === id); return m && m.tag ? m.tag.userData.el.textContent : '?'; }, id);
const st = id => E(id => window.__debug.hqState(id) || '-', id);
const travel = async (z, sp) => { await E(([z, sp]) => window.__debug.travelTo({ to: z, spawn: sp }), [z, sp]); await page.waitForFunction(z => window.__debug.zone === z && !window.__debug.pendingNPC, { timeout: 90000 }, z); await w(2500); };
// 메뉴 목록
await E(() => document.getElementById('btn-hq').click()); await w(500);
console.log('히든 목록:', (await page.$eval('#hq-list', e => e.innerText)).split('\n').slice(0, 4).join(' / '));
await page.screenshot({ path: dir + 'hq-list.png' }); await closeModals();
// 두루마리마을: 숨은 두루마리 · 두 사람
console.log('정원사(조건 전):', await tag('a_gardener'));
await E(() => { window.__debug.ST.badges.push('scroll_all'); window.__debug.hqRefresh(true); });
console.log('정원사(조건 후):', await tag('a_gardener'));
await goNear('a_gardener'); await talk(); console.log('숨은 두루마리:', await st('scroll_sage'));
await E(() => { window.__debug.FR.list.set('t1', {}); window.__debug.hqRefresh(true); });
console.log('마을 아이:', await tag('a_kid1')); await goNear('a_kid1'); await talk(); console.log('두 사람:', await st('two_friends'));
await E(() => { window.__debug.FR.list.delete('t1'); });
// 미디안: 잃은 양
await E(() => { window.__debug.ST.petAff = { 'pet-dove': 30 }; });
await travel('midian', [0, 15]);
console.log('목동:', await tag('shepherd')); await goNear('shepherd'); await talk(); await w(2500);
console.log('잃은 양:', await st('lost_lamb'), '양 위치', await E(() => { const l = window.__debug.lostLamb; return l ? [l.position.x, l.position.z].map(v => v.toFixed(1)).join(',') : 'none'; }));
await E(() => { const l = window.__debug.lostLamb; const D = window.__debug; D.player.position.set(l.position.x + 3, 0, l.position.z + 3); D.setCam(0.8, 0.3); D.setZoom(1.2); }); await w(1200);
await page.screenshot({ path: dir + 'hq-lamb.png' });
await E(() => { const l = window.__debug.lostLamb; window.__debug.player.position.set(l.position.x + 1, 0, l.position.z); }); await w(900);
console.log('찾은 뒤:', await st('lost_lamb')); await goNear('shepherd'); await talk(); console.log('잃은 양 끝:', await st('lost_lamb'));
// 애굽: 밤의 벽돌(시간 조건은 건너뛰고 진행 중으로 두고 시험)
await travel('egypt', [0, 16]);
await E(() => { window.__debug.hqSet('night_brick', 'active'); window.__debug.recordBest('brick', 9); }); await w(500);
console.log('벽돌 8장 뒤:', await st('night_brick')); await goNear('hb_brickmaker'); await talk(); console.log('밤의 벽돌 끝:', await st('night_brick'));
// 신 광야: 한 주의 만나
await travel('wild', [0, 16]);
await E(() => { window.__debug.ST.mannaStreak = 6; window.__debug.hqRefresh(true); });
console.log('배고픈 아이:', await tag('wd_hungry2')); await goNear('wd_hungry2'); await talk(); console.log('한 주의 만나:', await st('manna_week'));
// 르비딤: 일손
await travel('rephidim', [0, 16]);
await E(() => { window.__debug.ST.gatherZone = { rephidim: 10 }; window.__debug.hqRefresh(true); });
await goNear('rp_angry2'); await talk(); console.log('르비딤의 일손:', await st('rephidim_work'));
// 시내산: 할머니의 물음 — 틀리면 그대로, 맞히면 완료
await travel('sinai', [0, 16]);
await E(() => { window.__debug.ST.badges.push('ten_words'); window.__debug.hqRefresh(true); });
await goNear('sn_family2'); await talk(1); console.log('할머니(틀림):', await st('grandma_quiz'));
await goNear('sn_family2'); await talk(0); console.log('할머니(맞힘):', await st('grandma_quiz'));
console.log('재료:', JSON.stringify(await E(() => window.__debug.mat)));
await E(() => document.getElementById('btn-hq').click()); await w(500); await page.screenshot({ path: dir + 'hq-list2.png' });
console.log('완료 수:', await E(() => window.__debug.HQ.filter(h => window.__debug.hqState(h.id) === 'done').length));
console.log('errors', errors.length ? errors.slice(0, 8) : 'none');
await browser.close();
