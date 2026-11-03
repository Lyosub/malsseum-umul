import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('dialog', d => d.accept());
const w = ms => new Promise(r => setTimeout(r, ms)); const dir = 'E:/temp/claude-work/tmpglb/';
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&ch=8&body=' + (process.argv[2] || 'boy') + '&shopmock&zone=alpha');
await page.waitForFunction('window.__ready === true', { timeout: 150000 });
await page.waitForFunction('!window.__debug.pendingNPC', { timeout: 90000 });
const E = (f, ...a) => page.evaluate(f, ...a);
await E(() => window.__debug.addMat({ wood: 30, bronze: 9, flax: 20, papyrus: 9, wool: 20, goat: 12, blue: 6, purple: 6, scarlet: 6, silver: 6, gold: 9, onyx: 1 }, null, true));
await E(() => window.__debug.openCraft()); await w(600);
const sets = (process.argv[3] || 'craft-staff-silver,craft-cloak-purple,craft-shoes-travel,craft-head-gold').split(',');
for (const k of sets){ const c = await E(k => window.__debug.CRAFT.find(c => c.k === k).slot, k); await E(c => document.querySelector(`#craft-tabs [data-c="${c}"]`).click(), c); await w(150); await E(k => document.querySelector(`[data-make="${k}"]`).click(), k); await w(500); }
await E(() => document.querySelector('#craft-modal .close').click()); await w(1500);
const tag = process.argv[4] || 'a';
for (const [nm, yaw] of [['front', Math.PI], ['back', 0], ['side', Math.PI / 2]]){
  await E(y => { const D = window.__debug; D.player.position.set(0, 0, 12); D.setHeading(0); D.setCam(y, 0.1); D.setZoom(0.1); }, yaw); await w(1400);
  const b = await E(() => { const D = window.__debug, v = D.player.position.clone(); const r = []; for (const dy of [0, 2.3]){ const p = v.clone(); p.y += dy; p.project(D.camera); r.push([(p.x + 1) / 2 * innerWidth, (1 - p.y) / 2 * innerHeight]); } return r; });
  const h = b[0][1] - b[1][1], cx = b[0][0];
  await page.screenshot({ path: dir + `gear-${tag}-${nm}.png`, clip: { x: Math.max(0, cx - h * 0.55), y: Math.max(0, b[1][1] - h * 0.1), width: h * 1.1, height: h * 1.2 } });
}
console.log('errors', errors.length ? errors : 'none');
await browser.close();
