import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
const w = ms => new Promise(r => setTimeout(r, ms)); const dir = 'E:/temp/claude-work/tmpglb/';
const E = (f, ...a) => page.evaluate(f, ...a);
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&ch=10&body=boy&zone=alpha');
await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await page.waitForFunction('!window.__debug.pendingNPC', { timeout: 90000 }); await w(1200);
const real = await E(() => Date.now());
for (let k = 0; k < 3; k++){
  await E(([real, k]) => { const base = real; const wk = Math.floor((Math.floor((base + 9 * 3600e3) / 864e5) + 3) / 7); const want = (3 - wk % 3 + k) % 3; Date.now = () => base + want * 7 * 864e5; }, [real, k]);
  await E(() => { const d = window.__debug, m = d.markers.find(x => x.data.id === 'course'); const p = m.mesh.position; d.player.position.set(p.x + 0.8, 0, p.z + 0.6); }); await w(800);
  if (k === 0) console.log('버튼:', await page.$eval('#interact-btn', e => e.textContent));
  await E(() => document.getElementById('interact-btn').click()); await w(400);
  console.log('안내:', (await page.$eval('#mg-info', e => e.innerText)).slice(0, 60));
  await E(() => document.getElementById('mg-act').click()); await w(500);
  const c = await E(() => window.__debug.course); console.log('코스', c.kind, '고리', c.n);
  if (k === 0){ await E(() => { const D = window.__debug; D.player.position.set(30, 0, 30); D.setCam(Math.PI, 0.6); D.setZoom(2.6); }); await w(1500); await page.screenshot({ path: dir + 'course-a.png' }); }
  // 첫 상자 고리: 실제로 점프해서 올라서 보기
  const firstBox = c.rings.findIndex(r => r[1] > 0.3);
  for (let i = 0; i < c.n; i++){
    const [x, y, z] = c.rings[i];
    if (i === firstBox){
      await E(([x, z]) => { const D = window.__debug; D.player.position.set(x, 0, z + 1.6); D.setHeading(0); }, [x, z]); await w(500);
      await E(() => { const b = document.getElementById('jump-btn'); b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); b.dispatchEvent(new TouchEvent('touchstart', { bubbles: true })); b.click(); }); await w(1600);
      console.log('  점프로 상자 오르기: y=', (await E(() => window.__debug.player.position.y)).toFixed(2), '상자 윗면', y.toFixed(2), '진행', (await E(() => window.__debug.course)).i);
      if ((await E(() => window.__debug.course)).i > i) continue;
    }
    await E(([x, y, z]) => { const D = window.__debug; D.player.position.set(x, y, z); }, [x, y, z]); await w(350);
  }
  await w(800);
  console.log('  끝:', await E(() => window.__debug.course.i), 'HUD', await page.$eval('#hud-challenge', e => e.className), 'best', JSON.stringify(await E(() => window.__debug.ST.best)));
}
console.log('badge', await E(() => window.__debug.ST.badges.includes('wild_runner')), 'boxes left', await E(() => window.__debug.boxes.filter(b => b.x > 24 && b.z > 11).length));
console.log('errors', errors.length ? errors.slice(0, 6) : 'none'); await browser.close();
