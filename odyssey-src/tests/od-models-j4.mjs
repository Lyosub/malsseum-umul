// 2·3·4편 새 인물 모델이 실제로 불러와지는지(그리고 아론 대제사장 옷 바꿔 끼우기) 확인
import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11', '--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 900, height: 500 });
const errs = []; page.on('response', r => { if (r.status() >= 400) console.log('404', r.url()); }); page.on('pageerror', e => errs.push(e.message.slice(0, 160))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)); });
const w = ms => new Promise(r => setTimeout(r, ms)); const E = (f, ...a) => page.evaluate(f, ...a);
await page.goto('http://localhost:8768/odyssey/index.html?reset&notype&notut&body=boy&devscroll', { waitUntil: 'domcontentloaded' });
await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await w(2000);
const NEW = /^(pr-|w3-)/;
async function visit(scroll, sp, zone, spawn, ids){
  await E((scroll, sp) => { const D = window.__debug; D.ST.cleared = true; D.enterScroll(scroll); D.ST.sp[scroll] = Object.assign(D.ST.sp[scroll] || {}, sp); }, scroll, sp);
  await w(1500);
  await E((zone, spawn) => window.__debug.travelTo({ id: 'test', to: zone, spawn }), zone, spawn);
  await page.waitForFunction(z => window.__debug.zone === z && !window.__debug.pendingNPC, { timeout: 120000 }, zone); await w(4000);
  // 가까운 사람부터 불러오므로 확인할 사람 곁으로 차례로 가 본다
  for (const id of ids){
    await E(id => { const D = window.__debug, m = D.markers.find(x => x.data.id === id); if (m){ D.player.position.set(m.mesh.position.x + 1.5, D.player.position.y, m.mesh.position.z + 1.5); } }, id).catch(() => {});
    await w(2500);
  }
  return E((ids) => window.__debug.markers.filter(m => ids.includes(m.data.id)).map(m => `${m.data.id}=${m.loadedModel || '-'}${m.model ? '' : '(안 붙음)'}${m.hidden ? '(숨김)' : ''}`).join(' '), ids);
}
console.log('4편 1장 모압:', await visit('joshua', { ch: 0, step: 0, cleared: false }, 'moab', [0, 0], ['j4_east']));
console.log('4편 2장 길갈:', await visit('joshua', { ch: 1, step: 3, cleared: false }, 'gilgal', [0, 0], ['j4_rahab', 'j4_spies', 'j4_spies_b']));
console.log('4편 6장 길갈:', await visit('joshua', { ch: 5, step: 5, cleared: false }, 'gilgal', [0, 0], ['j6_rahab_out']));
console.log('4편 9장 길갈:', await visit('joshua', { ch: 8, step: 2, cleared: false }, 'gilgal', [0, 0], ['j9_gibeonites']));
console.log('4편 13장 실로:', await visit('joshua', { ch: 12, step: 2, cleared: false }, 'shiloh', [0, 0], ['j13_east', 'j13_envoys']));
console.log('오류', errs.length, errs.slice(0, 5));
await browser.close();
