// 위치 떨림: 걷는 NPC의 이동 방향(프레임 간 변위)이 급격히 꺾이는 횟수
import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 600, height: 400 });
for (const z of ['alpha','midian']){
  await page.goto(`file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&zone=${z}`);
  await page.waitForFunction('window.__ready === true', { timeout: 90000 });
  await page.evaluate(() => window.__debug.player.position.set(0, 0, 45));
  const r = await page.evaluate(() => new Promise(res => {
    const d = window.__debug, prev = {}, pv = {}; let sharp = 0, samples = 0, n = 0; var corner = 0;
    const tick = () => { for (const m of d.markers){ if (!m.ai) continue; const id = m.data.id, p = m.mesh.position;
        if (prev[id]){ const vx = p.x - prev[id][0], vz = p.z - prev[id][1], l = Math.hypot(vx, vz);
          if (l > 1e-3){ if (pv[id]){ const c = (vx*pv[id][0] + vz*pv[id][1]) / (l * Math.hypot(...pv[id])); if (c < 0.5){ const near = d.markers.some(o => o !== m && o.ai && Math.hypot(o.mesh.position.x - p.x, o.mesh.position.z - p.z) < 1.8); if (near) sharp++; else corner = (typeof corner==='number'?corner:0)+1; } samples++; } pv[id] = [vx, vz]; } }
        prev[id] = [p.x, p.z]; }
      if (++n < 60 * 25) requestAnimationFrame(tick); else res({ sharp, samples, corner }); }; tick(); }));
  console.log(z, '사람과 엇갈리며 급꺾임', r.sharp, '/', r.samples, '=', (r.sharp / r.samples * 100).toFixed(2) + '%', '| 길 모퉁이 꺾임', r.corner);
}
await browser.close();
