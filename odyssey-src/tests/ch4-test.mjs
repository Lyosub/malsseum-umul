import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
const w = ms => new Promise(r => setTimeout(r, ms)); const dir = 'E:/temp/claude-work/tmpglb/';
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&ch=4&body=boy');
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
await page.evaluate(() => { const D = window.__debug; D.travelTo(D.markers.find(m => m.data.id === 'to-redsea').data); });
await page.waitForFunction('window.__debug.zone === "redsea"', { timeout: 120000 }); await page.waitForFunction('!window.__debug.pendingNPC', { timeout: 90000 }); await w(1500);
await log('c4s1 홍해 도착');
await page.evaluate(() => { const D = window.__debug; D.player.position.set(-6, 0, 4); D.setCam(2.6, 0.3); D.setZoom(1.6); }); await w(1500);
await page.screenshot({ path: dir + 'c4-camp.png' });
await goNear('rs_builder'); await talk(); await log('c4s2 장막');
await goNear('lookout'); await talk(); await log('c4s3 언덕');
await page.evaluate(() => { const D = window.__debug; D.player.position.set(-27, 0, -12); D.setCam(1.57, 0.2); D.setZoom(1.3); }); await w(3500);
await page.screenshot({ path: dir + 'c4-army.png' });
for (const id of ['rs_old', 'rs_mom', 'rs_man']){ await goNear(id); await talk(); }
await log('c4s4 백성 3명');
await goNear('moses'); await talk(); await log('c4s5 모세');
await goNear('aaron'); await talk(); await log('c4s6 구름');
await page.evaluate(() => { const D = window.__debug; D.player.position.set(-20, 0, 2); D.setCam(1.57, 0.2); D.setZoom(1.4); }); await w(2500);
await page.screenshot({ path: dir + 'c4-cloud.png' });
await goNear('moses'); await talk(); await log('c4s7 바닷가');
await page.evaluate(() => { const D = window.__debug; D.player.position.set(15.4 - 1.2, 0, 0.6); }); await w(800);
await page.evaluate(() => [...document.querySelectorAll('.skill-list .skill-btn')].find(b => b.textContent.includes('지팡이')).click()); await w(2500);
await stepDialog(); await log('c4s8 지팡이');
await w(5000);   // 바다가 갈라지는 시간
await page.evaluate(() => { const D = window.__debug; D.player.position.set(15, 0, 0); D.setCam(-Math.PI / 2, 0.3); }); await w(600);
await page.keyboard.down('w'); await w(3500); await page.keyboard.up('w'); await w(300);
console.log('갈라진 길로 걸어 들어가기(x가 17보다 커야):', await page.evaluate(() => { const p = window.__debug.player.position; return p.x.toFixed(1) + ',' + p.z.toFixed(1); }));
console.log('추격 표시:', (await obj()).slice(0, 70));
console.log('지친 사람 보임:', await page.evaluate(() => window.__debug.markers.filter(m => m.data.help).map(m => m.data.id + ':' + (m.hidden ? 'hidden' : 'on')).join(' ')));
for (const id of ['rs_tired1', 'rs_tired2']){ await goNear(id); console.log(' 버튼:', await page.$eval('#interact-btn', e => e.textContent)); await page.evaluate(() => document.getElementById('interact-btn').click()); await w(1500); }
console.log('도운 뒤:', await page.evaluate(() => window.__debug.markers.filter(m => m.data.help).map(m => m.data.id + ':' + (m.hidden ? 'hidden' : 'on')).join(' ')), '| 배지', await page.evaluate(() => window.__debug.ST.badges.join(',')));
await page.evaluate(() => window.__debug.player.position.set(24, 0, 0)); await w(14000);   // 가만히 서 있기 → 따라잡혀야
console.log('가만히 있다가:', await page.evaluate(() => window.__debug.player.position.x.toFixed(1)), '(14 근처면 따라잡혀 다시 시작)', '|', await page.$eval('#quest-toast', e => e.textContent));
await page.evaluate(() => { const D = window.__debug; D.player.position.set(22, 0, 0); D.setCam(-1.57, 0.25); D.setZoom(1.5); }); await w(2000);
await page.screenshot({ path: dir + 'c4-part.png' });
await page.evaluate(() => window.__debug.player.position.set(53, 0, 0)); await w(1800);
if (await page.evaluate(() => !!window.__debug.dlg)) await stepDialog();
await log('c4s9 건넘');
await w(4000);
await closeModals(); await page.evaluate(() => { const D = window.__debug; D.player.position.set(53, 0, 0); D.setCam(Math.PI / 2, 0.3); }); await w(600);
await page.keyboard.down('w'); await w(3500); await page.keyboard.up('w'); await w(300);
console.log('바다가 다시 덮인 뒤 서쪽으로 걸어 보기(x가 49 근처에서 막혀야):', await page.evaluate(() => { const p = window.__debug.player.position; return p.x.toFixed(1) + ',' + p.z.toFixed(1); }));
await goNear('moses'); await talk(); await log('c4s10 믿음');
await goNear('miriam'); await talk(); await w(800);
console.log('완료 화면:', await page.$eval('#clear-title', e => e.textContent));
await page.evaluate(() => { const D = window.__debug; D.player.position.set(54, 0, -1); D.setCam(-2.0, 0.25); D.setZoom(1.4); }); await w(1500);
await page.screenshot({ path: dir + 'c4-song.png' });
await closeModals(); await log('c4s11 노래');
console.log('구절:', await page.evaluate(() => window.__debug.ST.verses.join(',')), '| 퀴즈:', await page.evaluate(() => JSON.stringify(window.__debug.ST.quiz)), '| 배지', await page.evaluate(() => window.__debug.ST.badges.join(',')));
console.log('errors', errors.length ? errors.join('\n') : 'none');
await browser.close();
