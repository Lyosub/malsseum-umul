import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage();
const ids = ['quest-panel','minimap','zoom-ctrl','hud-btns','tut','interact-btn','run-btn','jump-btn','joystick-zone','compass','skill-bar','btn-menu'];
const w = ms => new Promise(r => setTimeout(r, ms));
for (const [W, H] of [[844, 390], [740, 360], [915, 412], [667, 375], [800, 360]]){
  await page.setViewport({ width: W, height: H, isMobile: true, hasTouch: true });
  await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset');
  await page.waitForFunction('window.__ready === true', { timeout: 150000 });
  await page.evaluate(() => { document.getElementById('pick-modal').classList.add('hidden'); document.getElementById('interact-btn').classList.remove('hidden'); document.getElementById('tut').classList.remove('hidden'); document.getElementById('compass').style.opacity = '1'; const sb = document.getElementById('skill-bar'); sb.innerHTML = '<div class="skill-btn"><span class="ico">🦯</span>지팡이</div>'; }); await w(600);
  const boxes = await page.evaluate(ids => ids.map(id => { const e = document.getElementById(id); const r = e.getBoundingClientRect(); return [id, r.left, r.top, r.right, r.bottom, getComputedStyle(e).display !== 'none']; }), ids);
  const ov = []; for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++){ const a = boxes[i], b = boxes[j]; if (!a[5] || !b[5]) continue; const x = Math.min(a[3], b[3]) - Math.max(a[1], b[1]), y = Math.min(a[4], b[4]) - Math.max(a[2], b[2]); if (x > 1 && y > 1) ov.push(`${a[0]}×${b[0]}(${x.toFixed(0)}x${y.toFixed(0)})`); }
  console.log(`${W}x${H} 겹침:`, ov.join(', ') || '없음', '| 화면 밖:', boxes.filter(b => b[5] && (b[1] < 0 || b[3] > W || b[4] > H || b[2] < 0)).map(b => b[0]).join(',') || '없음');
  if (W === 844) await page.screenshot({ path: 'E:/temp/claude-work/tmpglb/ui-land.png' });
}
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true }); await w(800);
console.log('세로일 때 안내 표시:', await page.evaluate(() => getComputedStyle(document.getElementById('rotate')).display));
await page.screenshot({ path: 'E:/temp/claude-work/tmpglb/ui-port.png' });
await browser.close();
