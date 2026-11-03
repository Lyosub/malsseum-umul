import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const w = ms => new Promise(r => setTimeout(r, ms)); const errors = [];
const spots = page => page.evaluate(() => { const D = window.__debug; return D.zone + ': ' + D.scrolls.map(o => `(${o.x.toFixed(1)},${o.y.toFixed(1)},${o.z.toFixed(1)})`).join(' '); });
for (const [q, ex] of [['reset&notype&ch=1&body=boy', 'to-midian'], ['reset&notype&ch=3&body=boy', null]]){
  const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390 }); page.on('pageerror', e => errors.push(e.message));
  await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?' + q); await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await w(1500);
  if (ex){ await page.evaluate(ex => { const D = window.__debug; D.travelTo(D.markers.find(m => m.data.id === ex).data); }, ex); await page.waitForFunction('window.__debug.zone === "midian"', { timeout: 120000 }); await w(1500); }
  console.log(await spots(page)); await page.close();
}
console.log('errors', errors.length ? errors.join('\n') : 'none'); await browser.close();
