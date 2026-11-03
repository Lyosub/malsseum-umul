// 2장 재앙 6~9: 재 가져오기 → 종기 → 우박 경고 알리기(시간 제한) → 우박 → 메뚜기 → 흑암 속 고센 찾아가기 → 바로와 마지막 대화
import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 480, height: 820, isMobile: true, hasTouch: true });
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
const w = ms => new Promise(r => setTimeout(r, ms)); const dir = 'E:/temp/claude-work/exodus-game/stage1/ch2/';
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&ch=2');
await page.waitForFunction('window.__ready === true', { timeout: 90000 });
await page.evaluate(() => { const d = window.__debug; while (d.curStep() && d.curStep().id !== 'c2s13') d.advance(); }); await w(800);
const step = () => page.evaluate(() => { const q = window.__debug.curStep(); return q ? q.id : 'CLEARED'; });
const obj = () => page.$eval('#quest-list', e => e.textContent.replace(/\s+/g, ' ').trim());
const log = async l => console.log(l.padEnd(18), '→', await step(), '|', (await obj()).slice(0, 70));
async function goNear(id){ await page.evaluate(id => { const d = window.__debug, m = d.markers.find(x => x.data.id === id && !x.hidden); const p = m.mesh.position; d.player.position.set(p.x + 1.4, 0, p.z + 1.1); }, id); await w(800); }
async function closeModals(){ for (let k = 0; k < 6; k++){ const n = await page.$$eval('.modal:not(.hidden) .close', b => b.length); if (!n) break; await page.evaluate(() => document.querySelector('.modal:not(.hidden) .close').click()); await w(500); } }
async function stepDialog(stopAt){ for (let k = 0; k < 80; k++){ const st = await page.evaluate(() => ({ open: !!window.__debug.dlg, ch: document.querySelectorAll('#dlg-choices button').length, t: document.getElementById('dlg-text').textContent })); if (!st.open) break; if (stopAt && st.t.includes(stopAt)) return; if (st.ch) await page.evaluate(() => document.querySelector('#dlg-choices button').click()); else await page.evaluate(() => document.getElementById('dlg-next').click()); await w(100); } await w(1200); await closeModals(); await w(300); await closeModals(); }
async function talk(stopAt){ await page.evaluate(() => document.getElementById('interact-btn').click()); await w(300); await stepDialog(stopAt); }
const hide = () => page.evaluate(() => ['hint','joystick-zone','action-cluster','zoom-ctrl'].forEach(i => document.getElementById(i).style.visibility = 'hidden'));
await log('시작');
await goNear('moses'); await talk(); await log('c2s13 재 부탁');
await goNear('bricks'); await talk(); await log('c2s14 재 담기');
await goNear('moses'); await talk(); await log('c2s15 종기');
await goNear('pharaoh'); await talk(); await log('c2s16 우박 경고');
// 알리기 4곳 — 첫 번째는 일부러 시간 초과를 흉내 내려고 먼저 한 곳만 알리고 시간을 0으로
const warns = await page.evaluate(() => window.__debug.markers.filter(m => m.isWarn).map(m => [m.mesh.position.x, m.mesh.position.z]));
console.log('알릴 곳', warns.length);
for (const [x, z] of warns){ await page.evaluate((x, z) => window.__debug.player.position.set(x + 1.2, 0, z + 0.8), x, z); await w(700); await page.evaluate(() => document.getElementById('interact-btn').click()); await w(1900); }
await w(800);
// 우박 장면: 대사 도중 멈춰서 스크린샷
await stepDialog('고센 땅에는 우박이 없었어요');
await hide(); await page.evaluate(() => { const d = window.__debug; d.player.position.set(22, 0, 2); d.setCam(-0.6, 0.3); d.setZoom(1.2); }); await w(1600);
console.log('우박 켜짐:', await page.evaluate(() => window.__debug.hailOn));
await page.screenshot({ path: dir + '5-hail.png' });
await stepDialog(); await log('c2s17 알리기+우박');
await goNear('pharaoh'); await talk(); await log('c2s18 바로(우박)');
await goNear('moses'); await talk('하늘이… 메뚜기');
await page.evaluate(() => { const d = window.__debug; d.setCam(0.4, 0.35); d.setZoom(1.2); }); await w(1500);
await page.screenshot({ path: dir + '6-locust.png' });
await stepDialog(); await log('c2s19 메뚜기');
await goNear('pharaoh'); await talk(); await log('c2s20 서풍');
await goNear('moses'); await talk(); await log('c2s21 흑암 시작');
await w(2500); console.log('어둠(궁전 앞):', (await page.evaluate(() => window.__debug.darkK)).toFixed(2));
await page.evaluate(() => { const d = window.__debug; d.player.position.set(12, 0, -2); d.setCam(1.57, 0.25); d.setZoom(1.2); }); await w(2500);
await page.screenshot({ path: dir + '7-dark.png' });
await page.evaluate(() => window.__debug.player.position.set(2, 0, 0)); await w(1500);
console.log('어둠(고센):', (await page.evaluate(() => window.__debug.darkK)).toFixed(2));
if (await page.evaluate(() => !!window.__debug.dlg)) await stepDialog();
await log('c2s22 빛 따라 고센');
await goNear('pharaoh'); await talk(); await w(800);
console.log('완료 화면:', await page.$eval('#clear-title', e => e.textContent));
await closeModals(); await log('c2s23 마지막 대화');
console.log('구절 수:', await page.evaluate(() => window.__debug.ST.verses.length), '| 퀴즈:', await page.evaluate(() => JSON.stringify(window.__debug.ST.quiz)));
console.log('errors', errors.length ? errors.join('\n') : 'none');
await browser.close();
