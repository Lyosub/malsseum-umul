import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 900, height: 600 });
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&zone=egypt');
await page.waitForFunction('window.__ready === true', { timeout: 150000 });
await page.waitForFunction('window.__debug.pendingNPC === 0', { timeout: 60000 });
const w = ms => new Promise(r => setTimeout(r, ms)); const dir = 'E:/temp/claude-work/exodus-game/stage1/village/';
await page.evaluate(() => ['hint','joystick-zone','action-cluster','zoom-ctrl'].forEach(i => { const e = document.getElementById(i); if (e) e.style.visibility = 'hidden'; }));
// 궁전 입구 확인: 문 위치가 걸을 수 있는 곳인지
console.log('문 위치', await page.evaluate(() => { const D = window.__debug; return ['palace-in','palace-out'].map(id => { const m = D.markers.find(k => k.data.id === id); return id + ' walkable=' + D.walkable(m.data.x, m.data.z); }).join(' | '); }));
await page.evaluate(() => { const D = window.__debug; D.player.position.set(29.5, 0, -17.2); D.setCam(-2.1, 0.3); D.setZoom(1.6); }); await w(2000);
await page.screenshot({ path: dir + 'door-out.png' });
await page.evaluate(() => { const D = window.__debug; const m = D.markers.find(k => k.data.id === 'palace-in'); D.player.position.set(m.data.x - 0.8, 0, m.data.z + 0.5); }); await w(900);
console.log('버튼', await page.$eval('#interact-btn', e => e.className + ' ' + e.textContent));
await page.evaluate(() => document.getElementById('interact-btn').click()); await w(1500);
console.log('들어간 뒤 위치', await page.evaluate(() => { const p = window.__debug.player.position; return p.x.toFixed(1) + ',' + p.z.toFixed(1); }));
await page.screenshot({ path: dir + 'throne-1.png' });
await page.evaluate(() => { const D = window.__debug; D.player.position.set(60, 0, -42); D.setCam(0, 0.35); D.setZoom(2.2); }); await w(1500);
await page.screenshot({ path: dir + 'throne-2.png' });
await page.evaluate(() => { const D = window.__debug; D.player.position.set(60, 0, -45); D.setCam(3.14, 0.2); D.setZoom(1.3); }); await w(1500);
await page.screenshot({ path: dir + 'throne-3.png' });
// 걸어서 벽 밖으로 나갈 수 없는지: 동쪽으로 5초 걷기
await page.evaluate(() => { const D = window.__debug; D.player.position.set(66, 0, -42); D.setCam(-Math.PI / 2, 0.3); }); await page.keyboard.down('w'); await w(2500); await page.keyboard.up('w');
console.log('벽 쪽으로 걸은 뒤 x', await page.evaluate(() => window.__debug.player.position.x.toFixed(2)));
// 나가기
await page.evaluate(() => { const D = window.__debug; const m = D.markers.find(k => k.data.id === 'palace-out'); D.player.position.set(m.data.x, 0, m.data.z - 0.8); }); await w(900);
console.log('버튼', await page.$eval('#interact-btn', e => e.textContent));
await page.evaluate(() => document.getElementById('interact-btn').click()); await w(1500);
console.log('나간 뒤 위치', await page.evaluate(() => { const p = window.__debug.player.position; return p.x.toFixed(1) + ',' + p.z.toFixed(1); }));
await page.evaluate(() => { const D = window.__debug; D.player.position.set(24, 0, -8); D.setCam(-1.0, 0.25); D.setZoom(2.0); }); await w(1800);
await page.screenshot({ path: dir + 'outside-after.png' });
console.log('errors', errors.length ? errors.join('\n') : 'none');
await browser.close();
