import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11'] });
const page = await browser.newPage();
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&ch=8&body=boy&zone=egypt');
await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await new Promise(r => setTimeout(r, 2000));
console.log(await page.evaluate(() => { const d = window.__debug; const c = []; for (let x = -18; x <= -4; x += 1.5) for (let z = -2; z <= 12; z += 1.5) c.push([x, z]); return c.filter(([x, z]) => d.reachable(x, z)).map(([x, z]) => `${x},${z}`).join(' '); }));
await browser.close();
