import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 520, height: 700 });
const w = ms => new Promise(r => setTimeout(r, ms)); const dir = 'E:/temp/claude-work/exodus-game/stage1/fx/';
const errors = []; page.on('pageerror', e => errors.push(e.message));
const view = async (zone, x, z, yaw, pitch, zoom, name) => {
  await page.goto(`file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&zone=${zone}`);
  await page.waitForFunction('window.__ready === true', { timeout: 90000 });
  await page.evaluate(() => ['hint','joystick-zone','action-cluster','zoom-ctrl'].forEach(i => document.getElementById(i).style.visibility = 'hidden'));
  await page.evaluate((x, z, y, p, zm) => { const d = window.__debug; d.player.position.set(x, 0, z); d.setCam(y, p); d.setZoom(zm); }, x, z, yaw, pitch, zoom);
  await w(2500); await page.screenshot({ path: dir + name });
};
await view('alpha', 2, 9, 0.2, 0.18, 1.3, '1-alpha-sky.png');
await view('midian', 2, 6, -0.3, 0.2, 1.4, '2-midian-sky.png');
await view('egypt', 20, 6, -0.6, 0.16, 1.5, '3-egypt-sky.png');
// 공간이동 연출 중간 장면
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset');
await page.waitForFunction('window.__ready === true', { timeout: 90000 });
await page.evaluate(() => { const d = window.__debug; while (d.curStep().id !== 's2') d.advance(); const m = d.markers.find(x => x.data.id === 'to-midian').mesh.position; d.player.position.set(m.x, 0, m.z + 2); d.setCam(0.3, 0.35); });
await w(1200);
await page.evaluate(() => document.getElementById('interact-btn').click());
await w(550); await page.screenshot({ path: dir + '4-warp-out.png' });
await page.waitForFunction('window.__debug.zone==="midian"', { timeout: 60000 }); await w(300);
await page.screenshot({ path: dir + '5-warp-in.png' });
console.log('errors', errors.length ? errors.join('\n') : 'none');
await browser.close();
