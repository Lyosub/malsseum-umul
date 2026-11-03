// 2·3편 3D 동물·소품이 장면에 놓이는지 화면으로 확인
import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11', '--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 900, height: 500 });
const errs = []; page.on('pageerror', e => errs.push(e.message.slice(0, 200))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
page.on('response', r => { if (r.status() >= 400 && !/favicon/.test(r.url())) errs.push('HTTP ' + r.status() + ' ' + r.url()); });
const w = ms => new Promise(r => setTimeout(r, ms)); const E = (f, ...a) => page.evaluate(f, ...a);
await page.goto('http://localhost:8768/odyssey/index.html?reset&notype&notut&body=boy&devscroll&shopmock', { waitUntil: 'domcontentloaded' });
await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await w(2000);
const OUT = 'E:/temp/claude-work/_props/';
async function go(scroll, sp, zone){
  await E((scroll, sp) => { const D = window.__debug; D.ST.cleared = true; if (scroll){ D.enterScroll(scroll); D.ST.sp[scroll] = Object.assign(D.ST.sp[scroll] || {}, sp); } }, scroll, sp); await w(1200);
  await E(zone => window.__debug.travelTo({ id: 'test', to: zone, spawn: [0, 0] }), zone);
  await page.waitForFunction(z => window.__debug.zone === z && !window.__debug.pendingNPC, { timeout: 120000 }, zone); await w(2500);
}
async function look(x, z, file, dx = 0, dz = 5){
  await E(([x, z, dx, dz]) => { const D = window.__debug; D.player.position.set(x + dx, D.player.position.y, z + dz); }, [x, z, dx, dz]);
  await w(6000); await page.screenshot({ path: OUT + file, type: 'jpeg', quality: 70 }); console.log('찍음', file);
}
await go('judges', { ch: 4, step: 1, cleared: false }, 'jezreel'); await look(-6, -6, 'jg2-oak.jpg', 4, 6);
await go('judges', { ch: 4, step: 6, cleared: false }, 'jezreel'); await look(-12, 7, 'jg2-floor.jpg', 2, 6);
await go('judges', { ch: 5, step: 2, cleared: false }, 'jezreel'); await look(-12, -30, 'jg2-camp.jpg', 6, 12);
await go('judges', { ch: 5, step: 4, cleared: false }, 'jezreel'); await look(8, 19, 'jg2-harod.jpg', -2, 7);
await go('judges', { ch: 6, step: 3, cleared: false }, 'moab'); await look(30, -24, 'jg2-tob.jpg', -3, 5);
await go('judges', { ch: 6, step: 6, cleared: false }, 'moab'); await look(16, 28, 'jg2-house.jpg', -6, -4);
console.log('오류', errs.length, errs.slice(0, 8));
await browser.close();
