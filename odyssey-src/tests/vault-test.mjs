import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const errors = []; page.on('pageerror', e => errors.push(e.message));
const w = ms => new Promise(r => setTimeout(r, ms));
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&ch=3&body=boy');
await page.waitForFunction('window.__ready === true', { timeout: 150000 }); await page.waitForFunction('!window.__debug.pendingNPC', { timeout: 90000 }); await w(1500);
console.log(await page.evaluate(async () => {
  const D = window.__debug, P = D.player.position, sleep = ms => new Promise(r => setTimeout(r, ms)), out = [];
  const ring = D.obstacles.filter(o => o.h); out.push('돌담 조각 ' + ring.length + ' 높이 ' + (ring[0] && ring[0].h.toFixed(2)));
  // 우리 동쪽 바깥에서 서쪽(중심)을 향해 점프 → 안으로 넘어가야
  const cx = ring.reduce((s, o) => s + o.x, 0) / ring.length, cz = ring.reduce((s, o) => s + o.z, 0) / ring.length;
  const R = Math.hypot(ring[0].x - cx, ring[0].z - cz);
  P.set(cx + R + 1.3, 0, cz); await sleep(400); D.setHeading(Math.atan2(-1, 0)); await sleep(100);
  window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' })); await sleep(1600);
  out.push('넘은 뒤 중심까지 거리 ' + Math.hypot(P.x - cx, P.z - cz).toFixed(2) + ' (담 반지름 ' + R.toFixed(2) + ' 보다 작아야)');
  // 다시 밖으로
  D.setHeading(Math.atan2(1, 0)); P.set(cx + R - 1.2, P.y, cz); await sleep(400);
  window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' })); await sleep(1600);
  out.push('다시 나온 뒤 거리 ' + Math.hypot(P.x - cx, P.z - cz).toFixed(2));
  out.push('마을 사람 수 ' + D.markers.filter(m => m.ai).length + ' · 제자리 ' + D.markers.filter(m => m.ai && m.ai.persona.still).length);
  return out.join('\n');
}));
console.log('errors', errors.length ? errors.join('\n') : 'none');
await browser.close();
