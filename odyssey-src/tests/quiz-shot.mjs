import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 420, height: 760 });
const w = ms => new Promise(r => setTimeout(r, ms)); const dir = 'E:/temp/claude-work/exodus-game/stage1/fx/';
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&zone=midian');
await page.waitForFunction('window.__ready === true', { timeout: 90000 });
await page.evaluate(() => { const d = window.__debug; while (d.curStep().id !== 's6') d.advance(); const m = d.markers.find(x => x.data.id === 'moses').mesh.position; d.player.position.set(m.x + 1.6, 0, m.z + 1.4); }); await w(1000);
await page.evaluate(() => document.getElementById('interact-btn').click()); await w(200);
for (let i = 0; i < 2; i++){ await page.evaluate(() => document.getElementById('dlg-next').click()); await w(150); }
await w(300); await page.screenshot({ path: dir + 'q1-key.png' });
for (let i = 0; i < 30; i++){ const c = await page.$$eval('#dlg-choices button', b => b.map(x => x.textContent)); if (c.length && c.some(t => t.includes('반드시'))) break; if (c.length) await page.evaluate(() => document.querySelector('#dlg-choices button').click()); else await page.evaluate(() => document.getElementById('dlg-next').click()); await w(120); }
await w(300); await page.screenshot({ path: dir + 'q2-quiz.png' });
await browser.close();
