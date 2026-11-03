import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const p = await b.newPage(); await p.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&ch=10&body=boy&zone=sinai'); await p.waitForFunction('window.__ready === true', { timeout: 150000 });
console.log(await p.evaluate(() => { const d = window.__debug, out = []; for (const [x, z] of [[24, -20], [22, -22], [20, -24], [26, -18], [21.5, -18], [22, -26], [18, -26], [24, -24]]) out.push(`${x},${z}:${d.reachable(x, z)}`); return out.join(' '); }));
await b.close();
