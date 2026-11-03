import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 800, height: 560 });
const errors = []; page.on('pageerror', e => errors.push(e.message));
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&zone=egypt');
await page.waitForFunction('window.__ready === true', { timeout: 150000 });
await page.waitForFunction('window.__debug.pendingNPC === 0', { timeout: 60000 });
const w = ms => new Promise(r => setTimeout(r, ms));
const res = [];
for (const [x, z, yaw, key] of [[66, -42, 0, 'w'], [66, -42, 0, 's'], [66, -42, 0, 'a'], [66, -42, 0, 'd'], [60, -33, 0, 'w'], [60, -33, 0, 's'], [54, -52, 0, 'a'], [54, -52, 0, 's']]){
  await page.evaluate((x, z, yaw) => { const D = window.__debug; D.player.position.set(x, 0, z); D.setCam(yaw, 0.3); }, x, z, yaw);
  await page.keyboard.down('Shift'); await page.keyboard.down(key); await w(3000); await page.keyboard.up(key); await page.keyboard.up('Shift');
  const p = await page.evaluate(() => { const q = window.__debug.player.position; return [q.x, q.z]; });
  const inside = p[0] > 51 && p[0] < 69 && p[1] > -54 && p[1] < -30;
  res.push(`${key}@${x},${z} → ${p[0].toFixed(1)},${p[1].toFixed(1)} ${inside ? '안' : '★밖'}`);
}
console.log(res.join('\n'));
// 점프로 벽 넘기 시도
await page.evaluate(() => { const D = window.__debug; D.player.position.set(67.5, 0, -42); D.setCam(-Math.PI/2, 0.3); });
for (let i = 0; i < 6; i++){ await page.keyboard.down('d'); await page.keyboard.press('Space'); await w(500); }
await page.keyboard.up('d');
console.log('점프 후', await page.evaluate(() => { const q = window.__debug.player.position; return q.x.toFixed(1) + ',' + q.z.toFixed(1); }));
// 20초 동안 방 안/밖 NPC가 벽을 넘나드는지
const snap = () => page.evaluate(() => window.__debug.markers.filter(m => m.ai).map(m => [m.data.id, m.mesh.position.x > 51 && m.mesh.position.x < 69 && m.mesh.position.z > -54 && m.mesh.position.z < -30]));
const a = await snap(); await w(20000); const b = await snap();
const cross = a.filter(([id, i], k) => b[k][1] !== i).map(([id]) => id);
console.log('방 안 NPC', a.filter(x => x[1]).map(x => x[0]).join(','), '| 벽을 넘나든 NPC', cross.join(',') || '없음');
console.log('errors', errors.length ? errors.join('\n') : 'none');
await browser.close();
