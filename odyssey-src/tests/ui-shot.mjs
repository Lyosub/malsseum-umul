import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 960, height: 560 });
const w = ms => new Promise(r => setTimeout(r, ms)); const dir = 'E:/temp/claude-work/exodus-game/stage1/fx/';
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset');
await page.waitForFunction('window.__ready === true', { timeout: 90000 });
await page.evaluate(() => { const d = window.__debug; d.player.position.set(-2, 0, 9); d.setCam(0.5, 0.45); d.setZoom(1.0); }); await w(2500);
await page.screenshot({ path: dir + 'tags.png' });
await page.evaluate(() => { const d = window.__debug, g = d.markers.find(m => m.data.id === 'guide').mesh.position; d.player.position.set(g.x + 1.5, 0, g.z + 1.2); }); await w(800);
await page.evaluate(() => document.getElementById('interact-btn').click()); await w(700);
await page.screenshot({ path: dir + 'dlg-center.png' });
// 게시판 단계로 넘겨 금색 표시 확인
await page.evaluate(() => { for (let i = 0; i < 20 && window.__debug.dlg; i++) document.getElementById('dlg-next').click(); });
await w(400); await page.evaluate(() => { const b = document.querySelector('#dlg-choices button'); if (b) b.click(); });
for (let i = 0; i < 20; i++){ await page.evaluate(() => { if (window.__debug.dlg) document.getElementById('dlg-next').click(); }); await w(60); }
await page.evaluate(() => { const d = window.__debug; d.player.position.set(2, 0, 12); d.setCam(0.3, 0.4); d.setZoom(1.1); }); await w(1800);
console.log(await page.evaluate(() => window.__debug.curStep().id + ' ' + document.querySelector('#quest-list').textContent));
await page.screenshot({ path: dir + 'board-target.png' });
await browser.close();
