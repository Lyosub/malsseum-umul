import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11', '--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 900, height: 500 });
const w = ms => new Promise(r => setTimeout(r, ms)); const E = (f, ...a) => page.evaluate(f, ...a);
await page.goto('http://localhost:8768/odyssey/index.html?reset&notype&notut&body=boy&devscroll', { waitUntil: 'domcontentloaded' });
await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await w(2000);
async function shot(scroll, sp, zone, near, file){
  await E((scroll, sp) => { const D = window.__debug; D.ST.cleared = true; D.enterScroll(scroll); D.ST.sp[scroll] = Object.assign(D.ST.sp[scroll] || {}, sp); }, scroll, sp); await w(1500);
  const p = await E(id => { const m = window.__debug.markers.find(x => x.data.id === id); return m ? [m.mesh.position.x, m.mesh.position.z] : null; }, near);
  await E((zone, spawn) => window.__debug.travelTo({ id: 'test', to: zone, spawn }), zone, [0, 0]);
  await page.waitForFunction(z => window.__debug.zone === z && !window.__debug.pendingNPC, { timeout: 120000 }, zone); await w(3000);
  await E(id => { const D = window.__debug, m = D.markers.find(x => x.data.id === id); D.player.position.set(m.mesh.position.x, D.player.position.y, m.mesh.position.z + 4.5); }, near);
  await w(7000); await page.screenshot({ path: file, type: 'jpeg', quality: 75 });
}
await shot('wild3', { ch: 12, step: 0 }, 'moab', 'mb_daughters', 'E:/temp/claude-work/_od_daughters.jpg');
await shot('sinai2', { ch: 4, step: 0 }, 'sinai', 'lv_nadab', 'E:/temp/claude-work/_od_priests.jpg');
await browser.close();
