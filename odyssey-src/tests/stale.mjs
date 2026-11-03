import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 480, height: 820 });
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&notype&ch=2&q=low');
await page.waitForFunction('window.__ready === true', { timeout: 150000 });
await page.waitForFunction('!window.__debug.pendingNPC', { timeout: 60000 });
const w = ms => new Promise(r => setTimeout(r, ms));
const chk = () => page.evaluate(() => window.__debug.markers.filter(m => m.data.model && !m.hidden).map(m => { const e = m.mesh.matrixWorld.elements; const dx = e[12] - m.mesh.position.x, dz = e[14] - m.mesh.position.z; return Math.hypot(dx, dz) > 0.05 ? m.data.id + '(' + Math.hypot(dx, dz).toFixed(1) + ')' : null; }).filter(Boolean).join(',') || '모두 일치');
for (const id of ['c2s2', 'c2s5', 'c2s7', 'c2s13']){
  await page.evaluate(id => { const d = window.__debug; d.player.position.set(0, 0, 25); while (d.curStep() && d.curStep().id !== id) d.advance(); }, id);
  await w(1500);
  console.log(id, '그려진 위치와 실제 위치가 어긋난 사람:', await chk());
}
await browser.close();
