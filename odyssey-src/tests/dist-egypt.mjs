import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 480, height: 820, isMobile: true, hasTouch: true });
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
const cdp = await page.target().createCDPSession();
await cdp.send('Network.enable'); await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
// 휴대폰 데이터(느린 LTE 정도): 내려받기 초당 1MB, 지연 80ms
await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 80, downloadThroughput: 1024 * 1024, uploadThroughput: 256 * 1024 });
let bytes = 0; page.on('response', async r => { if (r.status() >= 400) console.log('404:', r.url()); try { bytes += (await r.buffer()).length; } catch (e) {} });
const t0 = Date.now();
await page.goto('http://localhost:8765/index.html?reset&zone=egypt');
await page.waitForFunction('window.__ready === true', { timeout: 180000 });
const tReady = Date.now() - t0;
console.log(`애굽에서 시작: 게임 시작까지 ${(tReady/1000).toFixed(1)}초, 받은 양 ${(bytes/1048576).toFixed(2)}MB, 대기 중인 마을 사람 ${await page.evaluate(() => window.__debug.pendingNPC)}명`);
const seen = [];
for (let i = 0; i < 40; i++){ const n = await page.evaluate(() => window.__debug.pendingNPC); seen.push(n); if (n === 0) break; await new Promise(r => setTimeout(r, 1000)); }
console.log(`마을 사람 모두 나타남: 시작 후 ${seen.length}초 (남은 인원 변화 ${seen.join(',')}), 전체 받은 양 ${(bytes/1048576).toFixed(2)}MB`);
const d = await page.evaluate(() => { const D = window.__debug; return D.markers.filter(m => m.data.lazy).map(m => Math.hypot(m.mesh.position.x - D.player.position.x, m.mesh.position.z - D.player.position.z).toFixed(0)).join(','); });
console.log('마을 사람 거리', d);
// 이야기 진행이 되는지: 모세에게 가서 대화
console.log('errors', errors.length ? errors.join('\n') : 'none');
await browser.close();
