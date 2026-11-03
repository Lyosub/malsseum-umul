import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset');
await page.waitForFunction('window.__ready === true', { timeout: 150000 });
await page.evaluate(() => { const D = window.__debug, m = D.markers.find(k => k.data.id === 'guide'); D.player.position.set(m.mesh.position.x + 1.2, 0, m.mesh.position.z + 1.5); }); await new Promise(r => setTimeout(r, 2500));
await page.screenshot({ path: 'E:/temp/claude-work/tmpglb/tut-3.png' });
await browser.close();
