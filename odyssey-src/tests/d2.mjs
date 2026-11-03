import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390 });
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&ch=3&body=boy'); await page.waitForFunction('window.__ready === true', { timeout: 150000 });
console.log(await page.evaluate(() => { const D = window.__debug, q = D.curStep(), m = D.markers.filter(x => x.data.id === q.npc).map(x => x.data.id + '@' + x.mesh.position.x.toFixed(1) + ',' + x.mesh.position.z.toFixed(1) + (x.hidden ? '(숨김)' : '')); const e = D.markers.find(x => x.data.id === 'to-midian2'); return JSON.stringify(q) .slice(0, 200) + ' | npc ' + m.join(' ') + ' | 출구 ' + (e && e.data.x + ',' + e.data.z) + ' | 나 ' + D.player.position.x.toFixed(1) + ',' + D.player.position.z.toFixed(1); }));
await browser.close();
