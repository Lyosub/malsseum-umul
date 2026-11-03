import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
const w = ms => new Promise(r => setTimeout(r, ms)); const dir = 'E:/temp/claude-work/tmpglb/';
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&ch=3&body=boy');
await page.waitForFunction('window.__ready === true', { timeout: 150000 });
await page.waitForFunction('!window.__debug.pendingNPC', { timeout: 90000 });
const step = () => page.evaluate(() => { const q = window.__debug.curStep(); return q ? q.id : 'CLEARED'; });
const obj = () => page.$eval('#quest-list', e => e.textContent.replace(/\s+/g, ' ').trim());
const log = async l => console.log(l.padEnd(16), '→', await step(), '|', (await obj()).slice(0, 60));
async function goNear(id){ await page.evaluate(id => { const d = window.__debug, m = d.markers.find(x => x.data.id === id && !x.hidden); if (!m) throw new Error('no marker ' + id); const p = m.mesh.position; d.player.position.set(p.x + 1.2, 0, p.z + 1.0); }, id); await w(900); }
async function closeModals(){ for (let k = 0; k < 6; k++){ const n = await page.$$eval('.modal:not(.hidden) .close', b => b.length); if (!n) break; await page.evaluate(() => document.querySelector('.modal:not(.hidden) .close').click()); await w(500); } }
async function stepDialog(pick = 0){ for (let k = 0; k < 90; k++){ const st = await page.evaluate(() => ({ open: !!window.__debug.dlg, ch: document.querySelectorAll('#dlg-choices button').length })); if (!st.open) break; if (st.ch) await page.evaluate(p => { const b = document.querySelectorAll('#dlg-choices button'); b[Math.min(p, b.length - 1)].click(); }, pick); else await page.evaluate(() => document.getElementById('dlg-next').click()); await w(90); } await w(1200); await closeModals(); await w(300); await closeModals(); }
async function talk(pick){ await page.evaluate(() => document.getElementById('interact-btn').click()); await w(300); await stepDialog(pick); }
await log('시작');
console.log('3장 장소 표시(우슬초/반죽):', await page.evaluate(() => ['hyssop', 'bundle'].map(id => { const m = window.__debug.markers.find(x => x.data.id === id); return m && !m.hidden; }).join(',')));
await goNear('moses'); await talk(); await log('c3s1');
await goNear('is_elder'); await talk(); await log('c3s2');
// 양 고르기: 먼저 틀린 답(두 번째) → 대화가 닫히고 단계 그대로 → 다시 맞는 답
await goNear('worker2'); await page.evaluate(() => document.getElementById('interact-btn').click()); await w(300);
for (let k = 0; k < 20; k++){ const n = await page.$$eval('#dlg-choices button', b => b.length); if (n){ const labels = await page.$$eval('#dlg-choices button', b => b.map(x => x.textContent)); const i = labels.findIndex(t => t.includes('크고')); await page.evaluate(i => document.querySelectorAll('#dlg-choices button')[i].click(), i); break; } await page.evaluate(() => document.getElementById('dlg-next').click()); await w(90); }
await stepDialog(); await log('c3s3 틀림');
await goNear('worker2'); await page.evaluate(() => document.getElementById('interact-btn').click()); await w(300);
for (let k = 0; k < 20; k++){ const n = await page.$$eval('#dlg-choices button', b => b.length); if (n){ const labels = await page.$$eval('#dlg-choices button', b => b.map(x => x.textContent)); const i = labels.findIndex(t => t.includes('흠 없고')); await page.evaluate(i => document.querySelectorAll('#dlg-choices button')[i].click(), i); break; } await page.evaluate(() => document.getElementById('dlg-next').click()); await w(90); }
await stepDialog(); await log('c3s3 맞음');
await goNear('hyssop'); await talk(); await log('c3s4');
const doors = await page.evaluate(() => window.__debug.markers.filter(m => m.isMark).map(m => [m.mesh.position.x, m.mesh.position.z]));
console.log('바를 문', doors.length, doors.map(d => d.map(v => v.toFixed(1)).join(',')).join(' | '));
for (const [x, z] of doors){ await page.evaluate((x, z) => window.__debug.player.position.set(x + 0.3, 0, z + 0.3), x, z); await w(700); const lbl = await page.$eval('#interact-btn', e => e.textContent); await page.evaluate(() => document.getElementById('interact-btn').click()); await w(1500); if (lbl !== '바르기') console.log('버튼 글자', lbl); }
await w(600); await stepDialog(1); await log('c3s5 바르기');
await page.evaluate(() => { const D = window.__debug; D.player.position.set(-3, 0, -1); D.setCam(0.9, 0.35); }); await w(1500);
await page.screenshot({ path: dir + 'c3-doors.png' });
await goNear('hb_mother'); await talk(); await log('c3s6 식사');
await page.screenshot({ path: dir + 'c3-dusk.png' });
await page.evaluate(() => window.__debug.player.position.set(-6.4, 0, -4.6)); await w(1800);
if (await page.evaluate(() => !!window.__debug.dlg)) await stepDialog(1);
await log('c3s7 밤중');
await page.evaluate(() => { const D = window.__debug; D.player.position.set(-2, 0, 2); D.setCam(0.6, 0.3); }); await w(2500);
await page.screenshot({ path: dir + 'c3-night.png' });
await goNear('moses'); await talk(); await log('c3s8');
await goNear('eg_noble'); await talk(); await log('c3s9');
await goNear('bundle'); await talk(); await log('c3s10');
await goNear('moses'); await talk(); await w(800);
console.log('완료 화면:', await page.$eval('#clear-title', e => e.textContent));
await closeModals(); await log('c3s11');
await page.evaluate(() => { const D = window.__debug; D.player.position.set(40, 0, 4); D.setCam(-2.3, 0.15); D.setZoom(1.6); }); await w(2500);
await page.screenshot({ path: dir + 'c3-pillar.png' });
console.log('구절:', await page.evaluate(() => window.__debug.ST.verses.join(',')), '| 퀴즈:', await page.evaluate(() => JSON.stringify(window.__debug.ST.quiz)), '| 배지', await page.evaluate(() => window.__debug.ST.badges.join(',')));
console.log('errors', errors.length ? errors.join('\n') : 'none');
await browser.close();
