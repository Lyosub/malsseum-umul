// NPC 떨림 측정: 걷는 NPC의 바라보는 방향이 프레임마다 얼마나 좌우로 흔들리는지(방향 반전 횟수)
import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 600, height: 400 });
for (const z of ['alpha', 'midian']){
  await page.goto(`file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&zone=${z}`);
  await page.waitForFunction('window.__ready === true', { timeout: 90000 });
  await page.evaluate(() => window.__debug.player.position.set(0, 0, 45));
  const r = await page.evaluate(() => new Promise(res => {
    const d = window.__debug, prev = {}, prevD = {}; let flips = 0, samples = 0, n = 0;
    const tick = () => {
      for (const m of d.markers){ if (!m.ai || m.ai.state !== 'walk' && m.ai.state !== 'walkToChat') { delete prev[m.data.id]; continue; }
        const y = m.yaw, p = prev[m.data.id];
        if (p !== undefined){ let dy = y - p; while (dy > Math.PI) dy -= 2*Math.PI; while (dy < -Math.PI) dy += 2*Math.PI;
          const pd = prevD[m.data.id]; if (pd !== undefined && Math.abs(dy) > 0.02 && Math.abs(pd) > 0.02 && Math.sign(dy) !== Math.sign(pd)) flips++;
          prevD[m.data.id] = dy; samples++; }
        prev[m.data.id] = y; }
      if (++n < 60 * 25) requestAnimationFrame(tick); else res({ flips, samples });
    }; tick();
  }));
  console.log(z, '걷는 동안 방향 좌우 반전', r.flips, '/', r.samples, '샘플 =', (r.flips / r.samples * 100).toFixed(2) + '%');
}
await browser.close();
