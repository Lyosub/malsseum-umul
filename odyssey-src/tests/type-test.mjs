import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 420, height: 800 });
const w = ms => new Promise(r => setTimeout(r, ms));
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset');
await page.waitForFunction('window.__ready === true', { timeout: 90000 });
await page.evaluate(() => { const d = window.__debug, g = d.markers.find(m => m.data.id === 'guide').mesh.position; d.player.position.set(g.x + 1.5, 0, g.z + 1.2); }); await w(800);
await page.evaluate(() => document.getElementById('interact-btn').click()); await w(150);
const txt = () => page.$eval('#dlg-text', e => e.textContent);
console.log('0.15초 뒤(타이핑 중):', JSON.stringify(await txt()));
// 연타 8번(0.05초 간격)
for (let i = 0; i < 8; i++){ await page.evaluate(() => document.getElementById('dlg-next').click()); await w(50); }
console.log('연타 8번 뒤 줄 번호:', await page.evaluate(() => window.__debug.dlg.i), '| 문장:', JSON.stringify(await txt()));
await w(700); await page.evaluate(() => document.getElementById('dlg-next').click()); await w(100);
console.log('0.7초 기다린 뒤 누름 → 줄 번호:', await page.evaluate(() => window.__debug.dlg.i));
await browser.close();
