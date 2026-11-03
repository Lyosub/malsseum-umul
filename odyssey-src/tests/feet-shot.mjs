import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
page.on('dialog', d => d.accept());
const w = ms => new Promise(r => setTimeout(r, ms)); const dir = 'E:/temp/claude-work/tmpglb/';
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&ch=8&body=boy&shopmock&zone=alpha');
await page.waitForFunction('window.__ready === true', { timeout: 150000 });
await page.waitForFunction('!window.__debug.pendingNPC', { timeout: 90000 });
const E = (f, ...a) => page.evaluate(f, ...a);
await E(() => window.__debug.addMat({ papyrus: 9, goat: 9, bronze: 9 }, null, true));
await E(() => window.__debug.openCraft()); await w(500);
await E(() => document.querySelector('#craft-tabs [data-c="shoes"]').click()); await w(150); await E(() => document.querySelector('[data-make="craft-shoes-travel"]').click()); await w(500);
await E(() => document.querySelector('#craft-modal .close').click()); await w(1200);
for (const dy of process.argv.slice(2).map(Number)){
  await E(v => window.__debug.setShoeDy(v), dy);
  for (const [nm, yaw] of [['side', Math.PI / 2], ['front', Math.PI]]){
    await E(y => { const D = window.__debug; D.player.position.set(0, 0, 12); D.setHeading(0); D.setCam(y, 0.05); D.setZoom(0.1); }, yaw); await w(1100);
    const b = await E(() => { const D = window.__debug, p = D.player.position.clone(); p.project(D.camera); const q = D.player.position.clone(); q.y += 2.3; q.project(D.camera); return [(p.x + 1) / 2 * innerWidth, (1 - p.y) / 2 * innerHeight, (1 - q.y) / 2 * innerHeight]; });
    const h = b[1] - b[2];
    await page.screenshot({ path: dir + `feet-${dy}-${nm}.png`, clip: { x: b[0] - h * 0.3, y: b[1] - h * 0.3, width: h * 0.6, height: h * 0.36 } });
  }
}
await browser.close();
