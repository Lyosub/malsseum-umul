import puppeteer from 'puppeteer-core';
for (const rate of [6, 2]){
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu','--ignore-gpu-blocklist'] });
  const page = await browser.newPage(); await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  const cdp = await page.createCDPSession(); await cdp.send('Emulation.setCPUThrottlingRate', { rate });
  await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?fps&reset&zone=egypt');
  await page.waitForFunction('window.__ready === true', { timeout: 150000 });
  await page.evaluate(() => { const D = window.__debug; D.player.position.set(2, 0, 2); });
  const log = [];
  for (let i = 0; i < 14; i++){ await new Promise(r => setTimeout(r, 2500)); log.push(await page.evaluate(() => window.__debug.quality)); }
  console.log(`CPU x${rate}:`, [...new Set(log)].join(' → '), '| 마지막', await page.evaluate(() => document.getElementById('perf').textContent));
  await browser.close();
}
