import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=d3d11','--enable-gpu'] });
const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/favicon|404/.test(m.text())) errors.push(m.text()); });
const cdp = await page.target().createCDPSession(); await cdp.send('Network.enable'); await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 80, downloadThroughput: 1024 * 1024, uploadThroughput: 256 * 1024 });
await page.goto('file:///E:/temp/claude-work/exodus-game/prototype-standalone.html?reset&body=boy');
await page.waitForFunction('window.__ready === true', { timeout: 150000 });
const w = ms => new Promise(r => setTimeout(r, ms)); const t0 = Date.now();
const st = async l => console.log(((Date.now() - t0) / 1000).toFixed(0).padStart(3) + 's', l.padEnd(10), '| 단계', await page.evaluate(() => window.__debug.tut), '|', await page.$eval('#tut-t', e => e.textContent), '|', await page.$eval('#tut-n', e => e.textContent));
await w(1500); await st('시작');
await page.screenshot({ path: 'E:/temp/claude-work/tmpglb/tut-1.png' });
const until = async (n, act, label) => { for (let k = 0; k < 12 && (await page.evaluate(() => window.__debug.tut)) <= n && (await page.evaluate(() => window.__debug.tut)) !== -1; k++) await act(); await w(1100); await st(label); };
await until(0, async () => { await page.keyboard.down('w'); await w(800); await page.keyboard.up('w'); }, '걷기 후');
await until(1, async () => { await page.keyboard.down('Shift'); await page.keyboard.down('w'); await w(900); await page.keyboard.up('w'); await page.keyboard.up('Shift'); }, '달리기 후');
await page.screenshot({ path: 'E:/temp/claude-work/tmpglb/tut-2.png' });
await until(2, async () => { await page.keyboard.press('Space'); await w(900); }, '점프 후');
await until(3, async () => { await page.keyboard.down('q'); await w(700); await page.keyboard.up('q'); }, '둘러보기 후');
await until(4, async () => { await page.evaluate(() => document.getElementById('zoom-in').click()); await w(400); }, '확대 후');
await until(5, async () => { await page.evaluate(() => document.getElementById('btn-menu').click()); await w(500); await page.mouse.click(400, 300); await w(300); }, '메뉴 후');
await page.screenshot({ path: 'E:/temp/claude-work/tmpglb/tut-q.png' });
await until(6, async () => { await page.evaluate(() => { document.getElementById('btn-menu').click(); document.getElementById('btn-shop').click(); }); await w(1200); await page.screenshot({ path: 'E:/temp/claude-work/tmpglb/tut-shop.png' }); await page.evaluate(() => document.querySelector('#shop-modal .close').click()); await w(500); }, '상점 후');
await until(7, async () => { await page.evaluate(() => document.getElementById('quest-panel').click()); await w(500); }, '퀘스트 후');
// 안내자에게 말 걸기
await page.evaluate(() => { const D = window.__debug, m = D.markers.find(k => k.data.id === 'guide'); D.player.position.set(m.mesh.position.x + 1.2, 0, m.mesh.position.z + 1); }); await w(800);
await page.evaluate(() => document.getElementById('interact-btn').click()); await w(300);
for (let k = 0; k < 60; k++){ const open = await page.evaluate(() => !!window.__debug.dlg); if (!open) break; await page.evaluate(() => { const c = document.querySelector('#dlg-choices button'); if (c) c.click(); else document.getElementById('dlg-next').click(); }); await w(700); }
await w(2500); await st('대화 후');
for (let i = 0; i < 30 && !(await page.evaluate(() => { const [a, b] = window.__debug.prefetch.split('/').map(Number); return b && a >= b; })); i++) await w(2000);
console.log('미리 받기', await page.evaluate(() => window.__debug.prefetch), '— 시작 후', ((Date.now() - t0) / 1000).toFixed(0), '초');
// 미디안으로 이동 시간(이미 받아 둠)
await page.evaluate(() => { const D = window.__debug; D.travelTo(D.markers.find(m => m.data.to === 'midian').data); });
const t1 = Date.now(); await page.waitForFunction('window.__debug.zone === "midian"', { timeout: 60000 });
console.log('미디안 이동', ((Date.now() - t1) / 1000).toFixed(1), '초');
console.log('errors', errors.length ? errors.join('\n') : 'none');
await browser.close();
