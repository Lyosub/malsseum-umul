import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
const w = ms => new Promise(r => setTimeout(r, ms)); const dir = 'E:/temp/claude-work/tmpglb/';
const E = (f, ...a) => page.evaluate(f, ...a);
async function run(ch, zone, sid, path, shotName){
  await page.goto(`file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&ch=${ch}&body=boy&zone=${zone}`);
  await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await page.waitForFunction('!window.__debug.pendingNPC', { timeout: 90000 }); await w(1200);
  await E(sid => { const D = window.__debug; D.ST.step = D.STORY.findIndex(q => q.id === sid); }, sid); await w(600);
  console.log(sid, 'step', await E(() => window.__debug.curStep().id), 'toast', await E(() => (document.getElementById('toast') || {}).textContent));
  for (const [x, z, t] of path){
    await E(([x, z]) => { const D = window.__debug, P = D.player.position; D.setHeading(Math.atan2(x - P.x, -(z - P.z))); }, [x, z]);
    // 걷는 속도로 조금씩 옮김
    for (let k = 0; k < t; k++){ await E(([x, z, t, k]) => { const P = window.__debug.player.position; P.x += (x - P.x) / (t - k); P.z += (z - P.z) / (t - k); }, [x, z, t, k]); await w(120); }
    console.log('  player', x, z, '→', await E(() => window.__debug.followers));
  }
  await E(() => { const D = window.__debug; D.setCam(D.heading + Math.PI, 0.3); D.setZoom(1.5); }); await w(900);
  await page.screenshot({ path: dir + shotName });
  if (await E(() => !!window.__debug.dlg)) console.log('  대화 열림(도착)');
}
await run(6, 'rephidim', 'c6s7', [[-6, -6, 25], [10, -10, 30], [20, -14, 25]], 'follow-c6.png');
await w(3000);
console.log('after reach:', await E(() => window.__debug.curStep().id), await E(() => window.__debug.followers));
await run(9, 'sinai', 'c9s6', [[2, -12, 20], [-1, -6, 20]], 'follow-c9.png');
console.log('errors', errors.length ? errors.slice(0, 6) : 'none'); await browser.close();
