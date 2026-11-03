import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
const w = ms => new Promise(r => setTimeout(r, ms)); const dir = 'E:/temp/claude-work/tmpglb/';
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&ch=3&body=boy');
await page.waitForFunction('window.__ready === true', { timeout: 150000 });
await page.waitForFunction("!window.__debug.pendingNPC", { timeout: 90000 }); await w(1500);
const vis = await page.evaluate(() => window.__debug.markers.filter(m => m.data.challenge).map(m => m.data.id + ':' + (m.hidden ? 'hidden' : 'on')).join(' '));
console.log('도전 자리(3장):', vis);
// 벽돌: 도전 자리에 가서 버튼
await page.evaluate(() => { const D = window.__debug, m = D.markers.find(x => x.data.id === 'ch_brick'); const p = m.mesh.position; D.player.position.set(p.x + 0.8, 0, p.z + 0.6); }); await w(900);
console.log('버튼 글자:', await page.$eval('#interact-btn', e => e.textContent));
await page.evaluate(() => document.getElementById('interact-btn').click()); await w(400);
console.log('벽돌 창 열림:', await page.evaluate(() => window.__debug.mgOpen));
await page.evaluate(() => document.getElementById('mg-act').click());
// 자동으로 초록칸에서 누르기
const t0 = Date.now(); while (Date.now() - t0 < 31500){ await page.evaluate(() => { const n = document.querySelector('.mg-needle'), z = document.querySelector('.mg-zone'); if (!n) return; const nl = parseFloat(n.style.left), zl = parseFloat(z.style.left), zw = parseFloat(z.style.width); if (nl > zl + 1 && nl < zl + zw - 1 && document.getElementById('mg-act').textContent === '누르기!') document.getElementById('mg-act').click(); }); await w(30); }
await page.screenshot({ path: dir + 'mg-brick.png' });
console.log('벽돌 결과:', await page.$eval('#mg-info', e => e.textContent.slice(0, 40)), '| best', await page.evaluate(() => JSON.stringify(window.__debug.ST.best)));
await page.evaluate(() => document.getElementById('mg-close').click()); await w(300);
// 개구리
await page.evaluate(() => { const D = window.__debug; D.startChallenge('frogs'); document.getElementById('mg-act').click(); }); await w(500);
console.log('개구리 수:', await page.evaluate(() => window.__debug.live.objs.length));
await page.evaluate(() => { const D = window.__debug; D.player.position.set(-16, 0, 0); D.setCam(1.57, 0.5); D.setZoom(1.6); }); await w(800);
await page.screenshot({ path: dir + 'mg-frogs.png' });
for (let k = 0; k < 12; k++){ await page.evaluate(() => { const D = window.__debug, g = D.live.objs.find(o => o.userData.flee < 0); if (g) D.player.position.set(g.userData.x + 1, 0, g.userData.z); }); await w(700); }
console.log('개구리 HUD:', await page.$eval('#hud-challenge', e => e.textContent));
await page.evaluate(() => window.__debug.live.t = 0.1); await w(600);
console.log('개구리 끝 best:', await page.evaluate(() => JSON.stringify(window.__debug.ST.best)), '| 남은 개구리', await page.evaluate(() => window.__debug.live.objs.length));
// 우박
await page.evaluate(() => { const D = window.__debug; D.player.position.set(28, 0, 8); D.startChallenge('hail'); document.getElementById('mg-act').click(); }); await w(6000);
await page.screenshot({ path: dir + 'mg-hail.png' });
console.log('우박 HUD(6초, 가만히):', await page.$eval('#hud-challenge', e => e.textContent));
await w(9000); console.log('우박 15초:', await page.$eval('#hud-challenge', e => e.textContent), '| kind', await page.evaluate(() => window.__debug.live.kind));
await page.evaluate(() => window.__debug.live.t = 0.05); await w(500);
console.log('우박 끝 best:', await page.evaluate(() => JSON.stringify(window.__debug.ST.best)), '| 남은 물체', await page.evaluate(() => window.__debug.live.objs.length));
// 소고
await page.evaluate(() => { window.__debug.startChallenge('rhythm'); document.getElementById('mg-act').click(); });
const r0 = Date.now(); while (Date.now() - r0 < 15000){ await page.evaluate(() => { const hitX = document.querySelector('.mg-hit'); if (!hitX) return; const hx = hitX.getBoundingClientRect().left; for (const n of document.querySelectorAll('.mg-note')){ const x = n.getBoundingClientRect().left + 15; if (Math.abs(x - hx) < 6){ document.getElementById('mg-act').click(); break; } } }); await w(15); }
await page.screenshot({ path: dir + 'mg-rhythm.png' });
console.log('소고:', await page.$eval('.mg-judge', e => e.textContent), '| best', await page.evaluate(() => JSON.stringify(window.__debug.ST.best)), '| 배지', await page.evaluate(() => window.__debug.ST.badges.join(',')));
console.log('errors', errors.length ? errors.join('\n') : 'none');
await browser.close();
