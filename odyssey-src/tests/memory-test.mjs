import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
const w = ms => new Promise(r => setTimeout(r, ms)); const dir = 'E:/temp/claude-work/tmpglb/';
const E = (f, ...a) => page.evaluate(f, ...a);
const close = async () => { for (let k = 0; k < 4; k++){ const n = await page.$$eval('.modal:not(.hidden) .close', b => b.length); if (!n) break; await E(() => document.querySelector('.modal:not(.hidden) .close').click()); await w(300); } };
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&ch=10&body=boy&zone=alpha');
await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await page.waitForFunction('!window.__debug.pendingNPC', { timeout: 90000 }); await w(1500);
// 3. 지난 이야기
await E(() => { const S = window.__debug.ST; S.keys = [{ scene: '두려워하지 말라', t: '너희로 경외하여' }, { scene: '금송아지', t: 'x' }]; });
await E(() => window.__debug.openRecap()); await w(400);
console.log('3 지난 이야기:', (await page.$eval('#recap-body', e => e.innerText)).replace(/\n/g, ' | ').slice(0, 220));
await page.screenshot({ path: dir + 'mem-recap.png' }); await close();
// 1. 전시관: 10장 마친 상태로 바꾸고 마을 다시 불러오기
await E(() => { window.__debug.ST.cleared = true; });
await E(() => window.__debug.travelTo({ to: 'alpha', spawn: [6, -2] })); await page.waitForFunction(() => window.__debug.zone === 'alpha' && !window.__debug.pendingNPC, { timeout: 90000 }); await w(2500);
console.log('1 전시관 물체:', await E(() => window.__debug.exhibit));
await E(() => { const d = window.__debug, m = d.markers.find(x => x.data.id === 'memorial'); const p = m.mesh.position; d.player.position.set(p.x - 1.2, 0, p.z + 1.0); }); await w(900);
await E(() => document.getElementById('interact-btn').click()); await w(500);
console.log('1 전시관 창:', (await page.$eval('#exhibit-body', e => e.innerText)).split('\n').slice(0, 3).join(' | '));
await close();
await E(() => { const D = window.__debug; D.player.position.set(3.5, 0, -3); D.setCam(2.2, 0.25); D.setZoom(1.3); }); await w(1500); await page.screenshot({ path: dir + 'mem-exhibit.png' });
// 2. 여정 지도
for (const [dx, dz] of [[-1.2, -0.8], [0, -1.4], [-1.4, 0.4]]){ await E(([dx, dz]) => { const d = window.__debug, m = d.markers.find(x => x.data.id === 'map'); const p = m.mesh.position; d.player.position.set(p.x + dx, 0, p.z + dz); }, [dx, dz]); await w(800); console.log('지도 옆', dx, dz, await page.$eval('#interact-btn', e => e.textContent)); }
await E(() => window.__debug.openJourney()); await w(500);
console.log('2 여정 지도:', (await page.$eval('#journey-body', e => e.innerText)).split('\n').slice(0, 3).join(' | '));
await page.screenshot({ path: dir + 'mem-journey.png' });
console.log('errors', errors.length ? errors.slice(0, 6) : 'none'); await browser.close();
