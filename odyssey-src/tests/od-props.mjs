// 2·3편 3D 동물·소품이 장면에 놓이는지 화면으로 확인
import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11', '--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 900, height: 500 });
const errs = []; page.on('pageerror', e => errs.push(e.message.slice(0, 200))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
page.on('response', r => { if (r.status() >= 400 && !/favicon/.test(r.url())) errs.push('HTTP ' + r.status() + ' ' + r.url()); });
const w = ms => new Promise(r => setTimeout(r, ms)); const E = (f, ...a) => page.evaluate(f, ...a);
await page.goto('http://localhost:8768/odyssey/index.html?reset&notype&notut&body=boy&devscroll', { waitUntil: 'domcontentloaded' });
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
await go('sinai2', { ch: 0, step: 0, cleared: false }, 'sinai'); await look(16.4, -12.5, 's2-1-bull.jpg');
await go('sinai2', { ch: 4, step: 2, cleared: false }, 'sinai'); await look(8.8, -15, 's2-5-censer.jpg', 2, 3);
await go('sinai2', { ch: 5, step: 0, cleared: false }, 'sinai'); await look(24, 12, 's2-6-field.jpg', 0, 7);
await go('sinai2', { ch: 6, step: 0, cleared: false }, 'sinai'); await look(16, -13, 's2-7-goats.jpg');
await go('sinai2', { ch: 7, step: 0, cleared: false }, 'sinai'); await look(-6, 11, 's2-8-booth.jpg');
await go('wild3', { ch: 3, step: 2, cleared: false }, 'kadesh'); await look(1, 3, 'w3-4-fruit.jpg', 0, 4);
await go('wild3', { ch: 9, step: 3, cleared: false }, 'kadesh'); await look(6, -2, 'w3-10-pole.jpg', 0, 7);
await E(() => window.__debug.SCROLL_DEFS.wild3.events.serpents()); await w(4000); await look(0, 4, 'w3-10-serpents.jpg', 0, 6);
await go('wild3', { ch: 1, step: 0, cleared: false }, 'kadesh'); await E(() => window.__debug.SCROLL_DEFS.wild3.events.quail()); await w(6000); await look(0, 4, 'w3-2-quail.jpg', 0, 8);
await go('wild3', { ch: 11, step: 0, cleared: false }, 'moab'); await look(-23, 27, 'w3-12-donkey.jpg', 2, 4);
await look(-28, 30, 'w3-14-refuge.jpg', 0, -10);
await E(() => { const D = window.__debug; D.ST.sp.sinai2 = { ch: 9, step: 9, cleared: true }; D.ST.sp.wild3 = { ch: 15, step: 9, cleared: true }; });
await go(null, {}, 'alpha'); const mem = await E(() => { const m = window.__debug.markers.find(x => x.data.id === 'memorial'); return m ? [m.mesh.position.x, m.mesh.position.z] : [0, 0]; });
await look(mem[0], mem[1], 'alpha-pedestals.jpg', 0, 4);
console.log('오류', errs.length, errs.slice(0, 8));
await browser.close();
