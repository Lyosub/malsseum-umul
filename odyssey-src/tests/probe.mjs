import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390 });
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&ch=10&body=boy&zone=alpha');
await page.waitForFunction('window.__ready === true', { timeout: 150000 });
console.log(await page.evaluate(() => { const d = window.__debug; const out = [];
 out.push('lib ' + d.reachable(-15.5, -4.5));
 for (let z = -9; z <= -3; z += 1){ let row = z + ': '; for (let x = -17; x <= -10; x += 1) row += d.reachable(x, z) ? 'o' : '.'; out.push(row); }
 return out.join('\n'); }));
await browser.close();
