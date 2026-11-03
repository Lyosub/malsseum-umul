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
const inScene = names => E(names => { const D = window.__debug, T = D.propTemplates || {}; const out = {};
  const geos = {}; names.forEach(n => { const t = T[n]; if (!t) { out[n] = '템플릿 없음'; return; } const s = new Set(); t.holder.traverse(o => { if (o.isMesh) s.add(o.geometry.uuid); }); geos[n] = s; out[n] = 0; });
  D.zoneRoot.traverse(o => { if (o.isMesh) for (const n in geos) if (geos[n].has(o.geometry.uuid)) out[n]++; }); return JSON.stringify(out); }, names);
await E(() => { window.__debug.ST.sp.judges = { ch: 11, step: 4, cleared: true }; });
await go('ruth', { ch: 7, step: 3, cleared: false }, 'philistia'); await w(4000); console.log('6편 8장', await inScene(['cart', 'milk-cow', 'ark']));
await go('ruth', { ch: 5, step: 2, cleared: false }, 'shiloh'); await w(4000); console.log('6편 6장', await inScene(['lamp']));
await go('ruth', { ch: 3, step: 1, cleared: false }, 'bethlehem'); await w(4000); console.log('6편 4장', await inScene(['sandal', 'barley-sheaf', 'grain-field']));
await E(() => { const D = window.__debug; D.ST.sp.ruth = { ch: 8, step: 3, cleared: true }; });
await go('ruth', { ch: 8, step: 3, cleared: true }, 'gibeon'); await w(4000); console.log('6편 9장 끝', await inScene(['ebenezer-stone']));
await go(null, {}, 'alpha'); await w(4000); console.log('받침대', await inScene(['ebenezer-stone-sm', 'jar-torch-sm']));
console.log('오류', errs.length, errs.slice(0, 6));
await browser.close();
