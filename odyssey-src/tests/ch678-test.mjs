import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
const w = ms => new Promise(r => setTimeout(r, ms)); const dir = 'E:/temp/claude-work/tmpglb/';
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&ch=6&body=boy');
await page.waitForFunction('window.__ready === true', { timeout: 150000 });
await page.waitForFunction('!window.__debug.pendingNPC', { timeout: 90000 });
const step = () => page.evaluate(() => { const q = window.__debug.curStep(); return q ? q.id : 'CLEARED'; });
const obj = () => page.$eval('#quest-list', e => e.textContent.replace(/\s+/g, ' ').trim());
const log = async l => console.log(l.padEnd(16), '→', await step(), '|', (await obj()).slice(0, 60));
async function goNear(id){ await page.evaluate(id => { const d = window.__debug, m = d.markers.find(x => x.data.id === id && !x.hidden); if (!m) throw new Error('no marker ' + id); const p = m.mesh.position; d.player.position.set(p.x + 1.2, 0, p.z + 1.0); }, id); await w(900); }
async function closeModals(){ for (let k = 0; k < 6; k++){ const n = await page.$$eval('.modal:not(.hidden) .close', b => b.length); if (!n) break; await page.evaluate(() => document.querySelector('.modal:not(.hidden) .close').click()); await w(500); } }
async function stepDialog(pick = 0){ for (let k = 0; k < 90; k++){ const st = await page.evaluate(() => ({ open: !!window.__debug.dlg, ch: document.querySelectorAll('#dlg-choices button').length })); if (!st.open) break; if (st.ch) await page.evaluate(p => { const b = document.querySelectorAll('#dlg-choices button'); b[Math.min(p, b.length - 1)].click(); }, pick); else await page.evaluate(() => document.getElementById('dlg-next').click()); await w(90); } await w(1200); await closeModals(); await w(300); await closeModals(); }
async function talk(pick){ await page.evaluate(() => document.getElementById('interact-btn').click()); await w(300); await stepDialog(pick); }


const tr = async (id, zone) => { await page.evaluate(id => { const D = window.__debug; const m = D.markers.find(x => x.data.id === id && !x.hidden); if (!m) throw new Error('no exit ' + id + ' in ' + D.zone); D.travelTo(m.data); }, id); await page.waitForFunction(z => window.__debug.zone === z, { timeout: 120000 }, zone); await page.waitForFunction('!window.__debug.pendingNPC', { timeout: 90000 }); await w(2500); };
const shot = async (name, x, z, yaw, pitch, zoom) => { await page.evaluate(([x, z, yaw, pitch, zoom]) => { const D = window.__debug; D.player.position.set(x, 0, z); D.setCam(yaw, pitch); D.setZoom(zoom); }, [x, z, yaw, pitch, zoom]); await w(1500); await page.screenshot({ path: dir + name + '.png' }); };
const reachAt = async (x, z) => { await page.evaluate(([x, z]) => window.__debug.player.position.set(x, 0, z), [x, z]); await w(1500); if (await page.evaluate(() => !!window.__debug.dlg)) await stepDialog(); };
const staff = async () => { await page.evaluate(() => [...document.querySelectorAll('.skill-list .skill-btn')].find(b => b.textContent.includes('지팡이')).click()); await w(2600); await stepDialog(); };
await log('6장 시작');
await tr('to-rephidim', 'rephidim'); await log('c6s1 르비딤');
await reachAt(2, 6); await log('c6s2 도착');
for (const id of ['rp_angry1', 'rp_angry2']){ await goNear(id); await talk(); } await log('c6s3 다툼');
await goNear('moses'); await talk(); await log('c6s4 모세');
await goNear('horeb_rock'); await staff(); await w(1500); await log('c6s5 반석');
await shot('c6-water', -12, -2, 0.6, 0.35, 1.6);
await goNear('moses'); await talk(); await log('c6s6 아말렉');
await shot('c6-battle', 22, 10, -1.2, 0.35, 1.9);
await reachAt(26, -12); await log('c6s7 산 꼭대기');
await goNear('hands_spot'); await page.evaluate(() => document.getElementById('interact-btn').click()); await w(600);
console.log('손 들기 창:', await page.evaluate(() => window.__debug.mgOpen));
await page.keyboard.down('Space');
for (let k = 0; k < 40; k++){ await w(250); const st = await page.evaluate(() => ({ stone: !document.getElementById('hg-stone').classList.contains('hidden'), help: !document.getElementById('hg-help').classList.contains('hidden'), b: document.getElementById('hg-b').textContent })); if (st.stone){ await page.evaluate(() => document.getElementById('hg-stone').click()); } if (st.help){ await page.evaluate(() => document.getElementById('hg-help').click()); } if (+st.b >= 100) break; }
await page.keyboard.up('Space');
console.log('싸움:', await page.$eval('#hg-msg', e => e.textContent));
await page.screenshot({ path: dir + 'c6-hands.png' });
await page.evaluate(() => document.getElementById('mg-act').click()); await w(800); await stepDialog(0); await log('c6s8 손 들기');
await goNear('joshua'); await talk(); await log('c6s9 여호수아');
await goNear('altar_nissi'); await talk(); await w(800);
console.log('완료:', await page.$eval('#clear-title', e => e.textContent)); await closeModals(); await w(1500); await log('7장 시작');
await tr('to-sinai', 'sinai'); await log('c7s1 하나님의 산');
await shot('c8-mountain', -6, 14, 0, 0.12, 2.2);
await goNear('jethro'); await talk(); await log('c7s2 이드로');
await goNear('moses'); await talk(); await log('c7s3 장막');
for (const id of ['sn_line1', 'sn_line2', 'sn_line3']){ await goNear(id); await talk(); } await log('c7s4 줄');
await goNear('jethro'); await talk(); await log('c7s5 조언');
await goNear('moses'); await talk(0); await log('c7s6 지도자');
await goNear('jethro'); await talk(); await w(800);
console.log('완료:', await page.$eval('#clear-title', e => e.textContent)); await closeModals(); await w(1500); await log('8장 시작');
await reachAt(0, -14); await log('c8s1 산 앞');
await goNear('moses'); await talk(); await log('c8s2 언약');
for (const id of ['sn_family1', 'sn_family2', 'sn_family3']){ await goNear(id); await talk(); } await log('c8s3 알리기');
await goNear('boundary'); await talk(); await log('c8s4 경계');
await reachAt(0, -20); await w(3000); await log('c8s5 셋째 날');
await shot('c8-storm', 0, -10, 0, 0.1, 2.4);
await goNear('moses'); await page.evaluate(() => document.getElementById('interact-btn').click()); await w(600);
for (let i = 0; i < 10; i++){ await page.evaluate(i => document.querySelector(`[data-ten="${i}"]`).click(), i); await w(120); }
await page.screenshot({ path: dir + 'c8-tablets.png' });
await page.evaluate(() => document.getElementById('mg-act').click()); await w(800); await stepDialog(); await log('c8s6 두 돌판');
await goNear('aaron'); await talk(); await w(800);
console.log('완료:', await page.$eval('#clear-title', e => e.textContent)); await closeModals();
console.log('구절:', await page.evaluate(() => window.__debug.ST.verses.filter(v => /ex(17|18|19|20)/.test(v)).join(',')), '| 배지', await page.evaluate(() => window.__debug.ST.badges.join(',')), '| 칭호', await page.evaluate(() => window.__debug.myTitle()));
console.log('errors', errors.length ? errors.join(' / ') : 'none');
await browser.close();
