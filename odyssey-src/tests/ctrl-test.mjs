import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
const w = ms => new Promise(r => setTimeout(r, ms)); const dir = 'E:/temp/claude-work/tmpglb/';
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&body=boy');
await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await w(2500);
await page.evaluate(() => document.getElementById('tut-skip') && document.getElementById('tut-skip').click()); await w(500);
const rect = sel => page.$eval(sel, e => { const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)].join(','); });
console.log('조이스틱', await rect('#joystick-zone'), '| 버튼묶음', await rect('#action-cluster'), '| 잡는곳', await rect('#joy-hit'));
await page.screenshot({ path: dir + 'ctrl-layout.png' });
const cdp = await page.createCDPSession();
const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y, id]) => ({ x, y, id })) });
// 1) 왼쪽 아래 아무 곳(조이스틱 원 밖)을 누르고 위로 밀기 → 앞으로
const p0 = await page.evaluate(() => { const p = window.__debug.player.position; return [p.x, p.z]; });
await touch('touchStart', [[200, 250, 1]]); await w(50);
await touch('touchMove', [[200, 190, 1]]);
await w(1500);
const p1 = await page.evaluate(() => { const p = window.__debug.player.position; return [p.x, p.z]; });
console.log('떠 있는 조이스틱으로 이동 거리:', Math.hypot(p1[0] - p0[0], p1[1] - p0[1]).toFixed(2), '(걷기 1.5초 ≈ 3.9)');
// 2) 걷는 중에 오른쪽 화면을 두 번째 손가락으로 끌기 → 시점 회전
const y0 = await page.evaluate(() => window.__debug.camYaw);
await touch('touchMove', [[200, 190, 1], [560, 150, 2]]);
await touch('touchStart', [[200, 190, 1], [560, 150, 2]]); await w(50);
for (let k = 1; k <= 8; k++){ await touch('touchMove', [[200, 190, 1], [560 + k * 20, 150, 2]]); await w(30); }
await touch('touchEnd', [[200, 190, 1]]); await w(300);
const y1 = await page.evaluate(() => window.__debug.camYaw);
const p2 = await page.evaluate(() => { const p = window.__debug.player.position; return [p.x, p.z]; });
console.log('걸으면서 시점 회전량:', (y1 - y0).toFixed(2), '| 그동안 계속 걸음:', Math.hypot(p2[0] - p1[0], p2[1] - p1[1]).toFixed(2));
await touch('touchEnd', []); await w(500);
// 3) 담넘기·벽타기: 올라설 수 있는 낮은 상자와 못 올라서는 낮은 담 찾아 시험
const res = await page.evaluate(async () => {
  const D = window.__debug, out = [], P = D.player.position, sleep = ms => new Promise(r => setTimeout(r, ms));
  for (const want of [true, false]){
    const b = D.boxes.find(b => !!b.stand === want && b.top - 0 > 0.6 && b.top < 2.7 && b.hx < 3 && b.hz < 3);
    if (!b){ out.push((want ? '올라서기' : '넘기') + ': 대상 없음'); continue; }
    // 상자 앞(로컬 +x 쪽)에서 상자를 향하게
    const c = Math.cos(b.rot), s = Math.sin(b.rot), d = b.hx + 0.75;
    const x = b.x + d * c, z = b.z - d * s;   // 로컬 (d,0) → 월드
    P.set(x, 0, z); await sleep(300);
    const hdg = Math.atan2(b.x - x, -(b.z - z)); D.setHeading(hdg); await sleep(100);
    const before = [P.x, P.y, P.z];
    window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' })); await sleep(60);
    const started = !!D.climb; await sleep(1500);
    out.push(`${want ? '올라서기' : '넘기'}: 시작 ${started} · 높이 ${(b.top).toFixed(2)} · 전 y ${before[1].toFixed(2)} → 후 y ${P.y.toFixed(2)} · 이동 ${Math.hypot(P.x - before[0], P.z - before[2]).toFixed(2)}`);
  }
  return out.join('\n');
});
console.log(res);
await page.screenshot({ path: dir + 'ctrl-climb.png' });
console.log('errors', errors.length ? errors.join('\n') : 'none');
await browser.close();
