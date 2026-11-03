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
console.log('2편 3장 옷 전:', await visit('sinai2', { ch: 2, step: 1, cleared: false }, 'sinai', [15, -10], ['aaron']));
await E(() => { const D = window.__debug; D.ST.sp.sinai2.step = 2; D.applyWorld(); }); await w(4000);
console.log('2편 3장 옷 뒤(그 자리 교체):', await E(() => window.__debug.markers.filter(m => m.data.id === 'aaron').map(m => `${m.data.id}=${m.loadedModel}${m.model ? '' : '(안 붙음)'} 동작:${Object.keys(m.actions).join('/')}`).join(' ')));
console.log('2편 4장:', await visit('sinai2', { ch: 3, step: 0, cleared: false }, 'sinai', [15, -10], ['aaron', 'lv_nadab', 'lv_abihu', 'lv_eleazar', 'lv_ithamar']));
const ids = await E(() => window.__debug.markers.filter(m => m.data.model).map(m => m.data.id + ':' + m.data.model).join(' '));
console.log('  sinai 사람들:', ids);
console.log('3편 1장 가데스:', await visit('wild3', { ch: 1, step: 0 }, 'kadesh', [0, 0], ['aaron', 'kd_hobab', 'kd_caleb']));
console.log('  kadesh 사람들:', await E(() => window.__debug.markers.filter(m => m.data.model && /^(pr-|w3-)|aaron/.test(m.loadedModel || m.data.model)).map(m => m.data.id + ':' + (m.loadedModel || m.data.model) + (m.model ? '' : '(안 붙음)')).join(' ')));
console.log('3편 12장 모압:', await visit('wild3', { ch: 12, step: 0 }, 'moab', [0, 0], ['mb_daughters', 'mb_d_noah', 'mb_d_hoglah', 'mb_d_milcah', 'mb_d_tirzah']));
console.log('  moab 새 모델:', await E(() => window.__debug.markers.filter(m => /^(pr-|w3-)/.test(m.data.model || '')).map(m => m.data.id + ':' + (m.loadedModel || '-') + (m.model ? '' : '(안 붙음)') + (m.hidden ? '(숨김)' : '')).join(' ')));
console.log('4편 12장 실로:', await visit('joshua', { ch: 12, step: 1 }, 'shiloh', [0, 0], ['j12_daughters']));
console.log('오류', errs.length, errs.slice(0, 5));
await browser.close();
