import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390 });
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&ch=10&body=boy&zone=alpha');
await page.waitForFunction('window.__ready === true', { timeout: 150000 });
console.log(await page.evaluate(() => { const d = window.__debug; const out = []; const pts = d.markers.map(m => [Math.round(m.mesh.position.x), Math.round(m.mesh.position.z)]);
 for (let z = -40; z <= 40; z += 2){ let row = String(z).padStart(4) + ' '; for (let x = -50; x <= 50; x += 2){ const p = pts.some(([a, b]) => Math.abs(a - x) <= 1 && Math.abs(b - z) <= 1); row += p ? '*' : d.reachable(x, z) ? (d.walkable(x, z) ? '.' : ',') : '#'; } out.push(row); }
 return out.join('\n'); }));
await browser.close();
